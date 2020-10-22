/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { ZLogLevel } from '../log-level';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';

/**
 * Creates console log recorder.
 *
 * @param console  Console instance to log messages to. Global `console` by default.
 *
 * @returns New console log recorder.
 */
export function consoleZLogRecorder(console = globalConsole()): ZLogRecorder {
  return {

    record(message: ZLogMessage): void {

      const { level, text } = message;

      if (level >= ZLogLevel.Fatal) {
        console.error('FATAL! ' + text, ...consoleZLogArgs(message));
      } else if (level >= ZLogLevel.Error) {
        console.error(text, ...consoleZLogArgs(message));
      } else if (level >= ZLogLevel.Warning) {
        console.warn(text, ...consoleZLogArgs(message));
      } else if (level >= ZLogLevel.Info) {
        console.info(text, ...consoleZLogArgs(message));
      } else if (level >= ZLogLevel.Debug) {
        console.log(text, ...consoleZLogArgs(message));
      } else if (level >= ZLogLevel.Trace) {

        const { details } = message;
        const debugDetails = { ...details };

        delete debugDetails.stackTrace;

        const args = consoleZLogArgs(message, debugDetails);

        if (details.stackTrace) {
          console.trace(text, ...args);
        } else {
          console.debug(text, ...args);
        }
      } else {
        console.debug(text, ...consoleZLogArgs(message));
      }
    },

    whenLogged(): Promise<boolean> {
      return Promise.resolve(true);
    },

    end(): Promise<void> {
      return Promise.resolve();
    },

  };
}

/**
 * @internal
 */
function globalConsole(): typeof console {
  return console;
}

/**
 * @internal
 */
function consoleZLogArgs(message: ZLogMessage, details = message.details): string[] {

  const args: any[] = [...message.extra];

  if (Object.getOwnPropertyNames(details).length || Object.getOwnPropertySymbols(details).length) {
    args.push(details);
  }
  if (message.error) {
    args.push(message.error);
  }

  return args;
}
