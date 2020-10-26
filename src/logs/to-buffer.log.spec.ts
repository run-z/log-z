import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogBuffer } from './log-buffer';
import { logZToBuffer } from './to-buffer.log';

describe('logZToBuffer', () => {

  let buffer: ZLogBuffer;
  let promises: Promise<any>[];
  let logged: any[];

  beforeEach(() => {
    buffer = logZToBuffer();
    promises = [];
    logged = [];
  });
  afterEach(async () => {
    await buffer.end();
  });

  it('discards oldest messages on buffer overflow', async () => {
    logMessages(258);

    await Promise.race(promises);

    expect(logged).toEqual([false, false]);
  });

  describe('end', () => {
    it('discards all buffered messages', async () => {
      logMessages(3);

      await buffer.end();

      expect(logged).toEqual([false, false, false]);
    });
  });

  function logMessages(numMessages: number): void {
    for (let i = 0; i < numMessages; ++i) {
      buffer.record(zlogMessage(ZLogLevel.Error, i.toString(10)));
      // eslint-disable-next-line jest/valid-expect-in-promise
      promises.push(
          buffer.whenLogged().then(
              ok => logged.push(ok),
              error => logged.push(error),
          ),
      );
    }
  }

});
