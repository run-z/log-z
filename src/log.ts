import { ZLogLevel } from './levels/log-level.js';
import { logZBy } from './log-by.js';
import type { ZLogRecorder } from './log-recorder.js';
import type { ZLogger } from './logger.js';
import { logZToLogger } from './logs/to-logger.log.js';
import { logZWhenLevel } from './logs/when-level.log.js';

/**
 * A specification of how to {@link logZ log}.
 */
export interface ZLogSpec {
  /**
   * The minimum log level of logged messages. The messages with lower levels will be discarded.
   *
   * Zero or negative value means to log everything.
   *
   * @default {@link ZLogLevel.Info Info}.
   */
  readonly atLeast?: number | undefined;

  /**
   * The log recorder to record messages by.
   *
   * @default {@link logZToLogger console log recorder}.
   */
  readonly by?: ZLogRecorder | undefined;
}

/**
 * Creates a logger that records messages by the given log recorder.
 *
 * @param how - A specification of how to log.
 *
 * @returns New message logger.
 */
export function logZ(how: ZLogSpec = {}): ZLogger {
  const { atLeast = ZLogLevel.Info, by = logZToLogger() } = how;

  return logZBy(logZWhenLevel(atLeast, by));
}
