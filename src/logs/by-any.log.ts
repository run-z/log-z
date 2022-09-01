import { asis, noop } from '@proc7ts/primitives';
import type { ZLogRecorder } from '../log-recorder';

/**
 * Creates a recorder that logs messages by any of the given recorders.
 *
 * In contrast to the log recorder created by {@link logZByAll}, the {@link ZLogRecorder.whenLogged whenLogged} of
 * recorder created by this one resolves to `true` if any of the underlying recorders logged the message.
 *
 * @param by - Log recorders to log messages by.
 *
 * @returns New multiple log recorder.
 */
export function logZByAny(...by: ZLogRecorder[]): ZLogRecorder {
  return {
    record(message) {
      by.forEach(recorder => recorder.record(message));
    },
    whenLogged(which) {
      return Promise.all(by.map(recorder => recorder.whenLogged(which))).then(results => results.some(asis));
    },
    end() {
      return Promise.all(by.map(recorder => recorder.end())).then(noop);
    },
  };
}
