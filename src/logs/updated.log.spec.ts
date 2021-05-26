import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import { logZBy } from '../log-by';
import { zlogDetails } from '../log-details';
import { ZLogLevel } from '../log-level';
import type { ZLogMessage } from '../log-message';
import { zlogMessage } from '../log-message';
import type { ZLogger } from '../logger';
import type { MockZLogRecorder } from '../spec';
import { logZToMock } from '../spec';
import { logZUpdated } from './updated.log';

describe('logZUpdated', () => {

  let target: MockZLogRecorder;

  beforeEach(() => {
    target = logZToMock();
  });

  let update: Mock<ZLogMessage, [ZLogMessage]>;
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
