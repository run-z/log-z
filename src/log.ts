import { ZLogLevel } from './level';
import { logZBy } from './log-by';
import type { ZLogRecorder } from './log-recorder';
import type { ZLogger } from './logger';
import { logZToLogger, logZWhenLevel } from './logs';

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
  readonly atLeast?: ZLogLevel | undefined;

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

  const {
    atLeast = ZLogLevel.Info,
    by = logZToLogger(),
  } = how;

  return logZBy(logZWhenLevel(atLeast, by));
}
