/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import type { ZLogFormat } from './log-format';
import { zlogFormat } from './log-format';

/**
 * Log message formatter signature.
 *
 * Builds a string representation of the message.
 */
export type ZLogFormatter =
/**
 * @param message  Log message to format.
 *
 * @returns String representation of the message.
 */
    (this: void, message: ZLogMessage) => string;

/**
 * Builds a log message formatter for the given format.
 *
 * @param format  Log message format.
 *
 * @returns Message formatter.
 */
export function zlogFormatter(format?: ZLogFormat): ZLogFormatter {

  const fullFormat = zlogFormat(format);

  return message => {

    let out = fullFormat.level(message);

    out = spaceSeparate(out, fullFormat.text(message));
    out = spaceSeparate(out, fullFormat.extra(message));
    out = spaceSeparate(out, fullFormat.details(message));
    out = spaceSeparate(out, fullFormat.error(message));

    return out;
  };
}

/**
 * @internal
 */
function spaceSeparate(out: string, field: string | null | undefined): string {
  return field
      ? (out ? out + ' ' + field : field)
      : out;
}
