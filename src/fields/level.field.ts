import type { ZLogField } from '../formats';
import type { ZLogLevel } from '../level';
import { zlogLevelAbbr5 } from '../level';

/**
 * Creates a log level field.
 *
 * By default, log level is written as `[LEVEL]`, where `LEVEL` is an {@link zlogLevelAbbr5 upper-case abbreviation
 * and padded to 5 letters}.
 *
 * @param format - Log level format. A function accepting log level and returning its string representation.
 *
 * @returns Log level field.
 */
export function levelZLogField(
    format: (this: void, level: ZLogLevel) => string = defaultZLogLevelFormat,
): ZLogField {
  return line => line.write(format(line.message.level));
}

/**
 * @internal
 */
function defaultZLogLevelFormat(level: ZLogLevel): string {
  return `[${zlogLevelAbbr5(level)}]`;
}
