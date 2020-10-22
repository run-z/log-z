/**
 * @packageDocumentation
 * @module @run-z/log-z/node
 */
import type { Writable } from 'stream';
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

}

/**
 * Creates log recorder that writes a log to output stream.
 *
 * Logs messages as is when the stream is in [object mode]. Logs only {@link ZLogMessage.text message text} otherwise.
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
  const recordMessage = logRecorderFor(output);
  const recordError = errors === output ? recordMessage : logRecorderFor(errors);

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
function logRecorderFor(out: Writable): (message: ZLogMessage) => Promise<boolean> {
  if (out.writableEnded) {
    return doNotLogZ;
  }

  let record: (message: ZLogMessage) => Promise<boolean>;

  if (out.writableObjectMode) {
    record = message => {
      out.write(message);
      return Promise.resolve(true);
    };
  } else {
    record = message => {
      out.write(message.text);
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
