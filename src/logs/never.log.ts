import { logZBy } from '../log-by.js';
import { ZLogger } from '../logger.js';
import { ZLogMessage } from '../messages/log-message.js';

/**
 * A logger that never logs any messages.
 *
 * All recorded messages are discarded.
 */
export const neverLogZ: ZLogger = /*#__PURE__*/ logZBy({
  record(_message: ZLogMessage): void {
    /* Never log */
  },

  whenLogged(): Promise<boolean> {
    return Promise.resolve(false);
  },

  end(): Promise<void> {
    return Promise.resolve();
  },
});
