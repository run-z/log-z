import ts from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';
import flatDts from 'rollup-plugin-flat-dts';
import unbundle from 'rollup-plugin-unbundle';
import { resolveRootPackage } from 'rollup-plugin-unbundle/api';
import typescript from 'typescript';

const resolutionRoot = resolveRootPackage();

export default defineConfig({
  input: {
    'log-z': './src/index.ts',
    'log-z.node': './src/node/index.ts',
  },
  plugins: [
    unbundle({
      resolutionRoot,
    }),
    ts({
      typescript,
      tsconfig: 'tsconfig.main.json',
      cacheDir: 'target/.rts_cache',
    }),
  ],
  output: {
    format: 'esm',
    sourcemap: true,
    dir: '.',
    entryFileNames: 'dist/[name].js',
    chunkFileNames: 'dist/_[name].js',
    manualChunks(id) {
      const module = resolutionRoot.resolveImport(id);
      const host = module.host;

      if (host?.name === '@run-z/log-z') {
        const path = module.uri.slice(host.uri.length + 1);

        if (path.startsWith('src/node')) {
          return 'log-z.node';
        }
      }

      return 'log-z';
    },
    hoistTransitiveImports: false,
    plugins: [
      flatDts({
        tsconfig: 'tsconfig.main.json',
        lib: true,
        file: './dist/log-z.d.ts',
        compilerOptions: {
          declarationMap: true,
        },
        entries: {
          node: {
            file: './dist/log-z.node.d.ts',
          },
        },
        internal: ['**/impl/**', '**/*.impl.ts'],
      }),
    ],
  },
});
