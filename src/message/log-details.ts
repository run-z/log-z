import type { DueLogZ } from './due-log';
import { zlogDefer } from './log-defer';
import type { ZLoggable } from './loggable';

/**
 * Log message details map.
 *
 * The keys of this map are specific to application or log recorder implementation.
 */
export type ZLogDetails = { readonly [key in string | symbol]?: unknown };

/**
 * Creates a {@link ZLoggable loggable} value {@link zlogMessage treated} as additional {@link ZLogMessage.details
 * message details}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to any {@link ZLogger.log logger method} to add
 * details to logged message.
 *
 * @param details - Either log message details to add, or a function constructing ones. The function will be called to
 * {@link zlogExpand expand} the log message details. It may return `null`/`undefined` to expand to nothing.
 *
 * @returns Loggable value.
 */
export function zlogDetails(details: ZLogDetails | ((this: void) => ZLogDetails | null | undefined)): ZLoggable {
  if (typeof details === 'function') {
    return zlogDefer(() => ({
      toLog(_target: DueLogZ) {

        const expanded = details();

        return expanded ? zlogDetails(expanded) : [];
      },
    }));
  }

  return {
    toLog(target: DueLogZ) {

      const { zMessage } = target;

      if (!zMessage) {
        return details;
      }

      target.zMessage = { ...zMessage, details: { ...zMessage.details, ...details } };

      return [];
    },
  };
}
