/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';

/**
 * Log line.
 *
 * Represents formatted log message. Contains tokens written by {@link ZLogTokenizer tokenizers}.
 *
 * The instance of this class can be reused for different messages and tokenizers.
 *
 * @typeParam TToken  A type of tokens this line consists of.
 */
export abstract class ZLogLine<TToken = string> {

  /**
   * The log message this line represents. I.e. the message to format by tokenizers.
   */
  abstract readonly message: ZLogMessage;

  /**
   * Writes formatted token to this line.
   *
   * @param token  Formatted message token, or `null`/`undefined` to write nothing.
   */
  abstract write(token: TToken | undefined | null): void;

  /**
   * Changes the message to format.
   *
   * A token may decide to modify the message e.g. to exclude some of its fields from formatting by other tokens.
   *
   * @param newMessage  New message to format.
   */
  abstract changeMessage(newMessage: ZLogMessage): void;

  /**
   * Extracts a property from {@link ZLogMessage.details message details}, then {@link changeMessage changes}
   * the message to format by excluding the extracted property from it.
   *
   * @param key  A key of the property to extract.
   *
   * @returns Extracted property value.
   */
  extractDetail(key: string | symbol): any {

    const message = this.message;
    const value = message.details[key as string]; // See BUG: https://github.com/microsoft/TypeScript/issues/1863

    if (value !== undefined) {
      this.changeMessage({ ...message, details: { ...message.details, [key as string]: undefined } });
    }

    return value;
  }

  /**
   * Formats arbitrary value.
   *
   * @param value  A value to format.
   *
   * @returns Either formatted value, or nothing.
   */
  abstract formatValue(value: any): TToken | null | undefined;

  /**
   * Formats arbitrary error.
   *
   * @param error  An error to format.
   *
   * @returns Either formatted error, or nothing.
   */
  abstract formatError(error: any): TToken | null | undefined;

  /**
   * Formats arbitrary object value.
   *
   * @param value  Object value to format.
   *
   * @returns Either formatted object value, or nothing.
   */
  abstract formatObject(value: object): TToken | null | undefined;

  /**
   * Formats elements of arbitrary iterable.
   *
   * @param value  An iterable of elements to format.
   *
   * @returns Either formatted elements, or nothing.
   */
  abstract formatElements(value: Iterable<any>): TToken | null | undefined;

  /**
   * Formats arbitrary key/value pair.
   *
   * @param key  Property key to format.
   * @param value  Property value to format.
   *
   * @returns Either formatted key/value pair, or nothing.
   */
  abstract formatKeyAndValue(key: PropertyKey, value: any): TToken | null | undefined;

}

/**
 * A type of tokens the log line consists of.
 *
 * @typeParam TLine  Log line type.
 */
export type ZLogLineToken<TLine extends ZLogLine<unknown>> =
    TLine extends ZLogLine<infer TToken> ? TToken : never;

