import type { ZLogRecorder } from './log-recorder';

/**
 * Message logger interface.
 *
 * Extends {@link ZLogRecorder log recorder} with convenient logging methods.
 */
export interface ZLogger extends ZLogRecorder {

  /**
   * Logs a message with specified log level.
   *
   * {@link zlogMessage Builds} a log message and {@link record records it}.
   *
   * @param level - The log level of the message.
   * @param args - Log message arguments.
   */
  log(level: number, ...args: unknown[]): void;

  /**
   * Logs {@link ZLogLevel.Fatal fatal error}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Fatal, ...args)}.
   *
   * @param args - Log message arguments.
   */
  fatal(...args: unknown[]): void;

  /**
   * Logs {@link ZLogLevel.Error error}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Error, ...args)}.
   *
   * @param args - Log message arguments.
   */
  error(...args: unknown[]): void;

  /**
   * Logs {@link ZLogLevel.Warning warning}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Warning, ...args)}.
   *
   * @param args - Log message arguments.
   */
  warn(...args: unknown[]): void;

  /**
   * Logs {@link ZLogLevel.Info informational message}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Info, ...args)}.
   *
   * @param args - Log message arguments.
   */
  info(...args: unknown[]): void;

  /**
   * Logs {@link ZLogLevel.Debug debug message}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Debug, ...args)}.
   *
   * @param args - Log message arguments.
   */
  debug(...args: unknown[]): void;

  /**
   * Logs {@link ZLogLevel.Trace trace message}.
   *
   * Calling this method is the same as calling {@link log log(ZLogMessage.Trace, ...args)}.
   *
   * @param args - Log message arguments.
   */
  trace(...args: unknown[]): void;

}
