import { dueLogZ } from './due-log';
import type { ZLogMessage } from './log-message';

/**
 * Expands a log message by replacing its {@link ZLogMessage.error error} and {@link ZLogMessage.extra uninterpreted
 * parameters} with their loggable representations.
 *
 * If error or parameter is a {@link ZLoggable loggable value}, then extracts its {@link ZLoggable.toLog loggable
 * representation}, and processes as following:
 *
 * Processes log messages with {@link dueLogZ} in `out` stage.
 *
 * @param message - A message to expand.
 *
 * @returns Expanded log message.
 */
export function zlogExpand(message: ZLogMessage): ZLogMessage {
  return dueLogZ({
    on: 'out',
    zMessage: message,
  }).zMessage;
}
