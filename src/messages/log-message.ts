import { ZLogLevel } from '../levels/log-level.js';
import { dueLogZ } from './due-log.js';
import type { ZLogDetails } from './log-details.js';

/**
 * Log message.
 *
 * Can be constructed by {@link zlogMessage} function.
 */
export interface ZLogMessage {
  /**
   * The log level of this message.
   *
   * The higher value means higher priority.
   */
  readonly level: ZLogLevel;

  /**
   * Log line containing arbitrary values to log.
   *
   * This is originally populated with the values passed to any {@link ZLogger.log logging method} or
   * {@link zlogMessage} function.
   */
  readonly line: readonly unknown[];

  /**
   * Message details map.
   *
   * The keys of this map are specific to application or log recorder implementation.
   */
  readonly details: ZLogDetails;
}

/**
 * Builds a log message.
 *
 * Processes log messages with {@link dueLogZ} in `in` stage.
 *
 * Processes {@link ZLoggable loggable} values. E.g. treats a loggable value created by {@link zlogDetails}
 * function as additional {@link ZLogMessage.details message details}.
 *
 * Treats everything else as {@link ZLogMessage.line message line}.
 *
 * @param level - Log level.
 * @param args - Log message arguments.
 *
 * @returns Constructed log message.
 */
export function zlogMessage(level: ZLogLevel, ...args: unknown[]): ZLogMessage {
  return dueLogZ({
    on: 'in',
    line: args,
    zLevel: level,
    zDetails: {},
  }).zMessage;
}
