import { logZBy } from '../log-by';
import { ZLogLevel } from '../log-level';
import { zlogDetails, zlogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogger } from '../logger';
import { logZWithDetails } from './with-details.log';

describe('logZWithDetails', () => {

  let target: jest.Mocked<ZLogRecorder>;

  beforeEach(() => {
    target = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };
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
