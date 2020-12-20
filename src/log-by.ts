/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from './log-message';
import type { ZLogRecorder } from './log-recorder';
import { ZLogger } from './logger';

/**
 * @internal
 */
class DelegatingZLogger extends ZLogger {

  constructor(private readonly _by: ZLogRecorder) {
    super();
  }

  record(message: ZLogMessage): void {
    this._by.record(message);
  }

  whenLogged(which?: 'all' | 'last'): Promise<boolean> {
    return this._by.whenLogged(which);
  }

  end(): Promise<void> {
    return this._by.end();
  }

}

/**
 * Creates message logger that logs messages by the given recorder.
 *
 * Unlike {@link logZ} this function does not process messages in any way prior to record them.
 *
 * @param by - The recorder to log messages by.
 *
 * @returns New message logger.
 */
export function logZBy(by: ZLogRecorder): ZLogger {
  return new DelegatingZLogger(by);
}
