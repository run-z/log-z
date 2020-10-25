/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogField, ZLogLine } from '../formats';

/**
 * Creates a log field for {@link ZLogMessage.extra unrecognized message parameters}.
 *
 * @returns Log extra field.
 */
export function extraZLogField(): ZLogField {
  return formatZLogExtra;
}

/**
 * @internal
 */
function formatZLogExtra(line: ZLogLine): void {

  const extra = line.message.extra;

  if (extra.length) {
    line.writeElements(extra);
  }
}
