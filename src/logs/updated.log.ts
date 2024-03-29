import { ZLogRecorder } from '../log-recorder.js';
import { ZLogMessage } from '../messages/log-message.js';

/**
 * Creates updated log message recorder.
 *
 * Updates log messages and records them by another recorder.
 *
 * @param update - Log message update function. Accepts original message and returns updated one.
 * @param by - The log recorder to log updated messages by.
 *
 * @returns Updating log recorder.
 */
export function logZUpdated(
  update: (this: void, message: ZLogMessage) => ZLogMessage,
  by: ZLogRecorder,
): ZLogRecorder {
  return {
    record(message) {
      by.record(update(message));
    },

    whenLogged(which?: 'all' | 'last') {
      return by.whenLogged(which);
    },

    end() {
      return by.end();
    },
  };
}
