import type { ZLogger } from '../logger';
import { silentZLogger } from './silent.logger';

describe('silentZLogger', () => {

  let logger: ZLogger;

  beforeEach(() => {
    logger = silentZLogger;
  });

  it('discards messages', async () => {
    logger.info('TEST');
    expect(await logger.whenLogged()).toBe(false);
  });
  it('is always discarded', async () => {
    expect(await logger.discard()).toBeUndefined();
    expect(await logger.discard()).toBeUndefined();
  });
});
