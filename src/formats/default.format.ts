/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { ZLogLevel } from '../log-level';
import type { ZLogMessage } from '../log-message';
import type { ZLogFormat } from './log-format';

/**
 * Default log message format.
 *
 * Methods of this object can be copied to any {@link ZLogFormat} instance.
 */
export const defaultZLogFormat = {

  /**
   * Extracts {@link ZLogMessage.level log level} name of the message.
   *
   * @param message  Source log message.
   *
   * @returns Upper-case log level name padded to 5 letters (e.g. `'ERROR'`, or `'WARN '`).
   */
  levelName(this: ZLogFormat, message: ZLogMessage): string {

    const { level } = message;

    if (level >= ZLogLevel.Fatal) {
      return 'FATAL';
    }
    if (level >= ZLogLevel.Error) {
      return 'ERROR';
    }
    if (level >= ZLogLevel.Warning) {
      return 'WARN ';
    }
    if (level >= ZLogLevel.Info) {
      return 'INFO ';
    }
    if (level >= ZLogLevel.Debug) {
      return 'DEBUG';
    }
    if (level >= ZLogLevel.Trace) {
      return 'TRACE';
    }
    return 'SILLY';
  },

  /**
   * Formats log level.
   *
   * @param message  Source log message.
   *
   * @returns `[LEVEL]`.
   */
  level(this: ZLogFormat, message: ZLogMessage): string {

    const levelName = selectZLogFormat<'levelName'>(this, this.levelName).levelName(message);

    return `[${levelName}]`;
  },

  /**
   * Formats {@link ZLogMessage.text message text}.
   *
   * @param message  Source log message.
   *
   * @returns {@link ZLogMessage.text Message text} as is.
   */
  text(this: ZLogFormat, message: ZLogMessage): string {
    return message.text;
  },

  /**
   * Formats {@link ZLogMessage.extra uninterpreted message parameters}.
   *
   * Utilizes {@link elements} method to format parameter values.
   *
   * @param message  Source log message.
   *
   * @returns Formatted parameters enclosed into parentheses, or `null`/`undefined` if there is no parameters to format.
   */
  extra(this: ZLogFormat, message: ZLogMessage): string | null | undefined {

    const { extra } = message;

    if (!extra.length) {
      return;
    }

    const str = selectZLogFormat<'elements'>(this, this.elements).elements(extra, message);

    return str != null ? `(${str})` : str;
  },

  /**
   * Formats {@link ZLogMessage.details message details}.
   *
   * Utilizes {@link object} to log details.
   *
   * @param message  Source log message.
   *
   * @returns Semicolon-separated list of key/value pairs enclosed into curly brackets, or `null`/`undefined` if there
   * is no details to format.
   */
  details(this: ZLogFormat, message: ZLogMessage): string | null | undefined {
    return selectZLogFormat<'object'>(this, this.object).object(message.details, message);
  },

  /**
   * Formats {@link ZLogMessage.error message error}.
   *
   * @param message  Source log message.
   *
   * @returns Either error with stack trace, or `null`/`undefined` if there is no error to format.
   */
  error(this: ZLogFormat, message: ZLogMessage): string | null | undefined {

    const { error } = message;

    if (error == null) {
      return;
    }
    if (error instanceof Error) {

      const { stack } = error;

      return stack ? `${String(error)} ${stack}` : String(error);
    }

    const str = selectZLogFormat<'value'>(this, this.value).value(error, message);

    if (str == null) {
      return;
    }

    return `[Error: ${str}]`;
  },

  /**
   * Formats arbitrary value.
   *
   * @param value  Arbitrary value.
   * @param message  Source log message.
   *
   * @returns String representation of the value.
   */
  value(this: ZLogFormat, value: any, message: ZLogMessage): string | null | undefined {
    if (typeof value === 'string') {
      return JSON.stringify(value);
    }
    if (value && typeof value === 'object') {
      return selectZLogFormat<'object'>(this, this.object).object(value, message);
    }
    return String(value);
  },

  /**
   * Formats arbitrary object value.
   *
   * Extracts own properties and formats them by {@link keyAndValue} method.
   *
   * @param value  Arbitrary object value.
   * @param message  Source log message.
   *
   * @returns String representation of the object, or `null`/`undefined` if there is nothing to format.
   */
  object(this: ZLogFormat, value: object, message: ZLogMessage): string | null | undefined {
    if (Array.isArray(value)) {

      const str = selectZLogFormat<'elements'>(this, this.elements).elements(value, message);

      return str ? `[${str}]` : '[]';
    }

    const format = selectZLogFormat<'keyAndValue'>(this, this.keyAndValue);
    let out: string | undefined;

    for (const key of Reflect.ownKeys(value)) {

      const str = format.keyAndValue(key as string | symbol, (value as any)[key], message);

      if (str != null) {
        if (out) {
          out += '; ';
        } else {
          out = '{ ';
        }
        out += str;
      }
    }

    return out ? out + ' }' : undefined;
  },

  /**
   * Formats elements of arbitrary iterable.
   *
   * Formats each element by {@link value} method.
   *
   * @param value  Arbitrary iterable value.
   * @param message  Source log message.
   *
   * @returns Comma-separated list of elements, or `null`/`undefined` if there is no elements to format.
   */
  elements(this: ZLogFormat, value: Iterable<any>, message: ZLogMessage): string | null | undefined {

    const format = selectZLogFormat<'value'>(this, this.value);

    let out: string | undefined;

    for (const param of value) {

      const str = format.value(param, message);

      if (str != null) {
        if (out) {
          out += ', ';
        } else {
          out = '';
        }
        out += str;
      }
    }

    return out;
  },

  /**
   * Formats arbitrary key/value pairs.
   *
   * Utilizes {@link value} method for value formatting.
   *
   * @param key  Property key.
   * @param value  Property value.
   * @param message  Source log message.
   *
   * @returns `key: value` string, or `null`/`undefined` if there is no value to format, the value is `undefined`,
   * or the key is a symbol.
   */
  keyAndValue(this: ZLogFormat, key: PropertyKey, value: any, message: ZLogMessage): string | null | undefined {
    if (typeof key === 'symbol' || value === undefined) {
      return;
    }

    const str = selectZLogFormat<'value'>(this, this.value).value(value, message);

    if (str == null) {
      return;
    }

    return `${key}: ${str}`;
  },

};

/**
 * @internal
 */
function selectZLogFormat<TKey extends keyof ZLogFormat>(
    format: ZLogFormat,
    method: ZLogFormat[TKey],
): { [K in TKey]-?: ZLogFormat.Full[K] } {
  return (method ? format : defaultZLogFormat) as { [K in TKey]-?: ZLogFormat.Full[K] };
}
