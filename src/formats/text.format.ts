/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { zlofLevel, zlofMessage } from '../fields';
import type { ZLogMessage } from '../log-message';
import type { ZLogField } from './log-field';
import type { ZLogFormatter } from './log-formatter';
import { ZLogLine } from './log-line';

/**
 * Text log format.
 */
export interface TextZLogFormat {

  /**
   * Fields to write to each log line.
   *
   * This is an array of:
   *
   * - {@link ZLogField log fields},
   * - string delimiters between non-empty fields (prefixes and suffixes are always added),
   * - numeric values indicating the following fields order.
   *
   * Fields are applied in order of their presence. However, the written data can be reordered. For that, a numeric
   * order value can be used before fields or delimiters. By default, the order value is `0`.
   */
  readonly fields?: readonly (ZLogField | number | string)[];

}

/**
 * @internal
 */
const defaultTextZLogFields: Exclude<TextZLogFormat['fields'], undefined> = [
  (/*#__PURE__*/ zlofLevel()),
  ' ',
  (/*#__PURE__*/ zlofMessage()),
];

/**
 * Creates a textual log formatter of the message.
 *
 * @param format  Custom text log format.
 *
 * @returns A log formatter constructing a textual form of log messages.
 */
export function textZLogFormatter(format: TextZLogFormat = {}): ZLogFormatter {
  return message => {

    const outputByOrder = new Map<number, Written[]>();
    let currentOrder = 0;
    let currentOutput: Written[] = [];

    outputByOrder.set(currentOrder, currentOutput);

    class ZLogLine$ extends ZLogLine {

      get message(): ZLogMessage {
        return message;
      }

      changeMessage(newMessage: ZLogMessage): void {
        message = newMessage;
      }

      write(value: string | undefined | null): void {
        if (value != null) {
          currentOutput.push([value]);
        }
      }

    }

    const formatted = new ZLogLine$();
    const { fields = defaultTextZLogFields } = format;

    for (const field of fields) {
      if (typeof field === 'function') {
        // Render field.
        field(formatted);
        currentOutput.push([]);
      } else if (typeof field === 'string') {
        // Add delimiter.
        currentOutput.push([field, 1]);
      } else {
        // Change the order of the following fields.
        currentOrder = field;

        const orderTokens = outputByOrder.get(currentOrder);

        if (orderTokens) {
          currentOutput = orderTokens;
        } else {
          currentOutput = [];
          outputByOrder.set(currentOrder, currentOutput);
        }
      }
    }

    return zlogLineOutputText(outputByOrder);
  };
}

/**
 * @internal
 */
type Written = readonly [value?: string, isSeparator?: 1];

/**
 * @internal
 */
function zlogLineOutputText(outputByOrder: Map<number, Written[]>): string {

  const allWritten: [number, Written[]][] = [...outputByOrder].sort(([order1], [order2]) => order1 - order2);

  let prefix: string | undefined;
  let delimiter = '';
  let text = '';

  allWritten.forEach(([, output]) => {
    output.forEach(([value, isDelimiter]) => {
      if (isDelimiter) {
        delimiter += value;
      } else if (value) {
        text += `${delimiter}${value}`;
        delimiter = '';
        prefix ||= '';
      } else {
        if (prefix == null) {
          prefix = delimiter;
        }
        delimiter = '';
      }
    });
  });

  return (prefix || '') + text + delimiter; // First and last delimiters are always added
}
