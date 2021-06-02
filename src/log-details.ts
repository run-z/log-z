import { ZLogMessageData__symbol } from './log-message-data.impl';
import { zlogDefer } from './loggable';

/**
 * Log message details map.
 *
 * The keys of this map are specific to application or log recorder implementation.
 */
export type ZLogDetails = { readonly [key in string | symbol]?: unknown };

/**
 * Builds a special value {@link zlogMessage treated} as additional {@link ZLogMessage.details message details}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to add
 * details to logged message.
 *
 * @param details - Either log message details to add, or a function constructing ones. The function will be called to
 * {@link zlogExpand expand} the log message details. It may return `null`/`undefined` to expand to nothing.
 *
 * @returns A special value.
 */
export function zlogDetails(details: ZLogDetails | ((this: void) => ZLogDetails | null | undefined)): unknown {
  if (typeof details === 'function') {
    return zlogDefer(() => {

      const expanded = details();

      return expanded != null
          ? {
            [ZLogMessageData__symbol]: 'details',
            details: expanded,
          }
          : expanded;
    });
  }

  return {
    [ZLogMessageData__symbol]: 'details',
    details,
  };
}
