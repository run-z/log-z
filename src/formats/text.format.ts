import { decoratorZLogField } from '../fields/decorator.field.js';
import { detailsZLogField } from '../fields/details.field.js';
import { errorZLogField } from '../fields/error.field.js';
import { levelZLogField } from '../fields/level.field.js';
import { messageZLogField } from '../fields/message.field.js';
import { timestampZLogField } from '../fields/timestamp.field.js';
import { ZLogMessage } from '../messages/log-message.js';
import { ZLogField } from './log-field.js';
import { ZLogFormatter } from './log-formatter.js';
import { ZLogWriter } from './log-writer.js';

/**
 * Text log format.
 */
export interface TextZLogFormat {
  /**
   * Fields to write.
   *
   * This is an array of:
   *
   * - {@link ZLogField log fields},
   * - string delimiters between non-empty fields (prefixes and suffixes are always added),
   * - numeric values indicating the following fields order.
   *
   * Fields are applied in order of their presence. However, the written data can be reordered. For that, a numeric
   * order value can be used before fields or delimiters. By default, the order value is `0`.
   *
   * @default Built by {@link TextZLogFormat:object.defaultFields TextZLogFormat.defaultFields()}.
   */
  readonly fields?: readonly (ZLogField | number | string)[] | undefined;
}

export const TextZLogFormat = {
  /**
   * Builds log fields used by default by {@link textZLogFormatter text log format}.
   *
   * @returns Array of log fields and delimiters.
   */
  defaultFields(): Exclude<TextZLogFormat['fields'], undefined> {
    return [
      1,
      ' ',
      errorZLogField(),
      0,
      timestampZLogField(),
      ' ',
      levelZLogField(),
      ' ',
      messageZLogField(),
      ' ',
      decoratorZLogField(
        {
          prefix: '{ ',
          suffix: ' }',
        },
        detailsZLogField(),
      ),
    ];
  },
};

/**
 * Creates a textual log formatter of the message.
 *
 * @param format - Custom text log format.
 *
 * @returns A log formatter constructing a textual form of log messages.
 */
export function textZLogFormatter(format: TextZLogFormat = {}): ZLogFormatter {
  const { fields = TextZLogFormat.defaultFields() } = format;

  return message => zlogMessageText(fields, [message]);
}

function zlogMessageText(
  fields: Exclude<TextZLogFormat['fields'], undefined>,
  state: [message: ZLogMessage],
): string | undefined {
  const outputByOrder = new Map<number, Written[]>();
  let currentOrder = 0;
  let currentOutput: Written[] = [];

  outputByOrder.set(currentOrder, currentOutput);

  class ZLogWriter$ extends ZLogWriter {
    get message(): ZLogMessage {
      return state[0];
    }

    changeMessage(newMessage: ZLogMessage): void {
      state[0] = newMessage;
    }

    write(value: string): void {
      currentOutput.push([value]);
    }

    format(field: ZLogField<this>, message?: ZLogMessage): string | undefined {
      return zlogMessageText([field as ZLogField], message ? [message] : state);
    }
  }

  const writer = new ZLogWriter$();

  for (const field of fields) {
    if (typeof field === 'function') {
      // Render field.
      field(writer);
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
}

type Written = readonly [value?: string, isSeparator?: 1];

function zlogLineOutputText(outputByOrder: Map<number, Written[]>): string | undefined {
  const allWritten: [number, Written[]][] = [...outputByOrder].sort(
    ([order1], [order2]) => order1 - order2,
  );

  let prefix: string | undefined;
  let hasFields = false;
  let prevHasValue = true;
  let fieldHasValue = false;
  let delimiter: string | undefined;
  let text: string | undefined;

  allWritten.forEach(([, output]) => {
    output.forEach(([value, isDelimiter]) => {
      if (isDelimiter) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        delimiter = delimiter ? delimiter + value : value;
      } else {
        if (!hasFields) {
          prefix = delimiter;
          hasFields = true;
          delimiter = undefined;
        }

        if (value != null) {
          text ||= '';
          if (value) {
            fieldHasValue = true;
            text += prevHasValue && delimiter ? delimiter + value : value;
          }
        } else {
          prevHasValue = fieldHasValue;
        }

        delimiter = undefined;
      }
    });
  });

  if (!hasFields) {
    return delimiter;
  }

  if (text == null) {
    return prefix == null ? delimiter : delimiter == null ? prefix : prefix + delimiter;
  }

  return (prefix || '') + text + (delimiter || ''); // Prefix and suffix delimiters are always added
}
