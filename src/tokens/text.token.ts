/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogLine, ZLogLineToken, ZLogTokenizer } from '../formats';

export function lotzText(): ZLogTokenizer;

export function lotzText<TFormatted extends ZLogLine<unknown>>(
    format: (this: void, text: string) => ZLogLineToken<TFormatted>,
): ZLogTokenizer<TFormatted>;

export function lotzText<TLine extends ZLogLine<unknown>>(
    format = (text: string) => text as ZLogLineToken<TLine>,
): ZLogTokenizer<TLine> {
  return line => line.write(format(line.message.text));
}
