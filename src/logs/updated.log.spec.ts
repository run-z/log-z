import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ZLogLevel } from '../levels/log-level.js';
import { logZBy } from '../log-by.js';
import { ZLogger } from '../logger.js';
import { zlogDetails } from '../messages/log-details.js';
import { ZLogMessage, zlogMessage } from '../messages/log-message.js';
import { MockZLogRecorder, logZToMock } from '../spec/mock-log-recorder.js';
import { logZUpdated } from './updated.log.js';

describe('logZUpdated', () => {
  let target: MockZLogRecorder;

  beforeEach(() => {
    target = logZToMock();
  });

  let update: jest.Mock<(message: ZLogMessage) => ZLogMessage>;
  let logger: ZLogger;

  beforeEach(() => {
    update = jest.fn(message => message);
    logger = logZBy(logZUpdated(update, target));
  });

  it('records updated message', () => {
    update.mockImplementation(message => ({
      ...message,
      details: { ...message.details, update: true },
    }));

    logger.error('Message');
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ update: true })),
    );
  });

  describe('whenLogged', () => {
    it('calls target', async () => {
      const whenLogged = logger.whenLogged();

      expect(await whenLogged).toBe(true);
      expect(target.whenLogged).toHaveLastReturnedWith(whenLogged);
    });
  });

  describe('end', () => {
    it('calls target', async () => {
      const whenStopped = logger.end();

      expect(await whenStopped).toBeUndefined();
      expect(target.end).toHaveLastReturnedWith(whenStopped);
    });
  });
});
