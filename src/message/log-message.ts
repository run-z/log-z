import type { ZLogLevel } from '../level';
import { dueLogZ } from './due-log';
import type { ZLogDetails } from './log-details';

/**
 * Log message.
 *
 * Can be constructed by {@link zlogMessage} function.
 */
export interface ZLogMessage {

  /**
   * The log level of this message.
   *
   * The higher value means higher priority.
   */
  readonly level: ZLogLevel;

  /**
   * Human-readable message text.
   *
   * May be empty when unspecified.
   */
  readonly text: string;

  /**
   * An error to log, if any.
   */
  readonly error?: unknown;

  /**
   * Message details map.
   *
   * The keys of this map are specific to application or log recorder implementation.
   */
  readonly details: ZLogDetails;

  /**
   * Extra uninterpreted parameters of this message passed to the logging method.
   */
  readonly extra: readonly unknown[];

}

/**
 * Builds a log message.
 *
 * Treats the first textual argument as {@link ZLogMessage.text message text}.
 *
 * Treats the first special value created by {@link zlogError} function or the first `Error` instance as an error.
 * Treats error message as a {@link ZLogMessage.text message text}, unless there is another textual argument.
 *
 * Treats special values created by {@link zlogDetails} function as additional {@link ZLogMessage.details message
 * details}.
 *
 * Treats special values created by {@link zlogExtra} function as additional {@link ZLogMessage.extra uninterpreted
 * message parameters}.
 *
 * Processes {@link ZLoggable loggable} values.
 *
 * Treats anything else as {@link ZLogMessage.extra uninterpreted message parameter}.
 *
 * Processes log messages with {@link dueLogZ} in `in` stage.
 *
 * @param level - Log level.
 * @param args - Log message arguments.
 *
 * @returns Constructed log message.
 */
export function zlogMessage(level: ZLogLevel, ...args: readonly unknown[]): ZLogMessage {
  return dueLogZ({
    on: 'in',
    zMessage: {
      level,
      text: '',
      details: {},
      extra: args,
    },
  }).zMessage;
}
