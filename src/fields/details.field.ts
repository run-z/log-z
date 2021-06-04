import type { ZLogField, ZLogLine } from '../formats';

/**
 * A field for {@link ZLogMessage.details message details}.
 */
export function detailsZLogField(): ZLogField;

/**
 * Creates a field for {@link ZLogMessage.details message details}.
 *
 * @returns Itself for the convenience.
 */
export function detailsZLogField(line: ZLogLine): void;

export function detailsZLogField(line?: ZLogLine): ZLogField | void {
  if (line) {
    line.writeProperties(line.message.details);
  } else {
    return detailsZLogField;
  }
}
