import type { ZLogMessage } from '../messages/log-message.js';

/**
 * Log message formatter signature.
 *
 * Formats the message and represents it in another form.
 *
 * @typeParam TForm - A type of formatted message form.
 * @param message - Log message to format.
 *
 * @returns Formatted message form, or `undefined` if nothing formatted.
 */
export type ZLogFormatter<TForm = string> = (this: void, message: ZLogMessage) => TForm | undefined;
