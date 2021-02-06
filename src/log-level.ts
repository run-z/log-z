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
 * @param level - Log level value.
 *
 * @returns Log level name.
 */
export function zlogLevelName(
    level: ZLogLevel,
): 'Fatal' | 'Error' | 'Warning' | 'Info' | 'Debug' | 'Trace' | 'Silly' {
  return zlogLevelMap(level, defaultZLogLevelNames);
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
 * @param level - Log level value.
 *
 * @returns Log level abbreviation.
 */
export function zlogLevelAbbr(
    level: ZLogLevel,
): 'FATAL' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'SILLY' {
  return zlogLevelMap(level, defaultZLogLevelAbbrs);
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
 * @param level - Log level value.
 *
 * @returns Log level abbreviation.
 */
export function zlogLevelAbbr5(
    level: ZLogLevel,
): 'FATAL' | 'ERROR' | 'WARN ' | 'INFO ' | 'DEBUG' | 'TRACE' | 'SILLY' {
  return zlogLevelMap(level, defaultZLogLevelAbbrs5);
}

/**
 * Maps the {@link ZLogMessage.level log level} to other value.
 *
 * @param level - Log level value.
 * @param values - Array of values corresponding to log levels, from lowest (i.e. below {@link ZLogLevel.Trace})
 * to highest.
 *
 * @returns The value corresponding to the log level.
 */
export function zlogLevelMap<T>(level: ZLogLevel, values: readonly [T, ...T[]]): T {
  return values[Math.max(0, Math.min(Math.floor(level / 10), values.length))];
}

/**
 * Extracts a log level represented by the given value.
 *
 * - If the given value is numeric, then returns it.
 * - If the given value is object or function, and has a `toLogLevel()` method, then returns this method call result
 *   converted to number, unless it is a `NaN`.
 *
 * @param value - A value to extract the number log level from.
 *
 * @returns Either extracted log level value, or `undefined`.
 */
export function zlogLevelOf(value: any): number | undefined {
  if (typeof value === 'number') {
    return value;
  }

  if (hasLogLevel(value)) {

    const logLevel = +value.toLogLevel();

    return Number.isNaN(logLevel) ? undefined : logLevel;
  }

  return;
}

/**
 * @internal
 */
function hasLogLevel(value: any): value is { toLogLevel(): ZLogLevel } {
  return value
      && (typeof value === 'object' || typeof value === 'function')
      && typeof (value as { toLogLevel?: unknown }).toLogLevel === 'function';
}
