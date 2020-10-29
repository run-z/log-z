/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { zlogLevelMap } from '../log-level';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import { alreadyEnded, alreadyLogged } from '../log-recorder.impl';

/**
 * @internal
 */
type ConsoleZLogMethod = (this: void, console: Console, message: ZLogMessage) => void;

/**
 * @internal
 */
const consoleZLogMethods: [ConsoleZLogMethod, ...ConsoleZLogMethod[]] = [
  // Below TRACE
  (console, message) => console.debug(message.text, ...consoleZLogArgs(message)),
  // TRACE
  (console, message) => {

    const { details } = message;
    const debugDetails = { ...details };

    delete debugDetails.stackTrace;

    const args = consoleZLogArgs(message, debugDetails);

    if (details.stackTrace) {
      console.trace(message.text, ...args);
    } else {
      console.debug(message.text, ...args);
    }
  },
  // DEBUG
  (console, message) => console.log(message.text, ...consoleZLogArgs(message)),
  // INFO
  (console, message) => console.info(message.text, ...consoleZLogArgs(message)),
  // WARN
  (console, message) => console.warn(message.text, ...consoleZLogArgs(message)),
  // ERROR
  (console, message) => console.error(message.text, ...consoleZLogArgs(message)),
  // FATAL
  (console, message) => console.error(`FATAL! ${message.text}`, ...consoleZLogArgs(message)),
];

/**
 * Creates a log recorder that logs to global console.
 *
 * @param console  Console instance to log messages to. Global `console` by default.
 *
 * @returns New console log recorder.
 */
export function logZToConsole(console = globalConsole()): ZLogRecorder {
  return {

    record(message: ZLogMessage): void {
      zlogLevelMap(message.level, consoleZLogMethods)(console, message);
    },

    whenLogged: alreadyLogged,

    end: alreadyEnded,

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
