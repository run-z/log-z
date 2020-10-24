/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogLine } from './log-line';

/**
 * Log field signature.
 *
 * Writes field data extracted from {@link ZLogLine.message log message} to provided {@link ZLogLine.write log line}.
 *
 * @typeParam TLine  Log line type.
 */
export type ZLogField<TLine extends ZLogLine = ZLogLine> =
/**
 * @param line  Log line to write field data to.
 */
    (this: void, line: TLine) => void;
