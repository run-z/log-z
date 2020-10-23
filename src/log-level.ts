/**
 * @packageDocumentation
 * @module @run-z/log-z
 */

/**
 * Default log level values.
 *
 * The same as [Bunyan log levels].
 *
 * [Bunyan log levels]: https://github.com/trentm/node-bunyan#levels
 */
export const enum ZLogLevel {

  /**
   * The service/app is going to stop or become unusable now. An operator should definitely look into this soon.
   */
  Fatal = 60,

  /**
   * Fatal for a particular request, but the service/app continues servicing other requests.
   * An operator should look at this soon(ish).
   */
  Error = 50,

  /**
   * A note on something that should probably be looked at by an operator eventually.
   */
  Warning = 40,

  /**
   * Detail on regular operation.
   */
  Info = 30,

  /**
   * Anything else, i.e. too verbose to be included in "info" level.
   */
  Debug = 20,

  /**
   * Logging from external libraries used by your app or very detailed application logging.
   */
  Trace = 10,

}

/**
 * @internal
 */
const defaultZLogLevelNames = ['Silly', 'Trace', 'Debug', 'Info', 'Warning', 'Error', 'Fatal'] as const;

/**
 * Detects {@link ZLogMessage.level log level} name by its numeric value.
 *
 * Returns upper-case log level abbreviation:
 * - `'Fatal'`
 * - `'Error'`
 * - `'Warning'`,
 * - `'Info'`,
 * - `'Debug'`,
 * - `'Trace'`,
 * - `'Silly'` (for values below {@link ZLogLevel.Trace Trace}.
 *
 * @param level  Log level value.
 *
 * @returns Log level name.
 */
export function zlogLevelName(level: ZLogLevel): string {
  return zlogLevelCustomName(level, defaultZLogLevelNames);
}

/**
 * @internal
 */
const defaultZLogLevelAbbrs = ['SILLY', 'TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] as const;

/**
 * Detects {@link ZLogMessage.level log level} abbreviation by its numeric value.
 *
 * Log level abbreviations are:
 * - `'FATAL'`
 * - `'ERROR'`
 * - `'WARN'`,
 * - `'INFO'`,
 * - `'DEBUG'`,
 * - `'TRACE'`,
 * - `'SILLY'` (for values below {@link ZLogLevel.Trace Trace}.
 *
 * @param level  Log level value.
 *
 * @returns Log level abbreviation.
 */
export function zlogLevelAbbr(level: ZLogLevel): string {
  return zlogLevelCustomName(level, defaultZLogLevelAbbrs);
}

/**
 * @internal
 */
const defaultZLogLevelAbbrs5 = ['SILLY', 'TRACE', 'DEBUG', 'INFO ', 'WARN ', 'ERROR', 'FATAL'] as const;

/**
 * Detects 5-letter {@link ZLogMessage.level log level} abbreviation.
 *
 * Log level abbreviation are right-padded with spaces to 5 letters:
 * - `'FATAL'`
 * - `'ERROR'`
 * - `'WARN '`,
 * - `'INFO '`,
 * - `'DEBUG '`,
 * - `'TRACE'`,
 * - `'SILLY'` (for values below {@link ZLogLevel.Trace Trace}.
 *
 * @param level  Log level value.
 *
 * @returns Log level abbreviation.
 */
export function zlogLevelAbbr5(level: ZLogLevel): string {
  return zlogLevelCustomName(level, defaultZLogLevelAbbrs5);
}

/**
 * Detects custom {@link ZLogMessage.level log level} name by its numeric value.
 *
 * @param level  Log level value.
 * @param names  Array of log level names, from lowest (i.e. below {@link ZLogLevel.Trace}) to highest.
 *
 * @returns Custom log level name.
 */
export function zlogLevelCustomName(
    level: ZLogLevel,
    names: readonly [string, string?, string?, string?, string?, string?, string?],
): string {
  return names[Math.max(0, Math.min(Math.floor(level / 10), names.length))] as string;
}
