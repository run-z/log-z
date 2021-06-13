import type { DueLogZ } from './due-log';

/**
 * Creates a {@link ZLoggable loggable} value {@link zlogMessage treated} as {@link ZLogMessage.error logged error}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to any {@link ZLogger.log logger method} to set
 * an error of the logged message.
 *
 * @param error - Error to report.
 *
 * @returns Loggable value.
 */
export function zlogError(error: unknown): unknown {
  return {
    toLog(target: DueLogZ) {

      const { zMessage } = target;

      if (zMessage && !zMessage.error) {
        if (error instanceof Error) {
          target.zMessage = { ...zMessage, text: zMessage.text || error.message, error };
        } else {
          target.zMessage = { ...zMessage, error };
        }

        return [];
      }

      return error;
    },
  };
}
