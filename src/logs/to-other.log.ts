import type { ZLogRecorder } from '../log-recorder.js';

/**
 * Creates a log recorder that logs messages by proxying them to provided one.
 *
 * The created recorder logs messages to `target`.
 *
 * @param getTarget - A function that returns a log recorder to proxy log messages to. It is called on _each_ log
 * recorder method call.
 *
 * @returns New log recorder.
 */
export function logZToOther(getTarget: (this: void) => ZLogRecorder): ZLogRecorder {
  return {
    record(message) {
      getTarget().record(message);
    },
    whenLogged(which) {
      return getTarget().whenLogged(which);
    },
    end() {
      return getTarget().end();
    },
  };
}
