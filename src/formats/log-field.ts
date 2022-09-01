import type { ZLogWriter } from './log-writer';

/**
 * Log field signature.
 *
 * Formats and writes the field data extracted from {@link ZLogWriter.message log message} using provided
 * {@link ZLogWriter.write log writer}.
 *
 * @typeParam TWriter - Log writer type.
 */
export type ZLogField<TWriter extends ZLogWriter = ZLogWriter> =
  /**
   * @param writer - A writer to write the field with.
   */
  (this: void, writer: TWriter) => void;
