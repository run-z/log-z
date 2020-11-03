/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogLevel } from './log-level';
import { isZLogMessageData, ZLogMessageData, ZLogMessageData__symbol } from './log-message-data.impl';

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
 * Log message details map.
 *
 * The keys of this map are specific to application or log recorder implementation.
 */
export type ZLogDetails = { readonly [key in string | symbol]?: any };

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
export function zlogMessage(level: number, ...args: any[]): ZLogMessage {

  let text = '';
  let hasText = false;
  let error: any | undefined;
  let hasError = false;
  const details: Record<string | symbol, any> = {};
  const extra = [];

  const setError = (newError: any, newText?: string): void => {
    if (hasError) {
      extra.push(newError);
      return;
    }

    hasError = true;
    error = newError;

    if (!hasText) {
      if (newText !== undefined) {
        text = newText;
      } else if (newError instanceof Error) {
        text = newError.message;
      }
    }
  };

  for (const arg of args) {
    if (typeof arg === 'string') {
      if (!hasText) {
        text = arg;
        hasText = true;
        continue;
      }
    } else if (arg && typeof arg === 'object') {
      if (isZLogMessageData(arg)) {
        switch (arg[ZLogMessageData__symbol]) {
        case 'error':
          setError((arg as ZLogMessageData.Error).error);
          continue;
        case 'details':
          Object.assign(details, (arg as ZLogMessageData.Details).details);
          continue;
        case 'extra':
          extra.push(...(arg as ZLogMessageData.Extra).extra);
          continue;
        }
      } else if (arg instanceof Error) {
        setError(arg, arg.message);
        continue;
      }
    }

    extra.push(arg);
  }

  return {
    level,
    text,
    error,
    details,
    extra,
  };
}

/**
 * Builds a special value {@link zlogMessage treated} as additional {@link ZLogMessage.details message details}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to add
 * details to logged message.
 *
 * @param details  Log message details to add.
 *
 * @returns A special value.
 */
export function zlogDetails(details: ZLogDetails): unknown {
  return {
    [ZLogMessageData__symbol]: 'details',
    details,
  };
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
 * Builds a special value {@link zlogMessage treated} as a list of {@link ZLogMessage.extra uninterpreted parameters}.
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
