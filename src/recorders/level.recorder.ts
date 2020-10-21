/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { ZLogLevel } from '../log-level';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';

/**
 * Creates a log recorder of messages with at least the required level. Messages with lower levels are discarded.
 *
 * @param recorder  The recorder to log messages with.
 * @param level  Required log level. {@link ZLogLevel.Info Info} by default.
 *
 * @returns New log recorder.
 */
export function levelZLogRecorder(recorder: ZLogRecorder, level = ZLogLevel.Info): ZLogRecorder {

  let whenLogged: Promise<boolean> | undefined;

  return {

    record(message: ZLogMessage): void {
      if (message.level < level) {
        if (whenLogged) {
          whenLogged = whenLogged.then(() => false);
        } else {
          whenLogged = Promise.resolve(false);
        }
      } else {
        whenLogged = undefined;
        recorder.record(message);
      }
    },

    whenLogged(): Promise<boolean> {
      return whenLogged || (whenLogged = recorder.whenLogged());
    },

    discard(): Promise<void> {
      return recorder.discard();
    },

  };
}
