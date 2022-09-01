import { logZBy } from '../log-by';
import type { ZLogger } from '../logger';
import type { ZLogMessage } from '../message';

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
