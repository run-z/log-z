/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { noop } from '@proc7ts/primitives';
import type { ZLogMessage } from '../log-message';
import { alreadyEnded, alreadyLogged, notLogged } from '../log-recorder.impl';
import { ZLogBuffer } from './log-buffer';
import { ZLogBuffer$ } from './log-buffer.impl';

/**
 * A specification of how to buffer log messages.
 */
export interface ZLogBufferSpec {

  /**
   * Buffer limit. I.e. the maximum number of log messages to store in buffer.
   *
   * The values less that `1` are treated as `1`.
   *
   * @default 1024
   */
  readonly atMost?: number;

  /**
   * This is called whenever a log message is about to be buffered.
   *
   * It may {@link ZLogBuffer.Entry drop} either the new message, or some of already buffered ones.
   *
   * If the buffer is full (i.e. its {@link ZLogBuffer.Contents.fillRatio fill ratio} is `1`), and this method did not
   * drop any of the messages, then the oldest message will be dropped.
   *
   * @param newEntry  Log message entry about to be buffered.
   * @param contents  Current contents of the log buffer.
   */
  onRecord?(newEntry: ZLogBuffer.Entry, contents: ZLogBuffer.Contents): void;

}

/**
 * Creates a log buffer.
 *
 * The buffer is expected to be {@link ZLogBuffer.drainTo drained} to some log recorder.
 *
 * @param how  Log buffering specification.
 *
 * @returns New log buffer.
 */
export function logZToBuffer(how: ZLogBufferSpec = {}): ZLogBuffer {

  const { atMost = 1024 } = how;
  const onRecord = how.onRecord ? how.onRecord.bind(how) : noop;
  const buffer = new ZLogBuffer$(Math.max(1, atMost));

  let whenLogged: (which?: 'all' | 'last') => Promise<boolean> = alreadyLogged;
  let record = (message: ZLogMessage): void => {

    const entry = buffer.add(message, onRecord);

    whenLogged = which => which === 'all'
        ? buffer.whenAllLogged().then(() => entry.whenLogged())
        : entry.whenLogged();
  };
  let drainTo = ZLogBuffer.drainer(atOnce => buffer.next(atOnce));
  let end = (): Promise<void> => {
    record = noop;
    whenLogged = notLogged;
    end = alreadyEnded;
    drainTo = noop;

    buffer.clear();

    return end();
  };

  return {

    record(message) {
      record(message);
    },

    whenLogged(which?: 'all' | 'last'): Promise<boolean> {
      return whenLogged(which);
    },

    end() {
      return end();
    },

    drainTo(target, atOnce) {
      drainTo(target, atOnce);
    },

  };
}
