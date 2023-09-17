import { ZLogRecorder } from '../log-recorder.js';
import { ZLogDetails } from '../messages/log-details.js';
import { logZUpdated } from './updated.log.js';

/**
 * Creates a log message recorder that updates message details.
 *
 * Updates log message details and records them by another recorder. Do not override detail properties already present
 * in message.
 *
 * @param details - Log message details to apply to recorded messages.
 * @param by - The log recorder to log updated messages by.
 *
 * @returns Updating log recorder.
 */
export function logZWithDetails(details: ZLogDetails, by: ZLogRecorder): ZLogRecorder {
  return logZUpdated(
    message => ({
      ...message,
      details: {
        ...details,
        ...message.details,
      },
    }),
    by,
  );
}
