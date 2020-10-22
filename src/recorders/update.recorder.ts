/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';

/**
 * Creates log message update recorder.
 *
 * Updates log message and records it with `target` recorder.
 *
 * @param update  Log message update function. Accepts original message and returns updated one.
 * @param target  The log recorder to log updated messages with.
 *
 * @returns Updating log recorder.
 */
export function updateZLogRecorder(
    update: (this: void, message: ZLogMessage) => ZLogMessage,
    target: ZLogRecorder,
): ZLogRecorder {

  return {

    record(message) {
      target.record(update(message));
    },

    whenLogged() {
      return target.whenLogged();
    },

    end() {
      return target.end();
    },

  };
}
