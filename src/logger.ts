/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { ZLogLevel } from './log-level';
import type { ZLogMessage } from './log-message';
import { zlogMessage } from './log-message';
import type { ZLogRecorder } from './log-recorder';

/**
 * Abstract message logger.
 *
 * Extends {@link ZLogRecorder log recorder} with convenient logging methods.
 */
export abstract class ZLogger implements ZLogRecorder {

  /**
   * Logs a message with specified log level.
   *
   * {@link zlogMessage Builds} a log message and {@link record records it}.
   *
   * @param level  The log level of the message.
   * @param args  Log message arguments.
   */
  log(level: number, ...args: any[]): void {
    this.record(zlogMessage(level, ...args));
  }

  /**
   * Logs {@link ZLogLevel.Fatal fatal error}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Fatal, ...args)}.
   *
   * @param args  Log message arguments.
   */
  fatal(...args: any[]): void {
    this.log(ZLogLevel.Fatal, ...args);
  }

  /**
   * Logs {@link ZLogLevel.Error error}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Error, ...args)}.
   *
   * @param args  Log message arguments.
   */
  error(...args: any[]): void {
    this.log(ZLogLevel.Error, ...args);
  }

  /**
   * Logs {@link ZLogLevel.Warning warning}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Warning, ...args)}.
   *
   * @param args  Log message arguments.
   */
  warn(...args: any[]): void {
    this.log(ZLogLevel.Warning, ...args);
  }

  /**
   * Logs {@link ZLogLevel.Info informational message}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Info, ...args)}.
   *
   * @param args  Log message arguments.
   */
  info(...args: any[]): void {
    this.log(ZLogLevel.Info, ...args);
  }

  /**
   * Logs {@link ZLogLevel.Debug debug message}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Debug, ...args)}.
   *
   * @param args  Log message arguments.
   */
  debug(...args: any[]): void {
    this.log(ZLogLevel.Debug, ...args);
  }

  /**
   * Logs {@link ZLogLevel.Trace trace message}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Trace, ...args)}.
   *
   * @param args  Log message arguments.
   */
  trace(...args: any[]): void {
    this.log(ZLogLevel.Trace, ...args);
  }

  abstract record(message: ZLogMessage): void;

  abstract whenLogged(): Promise<boolean>;

  abstract end(): Promise<void>;

}
