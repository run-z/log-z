/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';

/**
 * Log message formatter signature.
 *
 * Formats the message and represents it in another form.
 *
 * @typeParam TForm  A type of formatted message form.
 */
export type ZLogFormatter<TForm = string> =
/**
 * @param message - Log message to format.
 *
 * @returns Formatted message form, or `undefined` if nothing formatted.
 */
    (this: void, message: ZLogMessage) => TForm | undefined;
