/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from './log-message';

/**
 * Log recorder.
 *
 * Records messages to the log.
 */
export interface ZLogRecorder {

  /**
   * Records a log message.
   *
   * The actual logging of the message can be asynchronous.
   *
   * @param message  A message to record.
   */
  record(message: ZLogMessage): void;

  /**
   * Awaits for the last recorded message to be either logged or discarded.
   *
   * @returns A promise resolved to `true` when the last recorded message is logged, or to `false` when it is discarded.
   */
  whenLogged(): Promise<boolean>;

  /**
   * Ends log recording.
   *
   * All messages discarded after this method call.
   *
   * @returns A promise resolved when recorder stopped.
   */
  end(): Promise<void>;

}
