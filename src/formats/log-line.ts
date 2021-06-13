import type { ZLogDetails, ZLogMessage } from '../message';
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
   * @param newMessage - New message to format.
   */
  abstract changeMessage(newMessage: ZLogMessage): void;

  /**
   * Extracts {@link ZLogMessage.details message details}, then {@link changeMessage changes} the message to format by
   * excluding the extracted details from it.
   *
   * @returns Extracted message details.
   */
  extractDetail(): ZLogDetails;

  /**
   * Extracts a property from {@link ZLogMessage.details message details}, then {@link changeMessage changes}
   * the message to format by excluding the extracted property from it.
   *
   * @param path - A path to details property to extract. Empty path means extracting of all details.
   *
   * @returns Extracted message detail, or `undefined` if there is no such detail.
   */
  extractDetail(...path: (keyof ZLogDetails)[]): unknown;

  extractDetail(...path: (keyof ZLogDetails)[]): unknown {

    const { message } = this;
    const last = path.length - 1;
    let { details } = message;

    if (last < 0) {
      // Empty path - extracting all details.
      this.changeMessage({ ...message, details: {} });

      return details;
    }

    let detailsReplacement!: Record<keyof ZLogDetails, unknown>;
    let updatedDetails: Record<keyof ZLogDetails, unknown> = {};

    for (let i = 0; ; ++i) {

      const key = path[i] as string;
      const value = details[key];

      if (value === undefined) {
        return;
      }
      if (!i) {
        detailsReplacement = updatedDetails = { ...details };
      }

      if (i === last) {
        delete updatedDetails[key];
        ZLogLine$compactDetails(detailsReplacement, path, 0);
        this.changeMessage({ ...message, details: detailsReplacement });
        return value;
      }

      if (value == null || typeof value !== 'object') {
        return; // No such detail.
      }

      updatedDetails = updatedDetails[key] = { ...value };
      details = value as ZLogDetails;
    }
  }

  /**
   * Formats a log message by the given field.
   *
   * @param field - The field to format the message by.
   * @param message - The message to format. {@link message Current message} by default.
   *
   * @returns Either a string written to log line, or `undefined` if nothing is written.
   */
  abstract format(field: ZLogField<this>, message?: ZLogMessage): string | undefined;

  /**
   * Writes raw string.
   *
   * @param value - Raw string to write.
   */
  abstract write(value: string): void;

  /**
   * Writes arbitrary value.
   *
   * @param value - A value to write.
   */
  writeValue(value: unknown): void {
    if (typeof value === 'string') {
      this.writeString(value);
    } else if (value != null && typeof value === 'object') {
      this.writeObject(value as object);
    } else {
      this.writeByDefault(value);
    }
  }

  /**
   * Writes an error.
   *
   * Writes a message and its stack trace.
   *
   * @param error - An error to write.
   */
  writeError(error: unknown): void {
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
   * @param value - A string to write.
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
   * @param value - Object value to write.
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
   * @param value - Object value to write.
   */
  writeProperties(value: object): void {

    let written = false;

    for (const key of Reflect.ownKeys(value)) {

      const formatted = this.format(line => line.writeKeyAndValue(
          key,
          (value as Record<PropertyKey, any>)[key as string],
      ));

      if (formatted != null) {
        if (written) {
          this.write(', ');
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
   * @param value - An iterable of elements to write.
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
   * @param key - Property key to write.
   * @param value - Property value to write.
   */
  writeKeyAndValue(key: PropertyKey, value: unknown): void {
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
   * @param value - A value to format.
   *
   * @returns Either formatted value, or nothing.
   */
  protected writeByDefault(value: unknown): void {
    this.write(String(value));
  }

}

function ZLogLine$compactDetails(
    details: Record<keyof ZLogDetails, any>,
    path: (keyof ZLogDetails)[],
    index: number,
): boolean {

  const key = path[index] as string;
  const nested = details[key];

  if (nested && ZLogLine$compactDetails(nested, path, index + 1)) {
    delete details[key];
  }

  return !Reflect.ownKeys(details).length;
}
