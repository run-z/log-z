import { ZLogLevel } from './levels/log-level.js';
import type { ZLogRecorder } from './log-recorder.js';
import type { ZLogger } from './logger.js';
import type { ZLogMessage } from './messages/log-message.js';
import { zlogMessage } from './messages/log-message.js';

class ZLogger$ implements ZLogger {

  readonly #by: ZLogRecorder;

  constructor(by: ZLogRecorder) {
    this.#by = by;
  }

  log(level: number, ...args: unknown[]): void {
    this.record(zlogMessage(level, ...args));
  }

  fatal(...args: unknown[]): void {
    this.log(ZLogLevel.Fatal, ...args);
  }

  error(...args: unknown[]): void {
    this.log(ZLogLevel.Error, ...args);
  }

  warn(...args: unknown[]): void {
    this.log(ZLogLevel.Warning, ...args);
  }

  info(...args: unknown[]): void {
    this.log(ZLogLevel.Info, ...args);
  }

  debug(...args: unknown[]): void {
    this.log(ZLogLevel.Debug, ...args);
  }

  trace(...args: unknown[]): void {
    this.log(ZLogLevel.Trace, ...args);
  }

  record(message: ZLogMessage): void {
    this.#by.record(message);
  }

  whenLogged(which?: 'all' | 'last'): Promise<boolean> {
    return this.#by.whenLogged(which);
  }

  end(): Promise<void> {
    return this.#by.end();
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
  return new ZLogger$(by);
}
