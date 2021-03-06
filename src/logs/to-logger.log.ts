import type { Logger } from '@proc7ts/logger';
import { consoleLogger } from '@proc7ts/logger';
import { noop } from '@proc7ts/primitives';
import { zlogLevelMap } from '../level';
import type { ZLogRecorder } from '../log-recorder';
import { alreadyEnded, alreadyLogged, notLogged } from '../log-recorder.impl';
import type { ZLogMessage } from '../message';
import { zlogDetails, zlogExpand } from '../message';

type LogZToLogger$Method = (this: void, logger: Logger, message: ZLogMessage) => void;

const LogZToLogger$methods: [LogZToLogger$Method, ...LogZToLogger$Method[]] = [
  // Below TRACE
  (logger, message) => logger.trace(...LogZToLogger$args(message)),
  // TRACE
  (logger, message) => logger.trace(...LogZToLogger$args(message)),
  // DEBUG
  (logger, message) => logger.debug(...LogZToLogger$args(message)),
  // INFO
  (logger, message) => logger.info(...LogZToLogger$args(message)),
  // WARN
  (logger, message) => logger.warn(...LogZToLogger$args(message)),
  // ERROR
  (logger, message) => logger.error(...LogZToLogger$args(message)),
  // FATAL
  (logger, message) => logger.error(...LogZToLogger$args(message, 'FATAL!')),
];

/**
 * Creates a log recorder that logs to another {@link Logger}.
 *
 * @param logger - Logger instance to log messages to. {@link consoleLogger} by default.
 *
 * @returns New log recorder.
 */
export function logZToLogger(logger: Logger = consoleLogger): ZLogRecorder {

  let record = (message: ZLogMessage): void => zlogLevelMap(message.level, LogZToLogger$methods)(
      logger,
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

function LogZToLogger$args(
    message: ZLogMessage,
    prefix = '',
    details = message.details,
): unknown[] {

  const args: unknown[] = prefix
      ? [prefix, ...message.line]
      : message.line.slice();

  if (Reflect.ownKeys(details).length) {
    args.push(zlogDetails(details));
  }

  return args;
}
