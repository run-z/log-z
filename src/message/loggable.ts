import type { Loggable } from '@proc7ts/logger';
import type { DueLogZ } from './due-log';

/**
 * A value that may be logged by `log-z` in a custom way.
 *
 * Can be passed to {@link zlogMessage} function or to any {@link ZLogger.log logger method} to be processed.
 */
export interface ZLoggable<TTarget extends DueLogZ = DueLogZ> extends Loggable<TTarget> {
  toLog(target: TTarget): void | unknown;
}
