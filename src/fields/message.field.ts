/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogField } from '../formats';

/**
 * Creates a log field containing a {@link ZLogMessage.text log message text}.
 *
 * By default, writes message text as is.
 *
 * @param format  Message text format. A function accepting message text and returning it formatted.
 *
 * @returns Log level field.
 */
export function zlofMessage(
    format: (this: void, text: string) => string = (text: string) => text,
): ZLogField {
  return line => line.write(format(line.message.text));
}
