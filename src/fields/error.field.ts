import type { ZLogField, ZLogWriter } from '../formats';

/**
 * Creates a log message error field, if present.
 *
 * An error is either the value of the `error` {@link ZLogMessage.details message details}, or the last element
 * of {@link ZLogMessage.line log line} if it is an `Error` instance.
 *
 * @returns Log message error field.
 */
export function errorZLogField(): ZLogField {
  return formatZLogError;
}

function formatZLogError(text: ZLogWriter): void {
  let error = text.extractDetail('error');

  if (error === undefined) {
    const { line } = text.message;
    const last = line[line.length - 1];

    if (!(last instanceof Error)) {
      return;
    }
    error = last;
    text.changeMessage({ ...text.message, line: line.slice(0, -1) });
  }

  text.writeError(error);
}
