import { beforeEach, describe, expect, it } from '@jest/globals';
import { ZLogLevel } from '../level';
import { logZBy } from '../log-by';
import type { ZLogger } from '../logger';
import { zlogDetails, zlogMessage } from '../message';
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
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ updated: 1 })),
    );
  });
  it('respects existing message details', () => {
    logger.error('Message', zlogDetails({ original: 1 }));
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ original: 1, updated: 1 })),
    );
  });
  it('does not override message details', () => {
    logger = logZBy(logZWithDetails({ updated: 2 }, logger));
    logger.error('Message');
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ updated: 2 })),
    );
  });
});
