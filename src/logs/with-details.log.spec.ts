import { beforeEach, describe, expect, it } from '@jest/globals';
import { logZBy } from '../log-by';
import { zlogDetails } from '../log-details';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogger } from '../logger';
import type { MockZLogRecorder } from '../spec';
import { logZToMock } from '../spec';
import { logZWithDetails } from './with-details.log';

describe('logZWithDetails', () => {

  let target: MockZLogRecorder;

  beforeEach(() => {
    target = logZToMock();
  });

  let logger: ZLogger;

  beforeEach(() => {
    logger = logZBy(logZWithDetails({ updated: 1 }, target));
  });

  it('sets message details', () => {
    logger.error('Message');
    expect(target.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ updated: 1 })));
  });
  it('respects existing message details', () => {
    logger.error('Message', zlogDetails({ original: 1 }));
    expect(target.record).toHaveBeenCalledWith(zlogMessage(
        ZLogLevel.Error,
        'Message',
        zlogDetails({ original: 1, updated: 1 }),
    ));
  });
  it('does not override message details', () => {
    logger = logZBy(logZWithDetails({ updated: 2 }, logger));
    logger.error('Message');
    expect(target.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ updated: 2 })));
  });

});
