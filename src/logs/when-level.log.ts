import { noop } from '@proc7ts/primitives';
import { ZLogLevel, zlogLevelOf } from '../level';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogMessage } from '../message';
import { neverLogZ } from './never.log';

/**
 * Creates a log recorder of messages with required level. Messages not satisfying the condition either logged
 * by another recorder, or discarded.
 *
 * @param when - Either required log level, or arbitrary condition implemented by function accepting log level and
 * returning `true` for satisfying level. Zero or negative value means to log everything.
 * @param by - The recorder to log messages satisfying log level condition.
 * @param orBy - The recorder to log messages not satisfying log level condition. Such messages will be discarded when
 * omitted.
 *
 * @returns New log recorder.
 */
export function logZWhenLevel(
  when: number | ((this: void, level: number) => boolean),
  by: ZLogRecorder,
  orBy?: ZLogRecorder,
): ZLogRecorder;

/**
 * Creates a log recorder of messages with at least {@link ZLogLevel.Info Info} log level. Messages with lower levels
 * either logged by another recorder, or discarded.
 *
 * @param by - The recorder to log messages satisfying log level condition.
 * @param orBy - The recorder to log messages not satisfying log level condition. Such messages will be discarded when
 * omitted.
 *
 * @returns New log recorder.
 */
export function logZWhenLevel(by: ZLogRecorder, orBy?: ZLogRecorder): ZLogRecorder;

export function logZWhenLevel(
  whenOrBy: ZLogLevel | ((this: void, level: ZLogLevel) => boolean) | ZLogRecorder,
  by: ZLogRecorder = neverLogZ,
  orBy: ZLogRecorder = neverLogZ,
): ZLogRecorder {
  let recorder: ZLogRecorder;
  let when: (this: void, level: ZLogLevel) => boolean;

  const atLeast = zlogLevelOf(whenOrBy);

  if (atLeast != null) {
    if (atLeast <= 0 && orBy === neverLogZ) {
      return by;
    }
    recorder = by;
    when = level => level >= atLeast;
  } else if (typeof whenOrBy === 'function') {
    recorder = by;
    when = whenOrBy;
  } else {
    recorder = whenOrBy as ZLogRecorder;
    when = atLeastInfoZLevel;
    orBy = by;
  }

  let lastBy: ZLogRecorder = recorder;

  return {
    record(message: ZLogMessage): void {
      if (when(message.level)) {
        lastBy = recorder;
      } else {
        lastBy = orBy;
      }

      lastBy.record(message);
    },

    whenLogged(which?: 'all' | 'last'): Promise<boolean> {
      if (which === 'all') {
        const index: 0 | 1 = lastBy === recorder ? 0 : 1;

        return Promise.all([recorder.whenLogged(which), orBy.whenLogged(which)]).then(
          results => results[index],
        );
      }

      return lastBy.whenLogged(which);
    },

    end(): Promise<void> {
      return Promise.resolve([recorder.end(), orBy.end()]).then(noop);
    },
  };
}

/**
 * @internal
 */
function atLeastInfoZLevel(level: number): boolean {
  return level >= ZLogLevel.Info;
}
