import { asis, noop } from '@proc7ts/primitives';
import type { ZLogRecorder } from '../log-recorder';

/**
 * Creates a recorder that logs messages by all of the given recorders.
 *
 * @param by  Log recorders to log messages by.
 *
 * @returns New multiple log recorder.
 */
export function logZByAll(...by: ZLogRecorder[]): ZLogRecorder {
  return {
    record(message) {
      by.forEach(recorder => recorder.record(message));
    },
    whenLogged(which) {
      return Promise.all(by.map(recorder => recorder.whenLogged(which)))
          .then(results => results.every(asis));
    },
    end() {
      return Promise.all(by.map(recorder => recorder.end())).then(noop);
    },
  };
}
