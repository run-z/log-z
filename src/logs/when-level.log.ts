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

  let lastDiscarded = false;

  return {

    record(message: ZLogMessage): void {
      if (message.level < atLeast) {
        lastDiscarded = true;
      } else {
        lastDiscarded = false;
        recorder.record(message);
      }
    },

    whenLogged(which?: 'all' | 'last'): Promise<boolean> {
      return lastDiscarded
          ? which === 'all'
              ? recorder.whenLogged(which).then(() => false)
              : Promise.resolve(false)
          : recorder.whenLogged(which);
    },

    end(): Promise<void> {
      return recorder.end();
    },

  };
}
