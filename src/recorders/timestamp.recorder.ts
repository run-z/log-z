/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';

/**
 * {@link timestampZLogRecorder Timestamp log recorder} configuration.
 */
export interface TimestampZLogConfig {

  /**
   * A key of {@link ZLogMessage.details message details} property to record timestamp to.
   *
   * @default `"timestamp"`.
   */
  readonly key?: string | symbol;

  /**
   * Generates timestamp for the message.
   *
   * @param message  The message to add timestamp to.
   *
   * @returns Timestamp value. Could be either Date, number (i.e. epoch milliseconds), or string.
   *
   * @default `Date.now()`
   */
  timestamp?(message: ZLogMessage): Date | number | string;

}

/**
 * Creates timestamp log recorder with default configuration.
 *
 * Timestamp recorder appends timestamp to log messages and records them with `target` recorder. Timestamps are not
 * overridden if present.
 *
 * @param target  The log recorder to log timestamped messages with.
 *
 * @returns New log recorder.
 */
export function timestampZLogRecorder(target: ZLogRecorder): ZLogRecorder;

/**
 * Creates customized timestamp log recorder.
 *
 * Timestamp recorder appends timestamp to log messages and records them with `target` recorder. Timestamps are not
 * overridden if present.
 *
 * @param config  Timestamp log recorder configuration.
 * @param target  The log recorder to log timestamped messages with.
 *
 * @returns New log recorder.
 */
export function timestampZLogRecorder(config: TimestampZLogConfig, target: ZLogRecorder): ZLogRecorder;

export function timestampZLogRecorder(
    configOrTarget: TimestampZLogConfig | ZLogRecorder,
    target?: ZLogRecorder,
): ZLogRecorder {

  let config: TimestampZLogConfig;
  let log: ZLogRecorder;

  if (target) {
    config = configOrTarget as TimestampZLogConfig;
    log = target;
  } else {
    config = {};
    log = configOrTarget as ZLogRecorder;
  }

  const { key = 'timestamp', timestamp = defaultZLogTimestamp } = config;

  return {

    record(message) {

      const ts = timestamp(message);

      log.record({ ...message, details: { [key]: ts, ...message.details } });
    },

    whenLogged() {
      return log.whenLogged();
    },

    end() {
      return log.end();
    },

  };
}

/**
 * @internal
 */
function defaultZLogTimestamp(_message: ZLogMessage): number {
  return Date.now();
}
