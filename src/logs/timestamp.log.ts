/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import { logZUpdated } from './updated.log';

/**
 * A specification of how to add {@link logZTimestamp timestamp} to log message.
 */
export interface TimestampZLogSpec {

  /**
   * A key of {@link ZLogMessage.details message details} property to record timestamp to.
   *
   * @default `"timestamp"`.
   */
  readonly to?: string | symbol;

  /**
   * Gets timestamp for the message.
   *
   * @param message  The message to generate timestamp for.
   *
   * @returns Timestamp value. Could be either Date, number (i.e. epoch milliseconds), or string.
   *
   * @default `Date.now()`
   */
  get?(message: ZLogMessage): Date | number | string;

}

/**
 * Creates timestamp log recorder with default configuration.
 *
 * Timestamp recorder appends timestamp to log messages and records them by another recorder. Timestamps are not
 * overridden if already present.
 *
 * @param by  The recorder to log timestamped messages by.
 *
 * @returns Timestamped log recorder.
 */
export function logZTimestamp(by: ZLogRecorder): ZLogRecorder;

/**
 * Creates customized timestamp log recorder.
 *
 * Timestamp recorder appends timestamp to log messages and records them with `target` recorder. Timestamps are not
 * overridden if present.
 *
 * @param how  A specification of how to add timestamp to log message.
 * @param by  The recorder to log timestamped messages by.
 *
 * @returns Timestamped log recorder.
 */
export function logZTimestamp(how: TimestampZLogSpec, by: ZLogRecorder): ZLogRecorder;

export function logZTimestamp(
    howOrBy: TimestampZLogSpec | ZLogRecorder,
    by?: ZLogRecorder,
): ZLogRecorder {

  let how: TimestampZLogSpec;
  let recorder: ZLogRecorder;

  if (by) {
    how = howOrBy as TimestampZLogSpec;
    recorder = by;
  } else {
    how = {};
    recorder = howOrBy as ZLogRecorder;
  }

  const { to = 'timestamp', get = defaultZLogTimestamp } = how;

  return logZUpdated(
      message => ({
        ...message,
        details: {
          [to]: get(message),
          ...message.details,
        },
      }),
      recorder,
  );
}

/**
 * @internal
 */
function defaultZLogTimestamp(_message: ZLogMessage): number {
  return Date.now();
}
