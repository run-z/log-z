/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogLevel } from './log-level';
import type { ZLogRecorder } from './log-recorder';
import type { ZLogger } from './logger';
import { consoleZLogRecorder, levelZLogRecorder, RecordingZLogger } from './recorders';

/**
 * Logger configuration.
 */
export interface ZLoggerConfig {

  /**
   * The minimum log level of logged messages. The messages with lower levels will be discarded.
   *
   * @default {@link ZLogLevel.Info Info}.
   */
  readonly level?: ZLogLevel;

  /**
   * The log recorder to record messages with.
   *
   * @default {@link consoleZLogRecorder console log recorder}.
   */
  readonly recorder?: ZLogRecorder;

}

/**
 * Creates a logger that records messages with the given log recorder.
 *
 * @param config  New logger configuration.
 *
 * @returns New message logger.
 */
export function createZLogger(config: ZLoggerConfig = {}): ZLogger {

  const {
    recorder = consoleZLogRecorder(),
    level,
  } = config;

  return new RecordingZLogger(levelZLogRecorder(recorder, level));
}
