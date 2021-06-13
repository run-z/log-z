import { ZLogger } from '../logger';
import type { ZLogMessage } from '../message';

/**
 * @internal
 */
class DiscardingZLogger extends ZLogger {

  record(_message: ZLogMessage): void {
    /* Never log */
  }

  whenLogged(): Promise<boolean> {
    return Promise.resolve(false);
  }

  end(): Promise<void> {
    return Promise.resolve();
  }

}

/**
 * A logger that never logs any messages.
 *
 * All recorded messages are discarded.
 */
export const neverLogZ: ZLogger = (/*#__PURE__*/ new DiscardingZLogger());
