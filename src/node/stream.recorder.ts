/**
 * @packageDocumentation
 * @module @run-z/log-z/node
 */
import type { Writable } from 'stream';
import type { ZLogFormat, ZLogFormatter } from '../formats';
import { zlogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';

/**
 * {@link streamZLogRecorder Streaming log recorder} configuration.
 */
export interface StreamZLogConfig {

  /**
   * Writable stream to log errors to.
   *
   * @default The same as `output` stream.
   */
  readonly errors?: Writable;

  /**
   * The log level considered an error one.
   *
   * @default {@link ZLogLevel.Error Error}.
   */
  readonly errorLevel?: ZLogLevel;

  /**
   * Message format or formatter to use for message recording.
   *
   * Ignored for streams in [object mode].
   *
   * [object mode]: https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode
   *
   * @default {@link defaultZLogFormat Default log format}.
   */
  readonly format?: ZLogFormat | ZLogFormatter;

}

/**
 * Creates log recorder that writes a log to output stream.
 *
 * Logs messages as is when the stream is in [object mode], or {@link StreamZLogConfig.format formats them} otherwise.
 *
 * Can log {@link StreamZLogConfig.errorLevel errors} to {@link StreamZLogConfig.errors separate stream}.
 *
 * Ends underlying stream(s) on {@link ZLogRecorder.end .end()} method call.
 *
 * @param output  Writable stream to log to.
 * @param config  Streaming log recorder configuration.
 *
 * @returns New log recorder.
 *
 * [object mode]: https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode
 */
export function streamZLogRecorder(output: Writable, config: StreamZLogConfig = {}): ZLogRecorder {

  const { errors = output, errorLevel = ZLogLevel.Error } = config;
  const recordMessage = logRecorderFor(output, config);
  const recordError = errors === output ? recordMessage : logRecorderFor(errors, config);

  let whenLogged = Promise.resolve<boolean>(true);
  let record = (message: ZLogMessage): Promise<boolean> => (message.level < errorLevel
      ? recordMessage
      : recordError)(message);
  let end = (): Promise<void> => {
    record = doNotLogZ;
    whenLogged = Promise.resolve(false);

    const whenOutputEnded = endLogging(output);
    const whenAllEnded = (output === errors
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
      return whenLogged;
    },

    end(): Promise<void> {
      return end();
    },

  };
}

/**
 * @internal
 */
function doNotLogZ(_message: ZLogMessage): Promise<false> {
  return Promise.resolve(false);
}

/**
 * @internal
 */
function logRecorderFor(
    out: Writable,
    { format }: StreamZLogConfig,
): (message: ZLogMessage) => Promise<boolean> {
  if (out.writableEnded) {
    return doNotLogZ;
  }

  const formatter = typeof format === 'function'
      ? format
      : zlogFormatter(format);

  let record: (message: ZLogMessage) => Promise<boolean>;

  if (out.writableObjectMode) {
    record = message => {
      out.write(message);
      return Promise.resolve(true);
    };
  } else {
    record = message => {
      out.write(formatter(message));
      return Promise.resolve(true);
    };
  }

  whenLoggingStopped(out).finally(() => record = doNotLogZ);

  return message => record(message);
}

/**
 * @internal
 */
function whenLoggingStopped(out: Writable): Promise<void> {
  return new Promise((resolve, reject) => {
    if (out.writableFinished) {
      resolve();
    } else {
      out.once('close', resolve);
      out.once('finish', resolve);
      out.once('error', reject);
    }
  });
}

/**
 * @internal
 */
function endLogging(out: Writable): Promise<unknown> {

  const whenEnded = new Promise(resolve => out.end(resolve));
  const whenStopped = whenLoggingStopped(out);

  return Promise.race([whenEnded, whenStopped]);
}
