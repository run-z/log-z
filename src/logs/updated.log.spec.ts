import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { ZLogLevel } from '../level';
import { logZBy } from '../log-by';
import type { ZLogger } from '../logger';
import type { ZLogMessage } from '../message';
import { zlogDetails, zlogMessage } from '../message';
import type { MockZLogRecorder } from '../spec';
import { logZToMock } from '../spec';
import { logZUpdated } from './updated.log';

describe('logZUpdated', () => {

  let target: MockZLogRecorder;

  beforeEach(() => {
    target = logZToMock();
  });

  let update: Mock<(message: ZLogMessage) => ZLogMessage>;
  let logger: ZLogger;

  beforeEach(() => {
    update = jest.fn(message => message);
    logger = logZBy(logZUpdated(update, target));
  });

  it('records updated message', () => {
    update.mockImplementation(message => ({ ...message, details: { ...message.details, update: true } }));

    logger.error('Message');
    expect(target.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ update: true })));
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
