import type { ZLoggable } from './loggable';

/**
 * Creates a loggable value {@link zlogExpand expanded} when the message is actually logged.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to any {@link ZLogger.log logger method} to be
 * expanded later by {@link zlogExpand} function.
 *
 * @param toLog - Builds a loggable value representation.
 *
 * @returns Loggable value.
 */
export function zlogDefer(toLog: (this: void) => unknown): ZLoggable {
  return {
    toLog({ on = 'out' }) {
      return on === 'out' ? toLog() : this;
    },
  };
}
