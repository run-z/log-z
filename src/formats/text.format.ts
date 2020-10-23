/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import { lotzLevel, lotzText } from '../tokens';
import type { ZLogFormatter } from './log-formatter';
import { ZLogLine } from './log-line';
import type { ZLogTokenizer } from './log-tokenizer';

/**
 * Textual log line.
 *
 * This is the default log line expected by many {@link ZLogTokenizer tokenizers}.
 */
export abstract class TextZLogLine extends ZLogLine {

  formatValue(value: any): string | null | undefined {
    if (typeof value === 'string') {
      return this.formatString(value);
    }
    if (value != null && typeof value === 'object') {
      return this.formatObject(value);
    }

    return this.formatByDefault(value);
  }

  formatError(error: any): string | null | undefined {
    if (error == null) {
      return;
    }
    if (error instanceof Error) {

      const { stack } = error;

      return stack ? `${String(error)} ${stack}` : String(error);
    }

    const str = this.formatValue(error);

    return str != null ? `[Error: ${str}]` : str;
  }

  /**
   * Formats arbitrary string.
   *
   * Encloses the string in double quotes by default.
   *
   * @param value  A string to format.
   *
   * @returns Either formatted string, or nothing.
   */
  formatString(value: string): string | null | undefined {
    return JSON.stringify(value);
  }

  formatObject(value: object): string | null | undefined {
    if (Array.isArray(value)) {

      const elements = this.formatElements(value);

      return elements != null ? `[${elements}]` : elements;
    }

    let out: string | undefined;

    for (const key of Reflect.ownKeys(value)) {

      const str = this.formatKeyAndValue(key as string | symbol, (value as any)[key]);

      if (str != null) {
        if (out) {
          out += '; ';
        } else {
          out = '{ ';
        }
        out += str;
      }
    }

    return out && out + ' }';
  }

  formatElements(value: Iterable<any>): string | null | undefined {

    let out: string | undefined;

    for (const param of value) {

      const str = this.formatValue(param);

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
  }

  formatKeyAndValue(key: PropertyKey, value: any): string | null | undefined {
    if (typeof key === 'symbol' || value === undefined) {
      return;
    }

    const str = this.formatValue(value);

    return str != null ? `${key}: ${str}` : str;
  }

  /**
   * Formats a value not formatted by {@link formatValue}.
   *
   * Returns a string representation of the value by default.
   *
   * @param value  A value to format.
   *
   * @returns Either formatted value, or nothing.
   */
  protected formatByDefault(value: any): string | null | undefined {
    return String(value);
  }

}

/**
 * Text log format.
 */
export interface TextZLogFormat {

  /**
   * Tokens to write to textual log.
   *
   * This is an array of:
   * - text tokenizers,
   * - strings delimiters between tokens,
   * - numeric values indicating the following tokens order.
   *
   * Tokenizers are applied in order of their presence. However, the order of tokens they write can be changed.
   * For that, a numeric order value can be used before tokenizer(s) or delimiters. By default, the order equals to `0`.
   */
  readonly tokens?: readonly (ZLogTokenizer<TextZLogLine> | number | string)[];

}

/**
 * @internal
 */
const defaultTextZLogTokens: Exclude<TextZLogFormat['tokens'], undefined> = [
    lotzLevel(),
    ' ',
    lotzText(),
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

    const allTokens = new Map<number, string[]>();
    let currentOrder = 0;
    let currentTokens: string[] = [];

    allTokens.set(currentOrder, currentTokens);

    class TextZLogLine$ extends TextZLogLine {

      get message(): ZLogMessage {
        return message;
      }

      changeMessage(newMessage: ZLogMessage): void {
        message = newMessage;
      }

      write(token: string | undefined | null): void {
        if (token != null) {
          currentTokens.push(token);
        }
      }

    }

    const formatted = new TextZLogLine$();
    const { tokens = defaultTextZLogTokens } = format;

    for (const token of tokens) {
      if (typeof token === 'function') {
        // Apply tokenizer.
        token(formatted);
      } else if (typeof token === 'string') {
        // Add separator.
        currentTokens.push(token);
      } else {
        // Change the order of the following tokens.
        currentOrder = token;

        const orderTokens = allTokens.get(currentOrder);

        if (orderTokens) {
          currentTokens = orderTokens;
        } else {
          currentTokens = [];
          allTokens.set(currentOrder, currentTokens);
        }
      }
    }

    return zlogTokensToText(allTokens);
  };
}

/**
 * @internal
 */
function zlogTokensToText(tokens: Map<number, string[]>): string {
  return [...tokens]
      .sort(([order1], [order2]) => order1 - order2)
      .flatMap(([, list]) => list)
      .join('');
}
