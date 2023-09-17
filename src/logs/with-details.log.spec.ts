import { beforeEach, describe, expect, it } from '@jest/globals';
import { MockZLogRecorder, logZToMock } from '../spec/mock-log-recorder.js';
import { ZLogger } from '../logger.js';
import { logZBy } from '../log-by.js';
import { logZWithDetails } from './with-details.log.js';
import { ZLogLevel } from '../levels/log-level.js';
import { zlogMessage } from '../messages/log-message.js';
import { zlogDetails } from '../messages/log-details.js';

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
