/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { logZBy } from './log-by';
import { ZLogLevel } from './log-level';
import type { ZLogRecorder } from './log-recorder';
import type { ZLogger } from './logger';
import { logZToConsole, logZWhenLevel } from './logs';

/**
 * A specification of how to {@link logZ log}.
 */
export interface ZLogSpec {

  /**
   * The minimum log level of logged messages. The messages with lower levels will be discarded.
   *
   * @default {@link ZLogLevel.Info Info}.
   */
  readonly atLeast?: ZLogLevel;

  /**
   * The log recorder to record messages by.
   *
   * @default {@link logZToConsole console log recorder}.
   */
  readonly by?: ZLogRecorder;

}

/**
 * Creates a logger that records messages by the given log recorder.
 *
 * @param how  A specification of how to log.
 *
 * @returns New message logger.
 */
export function logZ(how: ZLogSpec = {}): ZLogger {

  const {
    atLeast = ZLogLevel.Info,
    by = logZToConsole(),
  } = how;

  return logZBy(logZWhenLevel(atLeast, by));
}
