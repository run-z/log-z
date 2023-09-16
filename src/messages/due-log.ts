import type { DueLog } from '@proc7ts/logger';
import { dueLog } from '@proc7ts/logger';
import { ZLogLevel } from '../levels/log-level.js';
import type { ZLogDetails } from './log-details.js';
import type { ZLogMessage } from './log-message.js';

/**
 * A message about to be logged by {@link ZLogger}.
 *
 * Adds a {@link ZLogger}-specific properties atop of `DueLog`.
 */
export interface DueLogZ extends DueLog {
  /**
   * Log line to process and log.
   *
   * Can be modified or replaced to change the final {@link ZLogMessage.line log line}.
   */
  line: unknown[];

  /**
   * Log level to process and log.
   *
   * Can be modified to change the final {@link ZLogMessage.level log level}.
   */
  zLevel?: ZLogLevel | undefined;

  /**
   * Log message details to process and log.
   *
   * Can be modified or replaced to change the final {@link ZLogMessage.details message details}.
   *
   * When missing, the message is not processed by `log-z`. A {@link ZLoggable} instance should not perform any `log-z`-
   * specific processing in this case.
   */
  zDetails?: ZLogDetails.Mutable | undefined;
}

export namespace DueLogZ {
  /**
   * A message to process before being logged by {@link ZLogger}.
   *
   * Has the same structure as {@link DueLogZ} but some properties may be initially omitted. They will be fulfilled
   * by {@link dueLogZ} before returned.
   */
  export interface Target extends DueLog.Target {
    /**
     * A hint indicating the logging stage.
     *
     * @see DueLogZ.on
     */
    on?: string | undefined;

    /**
     * Log line to process.
     *
     * Populated with {@link ZLogMessage.line log line} initially.
     *
     * @see DueLogZ.line
     */
    line: unknown[];

    /**
     * Log level to process.
     *
     * Populated with message {@link ZLogMessage.level log level} initially.
     *
     * @see DueLogZ.zLevel
     */
    zLevel: ZLogLevel;

    /**
     * Log message details to process.
     *
     * Populated with message {@link ZLogMessage.details details} initially.
     *
     * @see DueLogZ.zDetails
     */
    zDetails: ZLogDetails.Mutable;

    /**
     * An index of the first element of the log {@link line} to process.
     *
     * Defaults to `0`. When set to negative value, reset to `0`. When set to the value greater than the length of the
     * log line, reset to the log line length.
     *
     * After processing will be set to the value equal or greater then the length of the final log line.
     *
     * @see DueLogZ.index
     */
    index?: number | undefined;
  }

  /**
   * Fully {@link dueLogZ processed} message about to be logged by {@link ZLogger}.
   */
  export interface Processed extends DueLogZ.Target, DueLog {
    index: number;

    /**
     * Processed log message.
     */
    readonly zMessage: ZLogMessage;
  }
}

/**
 * Processes the target log message for {@link ZLogger}.
 *
 * @typeParam TTarget - A type of the message to process.
 * @param target - Target (mutable) message to process.
 *
 * @returns Processed `target` message.
 *
 * @see Loggable.toLog for loggable value processing rules.
 */
export function dueLogZ<TTarget extends DueLogZ.Target>(
  target: TTarget,
): TTarget & DueLogZ.Processed {
  const processed = dueLog<DueLogZ.Target>(target) as TTarget & DueLogZ.Processed;

  (processed as { zMessage: ZLogMessage }).zMessage = {
    level: processed.zLevel,
    line: processed.line,
    details: processed.zDetails,
  };

  return processed;
}
