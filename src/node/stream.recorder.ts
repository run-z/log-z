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
 * @param output  Writable stream to log to.
 * @param config  Streaming log recorder configuration.
 *
 * @returns New log recorder.
 *
 * [object mode]: https://nodejs.org/dist/latest/docs/api/stream.html#stream_object_mode
 */
export function streamZLogRecorder(output: Writable, config: StreamZLogConfig = {}): ZLogRecorder {

  const { errors = output, errorLevel = ZLogLevel.Error } = config;
  const writeOut = logWriterFor(output);
  const writeError = errors === output ? writeOut : logWriterFor(errors);

  let whenRecorded = Promise.resolve<boolean>(true);
  let record = (message: ZLogMessage): void => {

    const write = message.level < errorLevel ? writeOut : writeError;

    whenRecorded = whenRecorded.then(ok => ok && record !== doNotLogZ ? write(message) : Promise.resolve(false));
  };

  return {

    record(message) {
      record(message);
    },

    whenLogged(): Promise<boolean> {
      return whenRecorded;
    },

    discard(): Promise<void> {
      record = doNotLogZ;
      whenRecorded = Promise.resolve(false);

      return new Promise((resolve, reject) => {
        output.once('close', resolve);
        output.once('finish', resolve);
        output.once('error', reject);
        output.destroy();
        output.end();
      });
    },

  };
}

/**
 * @internal
 */
function doNotLogZ(_message: ZLogMessage): void {
  // Do not log message
}

/**
 * @internal
 */
function logWriterFor(out: Writable): (message: ZLogMessage) => Promise<boolean> {

  const write = writerFor(out);

  if (out.writableObjectMode) {
    return write;
  }

  return message => write(message.text);
}

/**
 * @internal
 */
function writerFor(out: Writable): (data: any) => Promise<true> {

  let ready: Promise<true> = Promise.resolve(true);

  return data => ready.then(
      () => new Promise<true>((resolve, reject) => {

        const ok = out.write(
            data,
            err => {
              if (err != null) {
                reject(err);
              } else {
                resolve(true);
              }
            },
        );

        if (!ok) {
          ready = new Promise<true>(makeReady => {
            out.once(
                'drain',
                () => {
                  ready = Promise.resolve(true);
                  makeReady();
                },
            );
          });
        }

        resolve(true);
      }),
  );
}
