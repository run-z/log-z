import * as os from 'os';
import { levelZLogField, messageZLogField } from '../fields';
import { textZLogFormatter } from '../formats';
import { logZBy } from '../log-by';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { TestWritable } from '../spec';
import { logZToStream } from './to-stream.log';

describe('logZToStream', () => {

  it('formats message', async () => {

    const out = new TestWritable();
    const logger = logZBy(logZToStream(out));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual([`[INFO ] TEST${os.EOL}`, `[ERROR] ERROR${os.EOL}`]);
  });
  it('formats message with custom format', async () => {

    const out = new TestWritable();
    const logger = logZBy(logZToStream(
        out,
        {
          format: { fields: [levelZLogField(), ' ', messageZLogField(), '!'] },
        },
    ));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual([`[INFO ] TEST!${os.EOL}`, `[ERROR] ERROR!${os.EOL}`]);
  });
  it('formats message by custom formatter', async () => {

    const out = new TestWritable();
    const logger = logZBy(logZToStream(
        out,
        {
          format: textZLogFormatter({ fields: [levelZLogField(), ' ', messageZLogField(), '!'] }),
        },
    ));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual([`[INFO ] TEST!${os.EOL}`, `[ERROR] ERROR!${os.EOL}`]);
  });
  it('discards message if formatter returned `undefined`', async () => {

    const out = new TestWritable();
    const logger = logZBy(logZToStream(
        out,
        {
          format: () => void 0,
        },
    ));

    logger.info('TEST');

    expect(await logger.whenLogged()).toBe(false);

    expect(out.chunks).toHaveLength(0);
  });
  it('separates log lines with specified EOL symbol', async () => {

    const out = new TestWritable();
    const logger = logZBy(logZToStream(
        out,
        {
          eol: '!!!\n',
        },
    ));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual(['[INFO ] TEST!!!\n', '[ERROR] ERROR!!!\n']);
  });
  it('writes message as is in object mode', async () => {

    const out = new TestWritable({ objectMode: true });
    const logger = logZBy(logZToStream(out));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual([
      zlogMessage(ZLogLevel.Info, 'TEST'),
      zlogMessage(ZLogLevel.Error, 'ERROR'),
    ]);
  });
  it('stops logging when stream finished', async () => {

    const out = new TestWritable({ objectMode: true });
    const logger = logZBy(logZToStream(out));

    await new Promise(resolve => {
      out.end(resolve);
    });

    expect(await logger.end()).toBeUndefined();
  });
  it('does not log if the stream is ended already', async () => {

    const out = new TestWritable({ objectMode: true });

    out.end();

    const logger = logZBy(logZToStream(out));

    logger.info('TEST');
    expect(await logger.whenLogged()).toBe(false);
    expect(await logger.end()).toBeUndefined();
  });

  describe('end', () => {
    it('stops logging', async () => {

      const out = new TestWritable({ objectMode: true });
      const logger = logZBy(logZToStream(out));

      await logger.end();

      logger.info('TEST');

      expect(await logger.whenLogged()).toBe(false);
      expect(out.chunks).toHaveLength(0);
      expect(out.writableFinished).toBe(true);
    });
    it('does nothing after the second time', async () => {

      const out = new TestWritable({ objectMode: true });
      const logger = logZBy(logZToStream(out));
      const whenEnded = logger.end();

      expect(logger.end()).toBe(whenEnded);
      expect(await whenEnded).toBeUndefined();
    });
  });

});
