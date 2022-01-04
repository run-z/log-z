import { describe, expect, it } from '@jest/globals';
import { Writable } from 'node:stream';
import { TestWritable } from '../spec';
import { streamWriter } from './stream-writer.impl';

describe('streamWriter', () => {
  it('writes to stream', async () => {

    const out = new TestWritable();
    const writer = streamWriter(out);

    expect(await writer('abc')()).toBe(true);

    expect(out.chunks).toEqual(['abc']);
  });
  it('awaits for stream draining', async () => {

    let write!: () => void;
    const whenWritten = new Promise<void>(resolve => {
      write = resolve;
    });

    class DelayedWritable extends TestWritable {

      override _write(chunk: unknown, encoding: string, callback: (error?: (Error | null)) => void): void {
        // eslint-disable-next-line jest/valid-expect-in-promise
        super._write(chunk, encoding, () => void 0);
        whenWritten.then(() => callback()).catch(callback);
      }

    }

    const out = new DelayedWritable({ highWaterMark: 2, objectMode: true });
    const writer = streamWriter(out);

    expect(await writer('abc')()).toBe(true);

    const promise1 = writer('def')();
    const promise2 = writer('!')();

    expect(out.chunks).toEqual(['abc']);
    write();

    expect(await promise1).toBe(true);
    expect(await promise2).toBe(true);
    expect(out.chunks).toEqual(['abc', 'def', '!']);
  });
  it('reports write error', async () => {

    const error = new Error('Test');

    class ErrorWritable extends Writable {

      override _write(_chunk: unknown, _encoding: string, callback: (error?: (Error | null)) => void): void {
        Promise.reject(error).catch(callback);
      }

    }

    const out = new ErrorWritable();
    const onError = new Promise(resolve => {
      out.once('error', resolve);
    });

    const writer = streamWriter(out);
    const whenWritten = writer('abc');

    await onError;

    expect(await whenWritten().catch(e => e)).toBe(error);
  });
});
