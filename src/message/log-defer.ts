/**
 * Builds a special value {@link zlogMessage treated} as {@link ZLoggable loggable} parameter.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to add
 * it to logged message. It will be {@link zlogExpand expanded} only when the message is actually logged.
 *
 * @param toLog - Builds a loggable value representation.
 */
export function zlogDefer(toLog: (this: void) => any): unknown {
  return {
    toLog({ on = 'out' }) {
      return on === 'out' ? toLog() : this;
    },
  };
}
