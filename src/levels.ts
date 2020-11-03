/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { ZLogLevel } from './log-level';
import type { ZLogMessage } from './log-message';
import { zlogMessage } from './log-message';

/**
 * @internal
 */
function newZLogLevel(level: ZLogLevel, name: string): ((this: void, ...args: any[]) => ZLogMessage) & ZLogLevel {

  const makeMessage = ((...args: any[]) => zlogMessage(level, ...args)) as (
      & ((this: void, ...args: any[]) => ZLogMessage)
      & ZLogLevel
  );

  makeMessage.valueOf = () => level;
  makeMessage.toString = () => name;

  return makeMessage;
}

/**
 * Builds a log message with {@link ZLogLevel.Fatal FATAL} level.
 *
 * Can be used as a log level value.
 */
export const zlogFATAL = (/*#__PURE__*/ newZLogLevel(ZLogLevel.Fatal, 'FATAL'));

/**
 * Builds a log message with {@link ZLogLevel.Error ERROR} level.
 *
 * Can be used as a log level value.
 */
export const zlogERROR = (/*#__PURE__*/ newZLogLevel(ZLogLevel.Error, 'ERROR'));

/**
 * Builds a log message with {@link ZLogLevel.Warning WARNING} level.
 *
 * Can be used as a log level value.
 */
export const zlogWARN = (/*#__PURE__*/ newZLogLevel(ZLogLevel.Warning, 'WARN'));

/**
 * Builds a log message with {@link ZLogLevel.Info INFO} level.
 *
 * Can be used as a log level value.
 */
export const zlogINFO = (/*#__PURE__*/ newZLogLevel(ZLogLevel.Info, 'INFO'));

/**
 * Builds a log message with {@link ZLogLevel.Debug DEBUG} level.
 *
 * Can be used as a log level value.
 */
export const zlogDEBUG = (/*#__PURE__*/ newZLogLevel(ZLogLevel.Debug, 'DEBUG'));

/**
 * Builds a log message with {@link ZLogLevel.Trace TRACE} level.
 *
 * Can be used as a log level value.
 */
export const zlogTRACE = (/*#__PURE__*/ newZLogLevel(ZLogLevel.Trace, 'TRACE'));
