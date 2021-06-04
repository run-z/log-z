import type { ZLogField, ZLogLine } from '../formats';

/**
 * Creates a log field for {@link ZLogMessage.details message details}.
 *
 * @returns Log details field.
 */
export function detailsZLogField(): ZLogField {
  return detailsZLogField$write;
}

function detailsZLogField$write(line: ZLogLine): void {
  line.writeProperties(line.message.details);
}
