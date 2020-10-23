/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogLine } from './log-line';

/**
 * Log message tokenizer signature.
 *
 * Extracts tokens from log message and {@link ZLogLine.write writes} them to the {@link ZLogLine log line}
 * representing that message.
 *
 * @typeParam TLine  Log line type.
 */
export type ZLogTokenizer<TLine extends ZLogLine<unknown> = ZLogLine> =
/**
 * @param line  Log line to write tokens to.
 */
    (this: void, line: TLine) => void;
