/**
 * @packageDocumentation
 * @module @run-z/log-z/node
 */
import { noop, valueProvider } from '@proc7ts/primitives';
import * as os from 'os';
import type { Writable } from 'stream';
import type { TextZLogFormat, ZLogFormatter } from '../formats';
import { textZLogFormatter } from '../formats';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import { alreadyLogged, notLogged } from '../log-recorder.impl';
import type { WhenWritten } from './stream-writer.impl';
import { streamWriter } from './stream-writer.impl';

/**
 * A specification of how to log messages {@link logZToStream to Node.js stream}.
 */
export interface StreamZLogSpec {

  /**
   * Message format or formatter to use for text message logging.
   *
   * Ignored for streams in [object mode].
   *
   * [object mode]: https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode
   *
   * @default {@link textZLogFormatter Text log format}.
   */
  readonly format?: TextZLogFormat | ZLogFormatter;

  /**
   * The end of line symbol to separate log lines with.
   *
   * @default `os.EOL` - an OS-specific new line separator.
   */
  readonly eol?: string;

}

/**
 * Creates a log recorder that writes messages to output stream.
 *
 * Logs messages as is when the stream is in [object mode], or {@link StreamZLogSpec.format formats them} otherwise.
 *
 * Reports logging complete immediately if `to.write()` returned `true`. Awaits for stream to [drain] otherwise.
 *
 * Ends underlying stream(s) on {@link ZLogRecorder.end .end()} method call.
 *
 * @param to  Writable stream to log messages to.
 * @param spec  A specification of how to log messages to Node.js stream.
 *
 * @returns New log recorder.
 *
 * [object mode]: https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode
 * [drain]: https://nodejs.org/dist/latest/docs/api/stream.html#stream_event_drain
 */
export function logZToStream(to: Writable, spec: StreamZLogSpec = {}): ZLogRecorder {

  const { eol = os.EOL } = spec;
  const recordMessage = logRecorderFor(to, eol, spec);

  let whenLogged: WhenWritten = alreadyLogged;
  let record = (message: ZLogMessage): void => {
    whenLogged = recordMessage(message);
  };
  let end = (): Promise<void> => {
    record = doNotLogZ;
    whenLogged = notLogged;

    const whenEnded = endLogging(to);

    end = valueProvider(whenEnded);

    return whenEnded;
  };

  return {

    record(message) {
      record(message);
    },

    whenLogged(): Promise<boolean> {
      return whenLogged();
    },

    end(): Promise<void> {
      return end();
    },

  };
}

/**
 * @internal
 */
function doNotLogZ(_message: ZLogMessage): WhenWritten {
  return notLogged;
}

/**
 * @internal
 */
function logRecorderFor(
    to: Writable,
    eol: string,
    { format }: StreamZLogSpec,
): (message: ZLogMessage) => WhenWritten {
  if (to.writableEnded) {
    return doNotLogZ;
  }

  const formatter = typeof format === 'function'
      ? format
      : textZLogFormatter(format);

  let record: (message: ZLogMessage) => WhenWritten;
  const write = streamWriter(to);

  if (to.writableObjectMode) {
    record = write;
  } else {
    record = message => {

      const line = formatter(message);

      return line == null ? notLogged : write(line + eol);
    };
  }

  whenLoggingStopped(to).finally(() => record = doNotLogZ);

  return message => record(message);
}

/**
 * @internal
 */
function whenLoggingStopped(to: Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    if (to.writableFinished) {
      resolve();
    } else {
      to.once('close', resolve);
      to.once('finish', resolve);
      to.once('error', reject);
    }
  });
}

/**
 * @internal
 */
function endLogging(to: Writable): Promise<void> {

  const whenEnded = new Promise(resolve => to.end(resolve));
  const whenStopped = whenLoggingStopped(to);

  return Promise.race([whenEnded, whenStopped]).then(noop);
}
