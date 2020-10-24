/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogField, ZLogLine } from '../formats';

/**
 * Creates a log message error field, if present.
 *
 * @returns Log message error field.
 */
export function zlofError(): ZLogField {
  return formatZLogError;
}

/**
 * @internal
 */
function formatZLogError(line: ZLogLine): void {

  const error = line.message.error;

  if (error !== undefined) {
    line.writeError(error);
  }
}
