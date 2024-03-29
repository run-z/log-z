import { beforeEach, describe, expect, it } from '@jest/globals';
import { ZLogger } from '../logger.js';
import { MockZLogRecorder, logZToMock } from '../spec/mock-log-recorder.js';
import { logZAtopOf } from './atop-of.log.js';
import { logZBy } from '../log-by.js';
import { zlogMessage } from '../messages/log-message.js';
import { ZLogLevel } from '../levels/log-level.js';

describe('logZAtopOf', () => {
  let logger: ZLogger;
  let target: MockZLogRecorder;

  beforeEach(() => {
    target = logZToMock();
    logger = logZBy(logZAtopOf(target));
  });

  describe('record', () => {
    it('logs messages by target recorder', () => {
      logger.info('Message');

      expect(target.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'Message'));
    });
  });

  describe('whenLogged', () => {
    it('calls `whenLogged()` of target logger', async () => {
      expect(await logger.whenLogged('all')).toBe(true);

      expect(target.whenLogged).toHaveBeenCalledWith('all');
    });
  });

  describe('end', () => {
    it('ends logging', async () => {
      await logger.end();

      logger.info('Message');

      expect(await logger.whenLogged()).toBe(false);
      expect(target.record).not.toHaveBeenCalled();
      expect(target.whenLogged).not.toHaveBeenCalled();
    });
    it('does not ends target logging', async () => {
      await logger.end();

      expect(target.end).not.toHaveBeenCalled();
    });
  });
});
