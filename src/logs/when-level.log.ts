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
 * @param atLeast  Required log level. {@link ZLogLevel.Info Info} by default.
 * @param by  The recorder to log messages by.
 *
 * @returns New log recorder.
 */
export function logZWhenLevel(atLeast: ZLogLevel, by: ZLogRecorder): ZLogRecorder;

export function logZWhenLevel(by: ZLogRecorder): ZLogRecorder;

export function logZWhenLevel(atLeastOrBy: ZLogLevel | ZLogRecorder, by?: ZLogRecorder): ZLogRecorder {

  let recorder: ZLogRecorder;
  let atLeast: ZLogLevel;

  if (by) {
    recorder = by;
    atLeast = atLeastOrBy as ZLogLevel;
  } else {
    recorder = atLeastOrBy as ZLogRecorder;
    atLeast = ZLogLevel.Info;
  }

  let whenLogged: Promise<boolean> | undefined;

  return {

    record(message: ZLogMessage): void {
      if (message.level < atLeast) {
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

    end(): Promise<void> {
      return recorder.end();
    },

  };
}
