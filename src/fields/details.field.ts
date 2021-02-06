import type { ZLogField, ZLogLine } from '../formats';

/**
 * Creates a log field for {@link ZLogMessage.details message details}.
 *
 * @returns Log extra field.
 */
export function detailsZLogField(): ZLogField {
  return formatZLogDetails;
}

/**
 * @internal
 */
function formatZLogDetails(line: ZLogLine): void {
  line.writeProperties(line.message.details);
}
