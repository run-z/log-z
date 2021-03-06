import { beforeEach, describe, expect, it } from '@jest/globals';
import { newPromiseResolver } from '@proc7ts/primitives';
import { ZLogLevel } from '../level';
import { logZBy } from '../log-by';
import type { ZLogger } from '../logger';
import { zlogMessage } from '../message';
import type { MockZLogRecorder } from '../spec';
import { logZToMock } from '../spec';
import { logZByAll } from './by-all.log';

describe('logZByAll', () => {

  let target1: MockZLogRecorder;
  let target2: MockZLogRecorder;

  beforeEach(() => {
    target1 = logZToMock();
    target2 = logZToMock();
  });

  let logger: ZLogger;

  beforeEach(() => {
    logger = logZBy(logZByAll(target1, target2));
  });

  describe('record', () => {
    it('records by all recorders', () => {
      logger.info('Message');
      expect(target1.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'Message'));
      expect(target2.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'Message'));
    });
  });

  describe('whenLogged', () => {
    it('awaits for every logger to log the message', async () => {

      const resolver = newPromiseResolver<boolean>();

      target1.whenLogged.mockImplementation(() => resolver.promise());

      const whenLogged = logger.whenLogged('all');

      expect(target1.whenLogged).toHaveBeenCalledWith('all');
      expect(target2.whenLogged).toHaveBeenCalledWith('all');

      resolver.resolve(true);

      expect(await whenLogged).toBe(true);
    });
    it('resolves to `false` if at least one logger did not log the message', async () => {

      const resolver = newPromiseResolver<boolean>();

      target1.whenLogged.mockImplementation(() => resolver.promise());

      const whenLogged = logger.whenLogged('all');

      expect(target1.whenLogged).toHaveBeenCalledWith('all');
      expect(target2.whenLogged).toHaveBeenCalledWith('all');

      resolver.resolve(false);

      expect(await whenLogged).toBe(false);
    });
  });

  describe('end', () => {
    it('ends all recorders', async () => {
      expect(await logger.end()).toBeUndefined();

      expect(target1.end).toHaveBeenCalledWith();
      expect(target2.end).toHaveBeenCalledWith();
    });
  });

});
