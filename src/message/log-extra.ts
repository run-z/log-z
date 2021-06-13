import type { DueLogZ } from './due-log';
import type { ZLoggable } from './loggable';

/**
 * Creates a {@link ZLoggable loggable} value {@link zlogMessage treated} as a list of {@link ZLogMessage.extra
 * uninterpreted log message parameters}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to any {@link ZLogger.log logger method} to add
 * parameters to logged message.
 *
 * @param extra - Log message parameters.
 *
 * @returns Loggable value.
 */
export function zlogExtra(...extra: unknown[]): ZLoggable {
  return {
    toLog(target: DueLogZ) {
      target.line.splice(target.index, 1, ...extra);
      target.index += extra.length;
    },
  };
}
