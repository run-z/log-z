/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { noop, valueProvider } from '@proc7ts/primitives';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import { notLogged } from '../log-recorder.impl';

/**
 * Creates a log recorder that logs messages atop of the target one.
 *
 * The created recorder logs messages to `target`. When it {@link ZLogRecorder.end ends logging}, the target recorder
 * still can record messages.
 *
 * @param target  The target log recorder to log messages by.
 *
 * @returns New log recorder.
 */
export function logZAtopOf(target: ZLogRecorder): ZLogRecorder {

  let record = (message: ZLogMessage): void => target.record(message);
  let whenLogged = (which?: 'all' | 'last'): Promise<boolean> => target.whenLogged(which);
  let end = (): Promise<void> => {
    record = noop;
    whenLogged = notLogged;

    const ended = Promise.resolve();

    end = valueProvider(ended);

    return ended;
  };

  return {
    record(message) {
      record(message);
    },
    whenLogged(which) {
      return whenLogged(which);
    },
    end() {
      return end();
    },
  };
}
