import type { DueLogZ } from './due-log';

/**
 * Builds a special value {@link zlogMessage treated} as a list of {@link ZLogMessage.extra uninterpreted log message
 * parameters}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to add
 * parameters of any type to logged message.
 *
 * @param extra - Log message parameters.
 *
 * @returns A special value.
 */
export function zlogExtra(...extra: unknown[]): unknown {
  return {
    toLog(target: DueLogZ) {
      target.line.splice(target.index, 1, ...extra);
      target.index += extra.length;
    },
  };
}
