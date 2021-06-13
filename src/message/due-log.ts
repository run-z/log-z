import type { DueLog } from '@proc7ts/logger';
import { dueLog } from '@proc7ts/logger';
import type { ZLogMessage } from './log-message';
import { zlogMessage$hasText } from './log-message.impl';

/**
 * A message about to be logged by {@link ZLogger}.
 *
 * Adds a {@link ZLogger}-specific properties atop of `DueLog`.
 */
export interface DueLogZ extends DueLog {

  /**
   * Log line to process and log.
   *
   * This is the same instance as `zMessage.extra`. It can be modified or replaced to change the latter.
   */
  line: unknown[];

  /**
   * Log message to process and log.
   *
   * Can be replaced to change athe message to log. Replaces the {@link line} with {@link ZLogMessage.extra} in this
   * case.
   *
   * When missing, the message is not processed by `log-z`. A {@link ZLoggable} instance should not perform any `log-z`-
   * specific processing in this case.
   */
  zMessage?: ZLogMessage;

}

export namespace DueLogZ {

  /**
   * A message to process before being logged by {@link ZLogger}.
   *
   * Has the same structure as {@link DueLogZ} but some properties may be initially omitted. They will be fulfilled
   * by {@link dueLogZ} before returned.
   */
  export interface Target {

    /**
     * A hint indicating the logging stage.
     *
     * @see DueLogZ.on
     */
    on?: string;

    /**
     * Log line to process.
     *
     * Ignored initially. Will be populated with `zMessage.extra`.
     *
     * @see DueLogZ.line
     */
    line?: unknown[];

    /**
     * Log message to process.
     *
     * @see DueLogZ.zMessage
     */
    zMessage: ZLogMessage;

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
    index?: number;

  }

  /**
   * Fully {@link dueLogZ processed} message about to be logged by {@link ZLogger}.
   */
  export interface Processed extends DueLogZ {

    /**
     * Processed log message.
     *
     * @see DueLogZ.zMessage
     */
    zMessage: ZLogMessage;

  }

}

const dueLogZ$handlers: DueLog.Handlers<DueLogZ.Processed> = {
  onRaw(target, value) {
    if (typeof value === 'string') {
      if (!zlogMessage$hasText(target.zMessage)) {
        target.zMessage = { ...target.zMessage, text: value };
        return [];
      }
    } else if (!target.zMessage.error) {
      if (value instanceof Error) {
        target.zMessage = {
          ...target.zMessage,
          error: value,
          text: target.zMessage.text || value.message,
        };
        return [];
      }
    }
    return;
  },
  onLoggable(target, value) {

    const { line, zMessage } = target;
    const toLog = value.toLog(target);

    if (zMessage !== target.zMessage) {
      if (target.zMessage.extra !== line) {

        const extra = target.zMessage.extra.slice();

        target.zMessage = { ...target.zMessage, extra };
        target.line = extra;
      }
    } else if (target.line !== line) {
      target.zMessage = { ...zMessage, extra: target.line };
    }

    return toLog;
  },
};

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

  const { index = 0 } = target;
  const extra = target.zMessage.extra.slice();
  const zMessage: ZLogMessage = { ...target.zMessage, extra };

  target.line = extra;
  target.index = Math.min(Math.max(index, 0), target.line.length);
  target.zMessage = zMessage;

  const t = target as TTarget & DueLogZ.Processed;

  dueLog(t, dueLogZ$handlers);

  return t;
}
