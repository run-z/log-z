import type { ZLogField } from '../formats';

/**
 * Log message {@link logZTimestamp timestamp} format.
 */
export interface TimestampZLogFieldFormat {

  /**
   * A key of {@link ZLogMessage.details log message details} property containing timestamp value.
   *
   * Timestamp value is expected to be either a Date, a number (i.e. epoch milliseconds), or preformatted string.
   * In the latter case no further formatting would be applied.
   */
  readonly key?: string;

  /**
   * Timestamp value format.
   *
   * Either formatting function accepting timestamp in epoch milliseconds and returning its string representation,
   * or an [Intl.DateTimeFormat] instance.
   *
   * By default, formats as [ISO 8601] string.
   *
   * [ISO 8601]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
   *
   * [Intl.DateTimeFormat]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
   */
  readonly format?: Intl.DateTimeFormat | ((this: void, timestamp: number) => string);

}

/**
 * Creates a log field of {@link logZTimestamp message timestamp}, if present.
 *
 * @param format - Log message {@link logZTimestamp timestamp} format.
 *
 * @returns Message timestamp field.
 */
export function timestampZLogField(
    format: TimestampZLogFieldFormat = {},
): ZLogField {

  const { format: tsFormat, key = 'timestamp' } = format;
  const doFormat = typeof tsFormat === 'function'
      ? tsFormat
      : (tsFormat
          ? (timestamp: number) => tsFormat.format(timestamp)
          : formatZLogTimestamp);

  return line => {

    const timestamp: number | string | Date = line.extractDetail(key);

    if (typeof timestamp === 'number') {
      line.write(doFormat(timestamp));
    } else if (typeof timestamp === 'string') {
      line.write(timestamp);
    } else if (timestamp && typeof timestamp === 'object') {
      line.write(doFormat(timestamp.getTime()));
    }
  };

}

/**
 * @internal
 */
function formatZLogTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
