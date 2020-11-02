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
 * @param when  Either required log level, or arbitrary condition implemented by function accepting log level and
 * returning `true` to log the message or `false` to discard it.
 * @param by  The recorder to log messages by.
 *
 * @returns New log recorder.
 */
export function logZWhenLevel(
    when: ZLogLevel | ((this: void, level: ZLogLevel) => boolean),
    by: ZLogRecorder,
): ZLogRecorder;

/**
 * Creates a log recorder of messages with at least {@link ZLogLevel.Info Info} log level. Messages with lower levels
 * are discarded.
 *
 * @param by  The recorder to log messages by.
 *
 * @returns New log recorder.
 */
export function logZWhenLevel(by: ZLogRecorder): ZLogRecorder;

export function logZWhenLevel(
    whenOrBy: ZLogLevel | ((this: void, level: ZLogLevel) => boolean) | ZLogRecorder,
    by?: ZLogRecorder,
): ZLogRecorder {

  let recorder: ZLogRecorder;
  let when: ((this: void, level: ZLogLevel) => boolean);

  if (by) {
    recorder = by;
    when = typeof whenOrBy === 'function' ? whenOrBy : level => level >= (whenOrBy as ZLogLevel);
  } else {
    recorder = whenOrBy as ZLogRecorder;
    when = atLeastInfoZLevel;
  }

  let lastDiscarded = false;

  return {

    record(message: ZLogMessage): void {
      if (when(message.level)) {
        lastDiscarded = false;
        recorder.record(message);
      } else {
        lastDiscarded = true;
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

/**
 * @internal
 */
function atLeastInfoZLevel(level: ZLogLevel): boolean {
  return level >= ZLogLevel.Info;
}
