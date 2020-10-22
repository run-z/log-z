/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import { defaultZLogFormat } from './default.format';

/**
 * Log message format.
 *
 * It can be used to build a {@link zlogFormatter message formatter}.
 */
export interface ZLogFormat {

  /**
   * Extracts {@link ZLogMessage.level log level} name of the message.
   *
   * @param message  Source log message.
   *
   * @returns Log level name.
   */
  levelName?(message: ZLogMessage): string;

  /**
   * Formats log level.
   *
   * @param message  Source log message.
   *
   * @returns Log level representation.
   */
  level?(message: ZLogMessage): string;

  /**
   * Formats {@link ZLogMessage.text message text}.
   *
   * @param message  Source log message.
   *
   * @returns Formatted message text.
   *
   * @default {@link ZLogMessage.text Message text} as is.
   */
  text?(message: ZLogMessage): string;

  /**
   * Formats {@link ZLogMessage.extra uninterpreted message parameters}.
   *
   * @param message  Source log message.
   *
   * @returns Either formatted parameters string, or nothing.
   *
   * @default Comma-separated parameters enclosed into parentheses.
   */
  extra?(message: ZLogMessage): string | null | undefined;

  /**
   * Formats {@link ZLogMessage.details message details}.
   *
   * @param message  Source log message.
   *
   * @returns Formatted details string, or nothing.
   */
  details?(message: ZLogMessage): string | null | undefined;

  /**
   * Formats {@link ZLogMessage.error message error}.
   *
   * @param message  Source log message.
   *
   * @returns Either formatted error string, or noting.
   */
  error?(message: ZLogMessage): string | null | undefined;

  /**
   * Formats arbitrary value.
   *
   * Applied to {@link ZLogMessage.extra uninterpreted message parameters}
   * and {@link ZLogMessage.details message details} property values.
   *
   * @param value  Arbitrary value.
   * @param message  Source log message.
   *
   * @returns String representation of the value, or `null`/`undefined` to skip it.
   */
  value?(value: any, message: ZLogMessage): string | null | undefined;

  /**
   * Formats arbitrary object value.
   *
   * @param value  Arbitrary object value.
   * @param message  Source log message.
   *
   * @returns String representation of the object, or `null`/`undefined` to skip it.
   */
  object?(value: object, message: ZLogMessage): string | null | undefined;

  /**
   * Formats elements of arbitrary iterable.
   *
   * @param value  Arbitrary iterable value.
   * @param message  Source log message.
   *
   * @returns String representation of elements, or `null`/`undefined` to skip it.
   */
  elements?(value: Iterable<any>, message: ZLogMessage): string | null | undefined;

  /**
   * Formats arbitrary key/value pairs.
   *
   * Applied to {@link ZLogMessage.details message details} properties.
   *
   * @param key  Property key.
   * @param value  Property value.
   * @param message  Source log message.
   *
   * @returns String representation of the key/value pair, or `null`/`undefined` to skip it.
   */
  keyAndValue?(key: PropertyKey, value: any, message: ZLogMessage): string | null | undefined;

}

export namespace ZLogFormat {

  /**
   * Full log message format with all methods specified.
   */
  export type Full = { [K in keyof ZLogFormat]-?: ZLogFormat[K] };

}

/**
 * Fulfills log message format.
 *
 * @param format  Original message format.
 *
 * @returns Full message format fulfilled by {@link defaultZLogFormat default one}.
 */
export function zlogFormat(format?: ZLogFormat): ZLogFormat.Full {
  return format ? { ...defaultZLogFormat, ...format } : defaultZLogFormat;
}

