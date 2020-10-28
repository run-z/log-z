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
 * Log buffering specification.
 */
export interface ZLogBufferSpec {

  /**
   * Buffer limit. I.e. the maximum number of log messages to store in buffer.
   *
   * The values less that `1` are treated as `1`.
   *
   * @default 256
   */
  readonly limit?: number;

  /**
   * This is called whenever a log message is about to be buffered.
   *
   * It may {@link ZLogBuffer.Entry drop} either the new message, or the oldest one to prevent buffer overflow.
   *
   * If the buffer is full (i.e. `fillRatio` is `1`), and this method did not drop any of the messages, then the oldest
   * message will be dropped.
   *
   * @param newEntry  Log message entry about to be buffered.
   * @param oldestEntry  The oldest log entry. The same as `newEntry` for empty buffer.
   * @param fillRatio  The fill ratio of the buffer. `0` corresponds to empty buffer, while `1` corresponds to full
   * one.
   */
  onRecord?(newEntry: ZLogBuffer.Entry, oldestEntry: ZLogBuffer.Entry, fillRatio: number): void;

}

/**
 * Creates a log buffer.
 *
 * The buffer is expected to be {@link ZLogBuffer.drainTo drained} to some log recorder.
 *
 * @param spec  Log buffering specification.
 *
 * @returns New log buffer.
 */
export function logZToBuffer(spec: ZLogBufferSpec = {}): ZLogBuffer {

  const { limit = 256 } = spec;
  const onRecord = spec.onRecord ? spec.onRecord.bind(spec) : noop;

  const buffer = new ZLogBuffer$(Math.max(1, limit));

  let whenLogged: () => Promise<boolean> = alreadyLogged;
  let record = (message: ZLogMessage): void => {

    const entry = buffer.add(message, onRecord);

    whenLogged = () => entry.whenLogged();
  };
  let drainTo = ZLogBuffer.drainer(() => buffer.next());
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

    whenLogged(): Promise<boolean> {
      return whenLogged();
    },

    end() {
      return end();
    },

    drainTo(target) {
      drainTo(target);
    },

  };
}
