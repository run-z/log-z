/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import { ZLogger } from '../logger';

/**
 * Recording message logger.
 *
 * Records log messages with log recorder.
 */
export class RecordingZLogger extends ZLogger {

  /**
   * Constructs recording message logger.
   *
   * @param recorder  The log recorder to record messages with.
   */
  constructor(readonly recorder: ZLogRecorder) {
    super();
  }

  record(message: ZLogMessage): void {
    this.recorder.record(message);
  }

  whenLogged(): Promise<boolean> {
    return this.recorder.whenLogged();
  }

  end(): Promise<void> {
    return this.recorder.end();
  }

}
