/**
 * @packageDocumentation
 * @module @run-z/log-z/node
 */
import * as os from 'os';
import type { Writable } from 'stream';
import type { TextZLogFormat, ZLogFormatter } from '../formats';
import { textZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { WhenWritten } from './stream-writer.impl';
import { alreadyWritten, notWritten, streamWriter } from './stream-writer.impl';

/**
 * A specification of how to log messages {@link logZToStream to Node.js stream}.
 */
export interface StreamZLogSpec {

  /**
   * A specification of how to log errors.
   *
   * Either a writable stream, or a {@link StreamZLogSpec.Errors more detailed} specification.
   *
   * @default The same as `output` stream.
   */
  readonly errors?: Writable | StreamZLogSpec.Errors;

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

export namespace StreamZLogSpec {

  /**
   * The detailed specification of how to log error messages.
   */
  export interface Errors {

    /**
     * The minimum log level of error messages.
     *
     * @default {@link ZLogLevel.Error Error}.
     */
    readonly atLeast?: ZLogLevel;

    /**
     * Writable stream to log errors to.
     *
     * @default The same as `output` stream.
     */
    readonly to: Writable;

    /**
     * Message format or formatter to use for text logging of error messages.
     *
     * Ignored for streams in [object mode].
     *
     * [object mode]: https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode
     *
     * @default The same as {@link StreamZLogSpec.format output log format}.
     */
    readonly format?: TextZLogFormat | ZLogFormatter;

  }

}

/**
 * Creates a recorder that writes messages to output stream.
 *
 * Logs messages as is when the stream is in [object mode], or {@link StreamZLogSpec.format formats them} otherwise.
 *
 * Can log {@link StreamZLogSpec.errors errors} to separate stream.
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
  const errorsSpec = streamZLogErrorsSpec(to, spec);
  const { to: errors, atLeast: errorLevel = ZLogLevel.Error } = errorsSpec;
  const recordMessage = logRecorderFor(to, eol, spec);
  const recordError = errors === to ? recordMessage : logRecorderFor(errors, eol, errorsSpec);

  let whenLogged: WhenWritten = alreadyWritten;
  let record = (message: ZLogMessage): WhenWritten => (message.level < errorLevel
      ? recordMessage
      : recordError)(message);
  let end = (): Promise<void> => {
    record = doNotLogZ;
    whenLogged = notWritten;

    const whenOutputEnded = endLogging(to);
    const whenAllEnded = (to === errors
        ? whenOutputEnded
        : Promise.all([whenOutputEnded, endLogging(errors)]))
        .then(() => void 0);

    end = () => whenAllEnded;

    return whenAllEnded;
  };

  return {

    record(message) {
      whenLogged = record(message);
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
function streamZLogErrorsSpec(to: Writable, spec: StreamZLogSpec): StreamZLogSpec.Errors {

  const { errors, format } = spec;

  if (!errors) {
    return { to };
  }
  if (isWritable(errors)) {
    return { to: errors, format };
  }

  return { format, ...errors };
}

/**
 * @internal
 */
function isWritable(spec: StreamZLogSpec.Errors | Writable): spec is Writable {
  return !!(spec as Writable).writable;
}

/**
 * @internal
 */
function doNotLogZ(_message: ZLogMessage): WhenWritten {
  return notWritten;
}

/**
 * @internal
 */
function logRecorderFor(
    to: Writable,
    eol: string,
    { format }: StreamZLogSpec | StreamZLogSpec.Errors,
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

      return line == null ? notWritten : write(line + eol);
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
function endLogging(to: Writable): Promise<unknown> {

  const whenEnded = new Promise(resolve => to.end(resolve));
  const whenStopped = whenLoggingStopped(to);

  return Promise.race([whenEnded, whenStopped]);
}
