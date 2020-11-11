/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { ZLogMessageData__symbol } from './log-message-data.impl';

/**
 * Log message details map.
 *
 * The keys of this map are specific to application or log recorder implementation.
 */
export type ZLogDetails = { readonly [key in string | symbol]?: any };

/**
 * Builds a special value {@link zlogMessage treated} as additional {@link ZLogMessage.details message details}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to add
 * details to logged message.
 *
 * @param details  Log message details to add.
 *
 * @returns A special value.
 */
export function zlogDetails(details: ZLogDetails): unknown {
  return {
    [ZLogMessageData__symbol]: 'details',
    details,
  };
}
