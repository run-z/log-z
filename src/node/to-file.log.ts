import { consoleLogger } from '@proc7ts/logger';
import { noop, valueProvider } from '@proc7ts/primitives';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';
import type { ZLogRecorder } from '../log-recorder';
import { notLogged } from '../log-recorder.impl';
import type { ZLogBuffer } from '../logs';
import { logZToBuffer } from '../logs';
import type { ZLogMessage } from '../message';
import { logZToStream, StreamZLogSpec } from './to-stream.log';

/**
 * A specification of how to log messages {@link logZToFile to file}.
 */
export interface FileZLogSpec extends StreamZLogSpec {

  /**
   * A buffer of log messages to use prior to writing to the file.
   *
   * The log file and directories creation is asynchronous. So, the buffer is used while the log file is not created
   * yet. It is also used if the i/o operations are not fast enough to write everything logged.
   */
  readonly buffer?: ZLogBuffer;

}

/**
 * Creates a log recorder that writes messages to a file.
 *
 * @param to - The log file to write messages to. Either a string containing a file path, or a function accepting log
 * message and returning a file path.
 * @param how - A specification of how to log messages to file.
 *
 * @returns New log recorder.
 */
export function logZToFile(
    to: string | ((this: void, message: ZLogMessage) => string),
    how: FileZLogSpec = {},
): ZLogRecorder {

  const { buffer = logZToBuffer() } = how;
  const toFile = typeof to === 'string' ? valueProvider(to) : to;

  let expectedLogFile: string | undefined;
  let currentLog: FileZLog | undefined;
  let whenLog: Promise<FileZLog | void> | FileZLog | undefined;
  const setLog = (newLog: FileZLog): FileZLog | void => {

    const [file, recorder] = newLog;

    if (file !== expectedLogFile) {
      // Recorder opened for wrong log file.
      recorder.end().catch(noop);
      return;
    }

    currentLog = whenLog = newLog;
    buffer.drainTo(newLog[1]);

    return newLog;
  };

  let record = (message: ZLogMessage): void => {

    const newFile = toFile(message);

    if (newFile !== expectedLogFile) {
      // Log file changed.
      expectedLogFile = newFile;
      // Stop draining until new file opens.
      buffer.drainTo(null);

      whenLog = Promise.all([openFileZLogRecorder(newFile, how), closeFileZLog(currentLog)])
          .then(([newRecorder]) => setLog([newFile, newRecorder]))
          .catch(
              /* istanbul ignore next */
              error => consoleLogger.error('Failed to open log file (', newFile, '):', error),
          );
    }

    buffer.record(message);
  };
  let whenLogged = async (which?: 'all' | 'last'): Promise<boolean> => {
    if (which === 'all') {

      const log = await whenLog;

      if (log) {

        const [, recorder] = log;
        const whenBufferLogged = buffer.whenLogged(which);

        return whenBufferLogged.then(() => recorder.whenLogged(which)).then(() => whenBufferLogged);
      }
    }

    return buffer.whenLogged(which);
  };
  let end = (): Promise<void> => {
    record = noop;
    whenLogged = notLogged;
    expectedLogFile = undefined;

    const whenEnded = whenLog
        ? Promise.all([
          Promise.resolve(whenLog).then(log => log && log[1].end()),
          buffer.end(),
        ]).then(noop)
        : buffer.end();

    whenLog = currentLog = undefined;

    end = valueProvider(whenEnded);

    return whenEnded;
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

/**
 * @internal
 */
type FileZLog = readonly [file: string, recorder: ZLogRecorder];

/**
 * @internal
 */
async function openFileZLogRecorder(to: string, how: FileZLogSpec): Promise<ZLogRecorder> {

  const dirname = path.dirname(to);

  await fsPromises.mkdir(dirname, { recursive: true });

  const out = fs.createWriteStream(to, { flags: 'a' });

  return logZToStream(out, how);
}

/**
 * @internal
 */
function closeFileZLog(log: FileZLog | undefined): Promise<unknown> {
  if (!log) {
    return Promise.resolve();
  }

  const [file, recorder] = log;
  const end = (): Promise<void> => recorder.end();

  return recorder.whenLogged('all')
      .then(end, end)
      .catch(
          /* istanbul ignore next */
          error => consoleLogger.error('Error closing log file (', file, '):', error),
      );
}
