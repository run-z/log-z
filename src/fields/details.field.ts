import type { ZLogField, ZLogWriter } from '../formats';

/**
 * A field for {@link ZLogMessage.details message details}.
 */
export function detailsZLogField(): ZLogField;

/**
 * Creates a field for {@link ZLogMessage.details message details}.
 *
 * @returns Itself for the convenience.
 */
export function detailsZLogField(writer: ZLogWriter): void;

export function detailsZLogField(writer?: ZLogWriter): ZLogField | void {
  if (!writer) {
    return detailsZLogField;
  }

  writer.writeProperties(writer.message.details);
}
