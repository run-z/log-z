import { noop } from '@proc7ts/primitives';
import { zlogLevelMap } from '../level';
import type { ZLogRecorder } from '../log-recorder';
import { alreadyEnded, alreadyLogged, notLogged } from '../log-recorder.impl';
import type { ZLogMessage } from '../message';
import { zlogExpand } from '../message';

type ConsoleZLogMethod = (this: void, console: Console, message: ZLogMessage) => void;

const consoleZLogMethods: [ConsoleZLogMethod, ...ConsoleZLogMethod[]] = [
  // Below TRACE
  (console, message) => console.debug(...consoleZLogArgs(message)),
  // TRACE
  (console, message) => {

    const { details } = message;
    const debugDetails = { ...details };

    delete debugDetails.stackTrace;

    const args = consoleZLogArgs(message, '', debugDetails);

    if (details.stackTrace) {
      console.trace(...args);
    } else {
      console.debug(...args);
    }
  },
  // DEBUG
  (console, message) => console.log(...consoleZLogArgs(message)),
  // INFO
  (console, message) => console.info(...consoleZLogArgs(message)),
  // WARN
  (console, message) => console.warn(...consoleZLogArgs(message)),
  // ERROR
  (console, message) => console.error(...consoleZLogArgs(message)),
  // FATAL
  (console, message) => console.error(...consoleZLogArgs(message, 'FATAL!')),
];

/**
 * Creates a log recorder that logs to global console.
 *
 * @param console - Console instance to log messages to. Global `console` by default.
 *
 * @returns New console log recorder.
 */
export function logZToConsole(console = globalConsole()): ZLogRecorder {

  let record = (message: ZLogMessage): void => zlogLevelMap(message.level, consoleZLogMethods)(
      console,
      zlogExpand(message),
  );
  let whenLogged = alreadyLogged;
  let end = (): Promise<void> => {
    record = noop;
    whenLogged = notLogged;
    end = alreadyEnded;
    return alreadyEnded();
  };

  return {

    record(message: ZLogMessage): void {
      record(message);
    },

    whenLogged() {
      return whenLogged();
    },

    end() {
      return end();
    },

  };
}

function globalConsole(): typeof console {
  return console;
}

function consoleZLogArgs(
    message: ZLogMessage,
    prefix = '',
    details = message.details,
): unknown[] {

  const { text, error } = message;
  const args: unknown[] = [];

  if (prefix) {
    if (text) {
      args.push(`${prefix} ${text}`);
    } else {
      args.push(prefix);
    }
  } else if (text) {
    args.push(text);
  }

  args.push(...message.extra);

  if (Reflect.ownKeys(details).length) {
    args.push(details);
  }
  if (error) {
    args.push(error);
  }

  if (args.length && typeof args[0] === 'string') {
    // Prevent message formatting.
    args.unshift('%s');
  }

  return args;
}
