/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { zlofLevel, zlofText } from '../fields';
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
   * - string delimiters between fields,
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
    zlofLevel(),
    ' ',
    zlofText(),
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

    const fullOutput = new Map<number, string[]>();
    let currentOrder = 0;
    let currentOutput: string[] = [];

    fullOutput.set(currentOrder, currentOutput);

    class ZLogLine$ extends ZLogLine {

      get message(): ZLogMessage {
        return message;
      }

      changeMessage(newMessage: ZLogMessage): void {
        message = newMessage;
      }

      write(value: string | undefined | null): void {
        if (value != null) {
          currentOutput.push(value);
        }
      }

    }

    const formatted = new ZLogLine$();
    const { fields = defaultTextZLogFields } = format;

    for (const field of fields) {
      if (typeof field === 'function') {
        // Apply field.
        field(formatted);
      } else if (typeof field === 'string') {
        // Add separator.
        currentOutput.push(field);
      } else {
        // Change the order of the following tokens.
        currentOrder = field;

        const orderTokens = fullOutput.get(currentOrder);

        if (orderTokens) {
          currentOutput = orderTokens;
        } else {
          currentOutput = [];
          fullOutput.set(currentOrder, currentOutput);
        }
      }
    }

    return zlogLineOutputToText(fullOutput);
  };
}

/**
 * @internal
 */
function zlogLineOutputToText(output: Map<number, string[]>): string {
  return [...output]
      .sort(([order1], [order2]) => order1 - order2)
      .flatMap(([, list]) => list)
      .join('');
}
