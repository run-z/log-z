/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogLine, ZLogLineToken, ZLogTokenizer } from '../formats';
import type { ZLogLevel } from '../log-level';
import { zlogLevelAbbr5 } from '../log-level';

/**
 * Creates log tokenizer that writes a log level token to textual log line.
 *
 * Log level token has a form `[LEVEL]`, where `LEVEL` is an {@link zlogLevelAbbr5 upper-case abbreviation and padded
 * to 5 letters}.
 *
 * @returns New textual log tokenizer.
 */
export function lotzLevel(): ZLogTokenizer;

/**
 * Creates log tokenizer that writes a log level token to log line.
 *
 * @typeParam TLine  Log line type.
 * @param format  Log level format. This is a function accepting log level and returning its token.
 *
 * @returns New textual log tokenizer.
 */
export function lotzLevel<TLine extends ZLogLine<unknown>>(
    format: (this: void, level: ZLogLevel) => ZLogLineToken<TLine>,
): ZLogTokenizer<TLine>;

export function lotzLevel<TLine extends ZLogLine<unknown>>(
    format: (this: void, level: ZLogLevel) => ZLogLineToken<TLine> = defaultZLogLevelFormat,
): ZLogTokenizer<TLine> {
  return line => line.write(format(line.message.level));
}

/**
 * @internal
 */
function defaultZLogLevelFormat<TLine extends ZLogLine<unknown>>(
    level: ZLogLevel,
): ZLogLineToken<TLine> {
  return ('[' + zlogLevelAbbr5(level) + ']') as ZLogLineToken<TLine>;
}
