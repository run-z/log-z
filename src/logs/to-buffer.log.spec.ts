import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { itsElements, itsFirst } from '@proc7ts/push-iterator';
import { ZLogLevel } from '../log-level';
import { ZLogMessage, zlogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogBuffer } from './log-buffer';
import { logZToBuffer } from './to-buffer.log';

describe('logZToBuffer', () => {

  let buffer: ZLogBuffer;
  let promises: Promise<any>[];
  let logged: [number, any][];

  beforeEach(() => {
    buffer = logZToBuffer();
    promises = [];
    logged = [];
  });
  afterEach(async () => {
    await buffer.end();
  });

  let messageSeq: number;

  beforeEach(() => {
    messageSeq = 0;
  });

  it('discards oldest messages on buffer overflow', async () => {
    logMessages(1026);

    await Promise.race(promises);

    expect(logged).toEqual([[0, false], [1, false]]);
  });
  it('reports buffer contents', async () => {

    const reported: string[][] = [];

    buffer = logZToBuffer({
      atMost: 3,
      onRecord(_newEntry, contents) {
        reported.push(itsElements(contents, ({ message: { text } }) => text));
      },
    });

    logMessages(5);
    await Promise.race(promises);
    expect(logged).toEqual([[0, false], [1, false]]);
    expect(reported).toEqual([
        [],
        ['0'],
        ['0', '1'],
        ['0', '1', '2'],
        ['1', '2', '3'],
    ]);
  });
  it('handles the drop of new entry', async () => {
    buffer = logZToBuffer({
      atMost: 4,
      onRecord(newEntry, contents) {
        if (contents.fillRatio() >= 0.5) {
          newEntry.drop();
          newEntry.drop();
        }
      },
    });

    logMessages(4);
    await Promise.race(promises);
    expect(logged).toEqual([[2, false], [3, false]]);

    await buffer.end();
    expect(logged).toEqual([[2, false], [3, false], [0, false], [1, false]]);
  });
  it('handles the drop of oldest entry', async () => {
    buffer = logZToBuffer({
      atMost: 4,
      onRecord(_newEntry, contents) {
        if (contents.fillRatio() >= 0.5) {

          const oldestEntry = itsFirst(contents);

          oldestEntry!.drop();
          oldestEntry!.drop();
        }
      },
    });

    logMessages(4);
    await Promise.race(promises);
    expect(logged).toEqual([[0, false], [1, false]]);

    await buffer.end();
    expect(logged).toEqual([[0, false], [1, false], [2, false], [3, false]]);
  });
  it('handles entry drop in the middle', async () => {
    buffer = logZToBuffer({
      atMost: 4,
      onRecord(_newEntry, buffered) {

        const entries = [...buffered];

        if (entries.length === 3) {
          entries[1].drop();
        }
      },
    });

    logMessages(4);
    await Promise.race(promises);
    expect(logged).toEqual([[1, false]]);

    await buffer.end();
    expect(logged).toEqual([[1, false], [0, false], [2, false], [3, false]]);
  });

  describe('drainTo', () => {

    let target: ZLogRecorder;
    let drained: ZLogMessage[];

    beforeEach(() => {
      target = {
        record(message: ZLogMessage) {
          drained.push(message);
        },
        whenLogged(): Promise<boolean> {
          return Promise.resolve(true);
        },
        end(): Promise<void> {
          return Promise.resolve();
        },
      };
      drained = [];
    });

    it('drains new messages', async () => {
      buffer.drainTo(target);
      logMessages(3);

      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true], [2, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1), testMessage(2)]);
    });
    it('drains new messages in smaller batches', async () => {
      buffer.drainTo(target, 0);
      logMessages(3);

      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true], [2, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1), testMessage(2)]);
    });
    it('drains buffered messages', async () => {
      logMessages(3);
      buffer.drainTo(target);

      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true], [2, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1), testMessage(2)]);
    });
    it('drains buffered messages in smaller batches', async () => {
      logMessages(3);
      buffer.drainTo(target, -1);

      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true], [2, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1), testMessage(2)]);
    });
    it('resumes draining when logging more messages', async () => {
      logMessages(2);
      buffer.drainTo(target);
      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1)]);

      logMessages(1);
      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true], [2, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1), testMessage(2)]);
    });
    it('stops and resumes draining', async () => {
      logMessages(2);
      buffer.drainTo(target);
      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1)]);

      buffer.drainTo(null);
      logMessages(1);
      await Promise.race(promises);

      expect(logged).toEqual([[0, true], [1, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1)]);

      buffer.drainTo(target);
      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, true], [1, true], [2, true]]);
      expect(drained).toEqual([testMessage(0), testMessage(1), testMessage(2)]);
    });
  });

  describe('end', () => {
    it('discards all buffered messages', async () => {
      logMessages(3);

      await buffer.end();

      expect(logged).toEqual([[0, false], [1, false], [2, false]]);
    });
    it('discards all new messages', async () => {
      await buffer.end();

      logMessages(3);
      await buffer.whenLogged('all');

      expect(logged).toEqual([[0, false], [1, false], [2, false]]);
    });
  });

  function logMessages(numMessages: number): void {
    for (let i = 0; i < numMessages; ++i) {

      const id = messageSeq++;

      buffer.record(testMessage(id));
      // eslint-disable-next-line jest/valid-expect-in-promise
      promises.push(
          buffer.whenLogged().then(
              ok => logged.push([id, ok]),
              error => logged.push([id, error]),
          ),
      );
    }
  }

  function testMessage(index: number): ZLogMessage {
    return zlogMessage(ZLogLevel.Error, index.toString(10));
  }

});
