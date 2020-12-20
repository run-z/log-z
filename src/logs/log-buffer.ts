/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { noop } from '@proc7ts/primitives';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';

/**
 * Log buffer.
 *
 * A log recorder that buffers messages and is able to {@link drainTo drain} them to another recorder.
 *
 * The buffered messages are not
 */
export interface ZLogBuffer extends ZLogRecorder {

  /**
   * Drains buffered messages to target log recorder.
   *
   * Messages are drained one at a time. The next message is recorded to target only when the previous one
   * {@link ZLogRecorder.whenLogged either logged or discarded}.
   *
   * Calling this method again changes the target.
   *
   * @param target - Target log recorder to drain buffered messages to, or `null`/`undefined` to stop draining.
   * @param atOnce - The maximum number of buffered messages to drain at once. `32` by default.
   */
  drainTo(target: ZLogRecorder | null | undefined, atOnce?: number): void;

}

export namespace ZLogBuffer {

  /**
   * Log buffer entry.
   *
   * Represents a buffered log message and allows to either {@link drop} it, or {@link recordTo record} to another
   * log recorder.
   */
  export interface Entry {

    /**
     * The buffered log message.
     */
    readonly message: ZLogMessage;

    /**
     * Drops the message.
     *
     * Removes the message from the buffer and discards it.
     *
     * Calling this method when the message is already {@ling recordTo recorded} to another recorder or
     * {@link drop dropped} has no effect.
     */
    drop(): void;

    /**
     * Records the message to another log recorder.
     *
     * Removes the message from the buffer.
     *
     * Calling this method when the message is already {@ling logTo logged} or {@link drop dropped} has no effect.
     */
    recordTo(target: ZLogRecorder): void;

    /**
     * Awaits for the message to be either logged or discarded.
     *
     * @returns A promise resolved to `true` when the message is logged, or to `false` when it is discarded.
     */
    whenLogged(): Promise<boolean>;

  }

  /**
   * The contents of log buffer.
   *
   * Allows to iterate over buffer entries from oldest to newest.
   */
  export interface Contents extends Iterable<Entry> {

    /**
     * Evaluates the fill ratio of the buffer.
     *
     * @returns The fill ratio, with `0` corresponding to empty buffer, and `1` corresponding to full one.
     */
    fillRatio(): number;

  }

  /**
   * Log buffer drainer signature.
   *
   * Drains buffered messages to target log recorder. Can be used as implementation of {@link ZLogBuffer.drainTo}
   * method.
   */
  export type Drainer =
  /**
   * @param target - Target log recorder to drain buffered messages to, or `null`/`undefined` to stop draining.
   * @param atOnce - The maximum number of entries to drain at once. `32` by default.
   */
      (this: void, target: ZLogRecorder | null | undefined, atOnce?: number) => void;

}

export const ZLogBuffer = {

  /**
   * Builds a log buffer drainer function.
   *
   * @param next - A function retrieving the next buffer entries to drain. Accepts the number of entries to train as
   * its only parameter, and returns a promise resolving to non-empty array of entries to drain.
   *
   * @returns A promise resolved to the next buffer entry. I.e. to the oldest buffered message entry.
   */
  drainer(
      next: (this: void, atOnce: number) => Promise<[ZLogBuffer.Entry, ...ZLogBuffer.Entry[]]>,
  ): ZLogBuffer.Drainer {

    let pass: (entries: ZLogBuffer.Entry[]) => void = noop;
    let drainNext: () => void = noop;
    let batchSize = 32;

    const continueWhenLogged = (): void => drainNext();
    const doDrainNext = (): void => {
      next(batchSize).then(entry => pass(entry), noop);
    };

    return (target, atOnce = 32) => {
      if (target != null) {
        batchSize = Math.max(atOnce, 1);
        drainNext = doDrainNext;
        pass = entries => {

          let lastEntry!: ZLogBuffer.Entry;

          for (const entry of entries) {
            lastEntry = entry;
            entry.recordTo(target);
          }

          lastEntry.whenLogged().then(continueWhenLogged, continueWhenLogged);
        };
        drainNext();
      } else {
        drainNext = noop;
        pass = noop;
      }
    };
  },

};
