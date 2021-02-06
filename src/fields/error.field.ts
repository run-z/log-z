import type { ZLogField, ZLogLine } from '../formats';

/**
 * Creates a log message error field, if present.
 *
 * @returns Log message error field.
 */
export function errorZLogField(): ZLogField {
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
