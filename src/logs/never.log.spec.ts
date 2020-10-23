import type { ZLogger } from '../logger';
import { neverLogZ } from './never.log';

describe('neverLogZ', () => {

  let logger: ZLogger;

  beforeEach(() => {
    logger = neverLogZ;
  });

  it('discards messages', async () => {
    logger.info('TEST');
    expect(await logger.whenLogged()).toBe(false);
  });
  it('is stopped', async () => {
    expect(await logger.end()).toBeUndefined();
    expect(await logger.end()).toBeUndefined();
  });
});
