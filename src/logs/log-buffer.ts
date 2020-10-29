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
   * @param target  Target log recorder to drain buffered messages to, or `null`/`undefined` to stop draining.
   */
  drainTo(target: ZLogRecorder | null | undefined): void;

}

export namespace ZLogBuffer {

  /**
   * Buffered log message entry.
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
   * Log buffer drainer signature.
   *
   * Drains buffered messages to target log recorder. Can be used as implementation of {@link ZLogBuffer.drainTo}
   * method.
   */
  export type Drainer =
  /**
   * @param target  Target log recorder to drain buffered messages to, or `null`/`undefined` to stop draining.
   */
      (this: void, target: ZLogRecorder | null | undefined) => void;

}

export const ZLogBuffer = {

  /**
   * Builds a log buffer drainer function.
   *
   * @param next  A function retrieving the next buffer entry to drain.
   *
   * @returns A promise resolved to the next buffer entry. I.e. to the oldest buffered message entry.
   */
  drainer(next: (this: void) => Promise<ZLogBuffer.Entry>): ZLogBuffer.Drainer {

    let pass: (entry: ZLogBuffer.Entry) => void = noop;
    let drainNext: () => void = noop;

    const continueWhenLogged = (): void => drainNext();
    const doDrainNext = (): void => {
      next().then(entry => pass(entry), noop);
    };

    return target => {
      if (target != null) {
        drainNext = doDrainNext;
        pass = entry => {
          entry.recordTo(target);
          entry.whenLogged().then(continueWhenLogged, continueWhenLogged);
        };
        drainNext();
      } else {
        drainNext = noop;
        pass = noop;
      }
    };
  },

};
