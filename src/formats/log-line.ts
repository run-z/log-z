/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import type { ZLogField } from './log-field';

/**
 * Log line.
 *
 * Represents formatted log message. Line contents are written by {@link ZLogField log fields}.
 *
 * The instance of this class can be reused by different messages and fields.
 */
export abstract class ZLogLine {

  /**
   * The log message this line represents. I.e. the message to format.
   */
  abstract readonly message: ZLogMessage;

  /**
   * Changes the message to format.
   *
   * A field may decide to modify the message e.g. to exclude some of its properties from further formatting.
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
   * Formats a log message by the given field.
   *
   * @param field  The field to format the message by.
   * @param message  The message to format. {@link message Current message} by default.
   *
   * @returns Either a string written to log line, or `undefined` if nothing is written.
   */
  abstract format(field: ZLogField<this>, message?: ZLogMessage): string | undefined;

  /**
   * Writes raw string.
   *
   * @param value  Raw string to write.
   */
  abstract write(value: string): void;

  /**
   * Writes arbitrary value.
   *
   * @param value  A value to write.
   */
  writeValue(value: any): void {
    if (typeof value === 'string') {
      this.writeString(value);
    } else if (value != null && typeof value === 'object') {
      this.writeObject(value);
    } else {
      this.writeByDefault(value);
    }
  }

  /**
   * Writes an error.
   *
   * Writes a message and its stack trace.
   *
   * @param error  An error to write.
   */
  writeError(error: any): void {
    if (error instanceof Error) {

      const { stack } = error;

      this.write(stack ? String(stack) : String(error));
    } else {
      this.write('[Error: ');
      this.writeValue(error);
      this.write(']');
    }
  }

  /**
   * Writes formatted string.
   *
   * Encloses the string in double quotes.
   *
   * @param value  A string to write.
   */
  writeString(value: string): void {
    this.write(JSON.stringify(value));
  }

  /**
   * Writes arbitrary object value.
   *
   * For array, writes its elements by {@link writeElements}, and encloses them into square brackets.
   *
   * For anything else, writes object properties by {@link writeProperties}, and encloses them into curly brackets.
   *
   * @param value  Object value to write.
   */
  writeObject(value: object): void {
    if (Array.isArray(value)) {
      this.write('[');
      this.writeElements(value);
      this.write(']');
    } else {

      const formatted = this.format(line => line.writeProperties(value));

      this.write(formatted ? `{ ${formatted} }` : '{}');
    }
  }

  /**
   * Writes object properties.
   *
   * Writes own object properties by {@link writeKeyAndValue}.
   *
   * @param value  Object value to write.
   */
  writeProperties(value: object): void {

    let written = false;

    for (const key of Reflect.ownKeys(value)) {

      const formatted = this.format(line => line.writeKeyAndValue(
          key as string | symbol,
          (value as Record<PropertyKey, any>)[key as string],
      ));

      if (formatted != null) {
        if (written) {
          this.write('; ');
        } else {
          written = true;
        }
        this.write(formatted);
      }
    }
  }

  /**
   * Writes elements of arbitrary iterable.
   *
   * Writes each element by {@link writeValue}, and separates them with comma.
   *
   * @param value  An iterable of elements to write.
   */
  writeElements(value: Iterable<any>): void {

    let written = false;

    for (const param of value) {
      if (written) {
        this.write(', ');
      } else {
        written = true;
      }
      this.writeValue(param);
    }
  }

  /**
   * Writes arbitrary key/value pair.
   *
   * Ignores properties with undefined values.
   *
   * Writes value by {@link writeValue} method. Separates key and value by colon.
   *
   * @param key  Property key to write.
   * @param value  Property value to write.
   */
  writeKeyAndValue(key: PropertyKey, value: any): void {
    if (value !== undefined) {
      this.write(`${String(key)}: `);
      this.writeValue(value);
    }
  }

  /**
   * Writes a value not recognized by {@link writeValue}.
   *
   * Writes a string representation of the value.
   *
   * @param value  A value to format.
   *
   * @returns Either formatted value, or nothing.
   */
  protected writeByDefault(value: any): void {
    this.write(String(value));
  }

}
