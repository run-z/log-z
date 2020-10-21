/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogLevel } from './log-level';

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
  readonly details: Readonly<Record<string | symbol, any>>;

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
 * Treats the first `Error` instance argument as {@link ZLogMessage.error message error}, and its message as
 * {@link ZLogMessage.text message text}, unless there is another textual argument.
 *
 * Treats the properties of object arguments as {@link ZLogMessage.details message details}.
 *
 * Treats elements of array arguments as {@link ZLogMessage.extra message extra} entries.
 *
 * Treats the rest of arguments as {@link ZLogMessage.extra message extra}.
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
  const details: Record<string | symbol, any> = {};
  const extra = [];

  for (const arg of args) {
    if (typeof arg === 'string') {
      if (!hasText) {
        text = arg;
        hasText = true;
        continue;
      }
    } else if (arg && typeof arg === 'object') {
      if (Array.isArray(arg)) {
        extra.push(...arg);
        continue;
      }

      if (arg instanceof Error) {
        if (!error) {
          error = arg;
          if (!hasText) {
            text = error.message;
          }
          continue;
        }
        extra.push(arg);
        continue;
      }

      Object.assign(details, arg);

      continue;
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
