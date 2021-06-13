import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { SpyInstance } from 'jest-mock';
import { ZLogLevel } from '../level';
import { logZ } from '../log';
import type { ZLogger } from '../logger';
import { zlogDefer, zlogDetails, zlogExtra } from '../message';
import { logZToConsole } from './to-console.log';

describe('logZToConsole', () => {

  let testConsole: Console;
  let errorSpy: SpyInstance<void, unknown[]>;
  let warnSpy: SpyInstance<void, unknown[]>;
  let infoSpy: SpyInstance<void, unknown[]>;
  let logSpy: SpyInstance<void, unknown[]>;
  let debugSpy: SpyInstance<void, unknown[]>;
  let traceSpy: SpyInstance<void, unknown[]>;

  beforeEach(() => {
    testConsole = {
      error: () => {/* noop */},
      warn: () => {/* noop */},
      info: () => {/* noop */},
      log: () => {/* noop */},
      debug: () => {/* noop */},
      trace: () => {/* noop */},
    } as any;
    spyOnConsole(testConsole);
  });
  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    logSpy.mockRestore();
    debugSpy.mockRestore();
    traceSpy.mockRestore();
  });

  let logger: ZLogger;

  beforeEach(() => {
    logger = logZ({ atLeast: 0, by: logZToConsole(testConsole) });
  });

  it('logs to global console by default', () => {
    spyOnConsole(console);
    logger = logZ();
    logger.error('Test');
    expect(errorSpy).toHaveBeenCalledWith('%s', 'Test');
  });

  it('logs empty message', () => {
    logger.error();
    expect(errorSpy).toHaveBeenCalledWith();
  });

  it('logs error', () => {

    const error = new Error('!!!');

    logger.error(error);
    expect(errorSpy).toHaveBeenCalledWith('%s', error.message, error);
  });

  it('logs details before error', () => {

    const error = new Error('!!!');
    const details = { details: 'many' };

    logger.error(error, zlogDetails(details));
    expect(errorSpy).toHaveBeenCalledWith('%s', error.message, details, error);
  });
  it('logs details without message text', () => {

    const details = { details: 'many' };

    logger.error(zlogDetails(details));
    expect(errorSpy).toHaveBeenCalledWith(details);
  });

  it('logs extra before details and error', () => {

    const error = new Error('!!!');
    const details = { details: 'many' };

    logger.error(error, zlogDetails(details), 'Error', ['extra']);
    expect(errorSpy).toHaveBeenCalledWith('%s', 'Error', ['extra'], details, error);
  });
  it('logs extra without message text', () => {
    logger.error(zlogExtra('extra', 1, 2));
    expect(errorSpy).toHaveBeenCalledWith('%s', 'extra', 1, 2);
  });

  it('expands the message', () => {
    logger.error(zlogDefer(() => 'Expanded'));
    expect(errorSpy).toHaveBeenCalledWith('%s', 'Expanded');
  });

  describe('fatal', () => {
    it('logs with `console.error` and FATAL! prefix', () => {
      logger.fatal('Error');
      expect(errorSpy).toHaveBeenCalledWith('%s', 'FATAL! Error');
    });
    it('logs FATAL! prefix only without message text', () => {
      logger.fatal(zlogDetails({ fatal: true }));
      expect(errorSpy).toHaveBeenCalledWith('%s', 'FATAL!', { fatal: true });
    });
    it('logs with `console.error` and FATAL! prefix with higher level', () => {
      logger.log(ZLogLevel.Fatal + 1, 'Error');
      expect(errorSpy).toHaveBeenCalledWith('%s', 'FATAL! Error');
    });
  });

  describe('error', () => {
    it('logs with `console.error`', () => {
      logger.error('Error');
      expect(errorSpy).toHaveBeenCalledWith('%s', 'Error');
    });
    it('logs with `console.error` with higher level', () => {
      logger.log(ZLogLevel.Fatal - 1, 'Error');
      expect(errorSpy).toHaveBeenCalledWith('%s', 'Error');
    });
  });

  describe('warn', () => {
    it('logs with `console.warn`', () => {
      logger.warn('Error');
      expect(warnSpy).toHaveBeenCalledWith('%s', 'Error');
    });
    it('logs with `console.warn` with higher level', () => {
      logger.log(ZLogLevel.Error - 1, 'Error');
      expect(warnSpy).toHaveBeenCalledWith('%s', 'Error');
    });
  });

  describe('info', () => {
    it('logs with `console.info`', () => {
      logger.info('Error');
      expect(infoSpy).toHaveBeenCalledWith('%s', 'Error');
    });
    it('logs with `console.info` with higher level', () => {
      logger.log(ZLogLevel.Warning - 1, 'Error');
      expect(infoSpy).toHaveBeenCalledWith('%s', 'Error');
    });
  });

  describe('debug', () => {
    it('logs with `console.log`', () => {
      logger.debug('Error');
      expect(logSpy).toHaveBeenCalledWith('%s', 'Error');
    });
    it('logs with `console.log` with higher level', () => {
      logger.log(ZLogLevel.Info - 1, 'Error');
      expect(logSpy).toHaveBeenCalledWith('%s', 'Error');
    });
  });

  describe('trace', () => {
    it('logs with `console.debug` without `stackTrace` set', () => {
      logger.trace('Error');
      expect(debugSpy).toHaveBeenCalledWith('%s', 'Error');
    });
    it('logs with `console.trace` with `stackTrace` set', () => {
      logger.trace('Error', zlogDetails({ stackTrace: true }));
      expect(traceSpy).toHaveBeenCalledWith('%s', 'Error');
    });
    it('logs with `console.debug` with higher level', () => {
      logger.log(ZLogLevel.Debug - 1, 'Error');
      expect(debugSpy).toHaveBeenCalledWith('%s', 'Error');
    });
    it('logs with `console.debug` with lower level', () => {
      logger.log(ZLogLevel.Trace - 1, 'Error');
      expect(debugSpy).toHaveBeenCalledWith('%s', 'Error');
    });
  });

  describe('whenLogged', () => {
    it('always resolves to `true`', async () => {
      expect(await logger.whenLogged()).toBe(true);
    });
  });

  describe('end', () => {
    it('stops logging', async () => {
      expect(await logger.end()).toBeUndefined();
      logger.error('Error');
      expect(await logger.whenLogged()).toBe(false);
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });

  function spyOnConsole(testConsole: typeof console): void {
    errorSpy = jest.spyOn(testConsole, 'error').mockImplementation(() => {/* noop */});
    warnSpy = jest.spyOn(testConsole, 'warn').mockImplementation(() => {/* noop */});
    infoSpy = jest.spyOn(testConsole, 'info').mockImplementation(() => {/* noop */});
    logSpy = jest.spyOn(testConsole, 'log').mockImplementation(() => {/* noop */});
    debugSpy = jest.spyOn(testConsole, 'debug').mockImplementation(() => {/* noop */});
    traceSpy = jest.spyOn(testConsole, 'trace').mockImplementation(() => {/* noop */});
  }

});
