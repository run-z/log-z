import { valueProvider } from '@proc7ts/primitives';
import type { ZLogMessage } from '../message';
import { zlogMessage } from '../message';
import { ZLogLevel } from './log-level';

/**
 * A function representing particular log level.
 *
 * - Implements a `valueOf()` method returning a numeric log level value.
 * - Implements a `toJSON()` method returning a numeric log level value.
 * - Implements a `toLogLevel()` method returning a numeric log level value.
 * - Implements a `toString()` method returning a {@link zlogLevelAbbr short log level name}.
 * - When called, returns a log message constructed by {@link zlogMessage} with corresponding log level.
 */
export type ZLogLevelFn = {
  (this: void, ...args: unknown[]): ZLogMessage;
  valueOf(): ZLogLevel;
  toJSON(): ZLogLevel;
  toLogLevel(): ZLogLevel;
} & ZLogLevel;

/**
 * @internal
 */
function newZLogLevel(level: ZLogLevel, name: string): ZLogLevelFn {
  const levelFn = ((...args: unknown[]) => zlogMessage(level, ...args)) as ZLogLevelFn;

  levelFn.toLogLevel = levelFn.toJSON = levelFn.valueOf = valueProvider(level);
  levelFn.toString = valueProvider(name);

  return levelFn;
}

/**
 * Builds a log message with {@link ZLogLevel.Fatal FATAL} level.
 *
 * Can be used as a log level value.
 */
export const zlogFATAL: ZLogLevelFn = /*#__PURE__*/ newZLogLevel(ZLogLevel.Fatal, 'FATAL');

/**
 * Builds a log message with {@link ZLogLevel.Error ERROR} level.
 *
 * Can be used as a log level value.
 */
export const zlogERROR: ZLogLevelFn = /*#__PURE__*/ newZLogLevel(ZLogLevel.Error, 'ERROR');

/**
 * Builds a log message with {@link ZLogLevel.Warning WARNING} level.
 *
 * Can be used as a log level value.
 */
export const zlogWARN: ZLogLevelFn = /*#__PURE__*/ newZLogLevel(ZLogLevel.Warning, 'WARN');

/**
 * Builds a log message with {@link ZLogLevel.Info INFO} level.
 *
 * Can be used as a log level value.
 */
export const zlogINFO: ZLogLevelFn = /*#__PURE__*/ newZLogLevel(ZLogLevel.Info, 'INFO');

/**
 * Builds a log message with {@link ZLogLevel.Debug DEBUG} level.
 *
 * Can be used as a log level value.
 */
export const zlogDEBUG: ZLogLevelFn = /*#__PURE__*/ newZLogLevel(ZLogLevel.Debug, 'DEBUG');

/**
 * Builds a log message with {@link ZLogLevel.Trace TRACE} level.
 *
 * Can be used as a log level value.
 */
export const zlogTRACE: ZLogLevelFn = /*#__PURE__*/ newZLogLevel(ZLogLevel.Trace, 'TRACE');
