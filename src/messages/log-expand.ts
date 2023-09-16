import { dueLogZ } from './due-log.js';
import { cloneZLogDetails } from './log-details.js';
import type { ZLogMessage } from './log-message.js';

/**
 * Expands a log message.
 *
 * Processes logged values by {@link dueLogZ} in `out` stage.
 *
 * @param message - A message to expand.
 *
 * @returns Expanded log message.
 */
export function zlogExpand(message: ZLogMessage): ZLogMessage {
  return dueLogZ({
    on: 'out',
    line: message.line.slice(),
    zLevel: message.level,
    zDetails: cloneZLogDetails(message.details),
  }).zMessage;
}
