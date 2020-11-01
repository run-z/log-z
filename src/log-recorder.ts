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
   * Awaits for the recorded message(s) to be either logged or discarded.
   *
   * @param which  Which message to wait for. Either `"all"` to wait for all messages or `"last"` to wait for the last
   * message only. The default is `"last"`
   *
   * @returns A promise resolved to `true` if the last recorded message is logged, or to `false` if it is discarded.
   */
  whenLogged(which?: 'all' | 'last'): Promise<boolean>;

  /**
   * Ends log recording.
   *
   * All messages discarded after this method call.
   *
   * @returns A promise resolved when recorder stopped.
   */
  end(): Promise<void>;

}
