import { beforeEach, describe, expect, it } from '@jest/globals';
import { ZLogLevel } from '../level';
import { logZBy } from '../log-by';
import type { ZLogger } from '../logger';
import { zlogMessage } from '../message';
import { logZToMock, MockZLogRecorder } from '../spec';
import { logZToOther } from './to-other.log';

describe('logZToOther', () => {

  let logger: ZLogger;
  let target: MockZLogRecorder;

  beforeEach(() => {
    target = logZToMock();
    logger = logZBy(logZToOther(() => target));
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
    it('ends target logging', async () => {
      await logger.end();

      expect(target.end).toHaveBeenCalled();
    });
  });
});
