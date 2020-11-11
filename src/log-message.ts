/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogDetails } from './log-details';
import type { ZLogLevel } from './log-level';
import { ZLogMessageBuilder } from './log-message-builder.impl';
import { ZLogMessageData__symbol } from './log-message-data.impl';

/**
 * Log message.
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
  readonly error?: any;

  /**
   * Message details map.
   *
   * The keys of this map are specific to application or log recorder implementation.
   */
  readonly details: ZLogDetails;

  /**
   * Extra uninterpreted parameters of this message passed to the logging method.
   */
  readonly extra: readonly any[];

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
 * Treats anything else as {@link ZLogMessage.extra uninterpreted message parameter}.
 *
 * @param level  Log level.
 * @param args  Log message arguments.
 *
 * @returns Constructed log message.
 */
export function zlogMessage(level: ZLogLevel, ...args: any[]): ZLogMessage {

  const builder = new ZLogMessageBuilder(level);

  builder.addAll(args);

  return builder.message();
}

/**
 * Builds a special value {@link zlogMessage treated} as {@link ZLogMessage.error logged error}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to set an
 * error of logged message.
 *
 * @param error  Error to report.
 *
 * @returns A special value.
 */
export function zlogError(error: any): unknown {
  return {
    [ZLogMessageData__symbol]: 'error',
    error,
  };
}

/**
 * Builds a special value {@link zlogMessage treated} as a list of {@link ZLogMessage.extra uninterpreted log message
 * parameters}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to add
 * parameters of any type to logged message.
 *
 * @param extra  Log message parameters.
 *
 * @returns A special value.
 */
export function zlogExtra(...extra: any[]): unknown {
  return {
    [ZLogMessageData__symbol]: 'extra',
    extra,
  };
}
