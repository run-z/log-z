import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { SpyInstance } from 'jest-mock';
import { logZ } from '../log';
import { zlogDetails } from '../log-details';
import { ZLogLevel } from '../log-level';
import { zlogExtra } from '../log-message';
import { zlogDefer } from '../loggable';
import type { ZLogger } from '../logger';
import { logZToConsole } from './to-console.log';

describe('logZToConsole', () => {

  let testConsole: Console;
  let errorSpy: SpyInstance<void, any[]>;
  let warnSpy: SpyInstance<void, any[]>;
  let infoSpy: SpyInstance<void, any[]>;
  let logSpy: SpyInstance<void, any[]>;
  let debugSpy: SpyInstance<void, any[]>;
  let traceSpy: SpyInstance<void, any[]>;

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
    expect(errorSpy).toHaveBeenCalledWith('Test');
  });

  it('logs error', () => {

    const error = new Error('!!!');

    logger.error(error);
    expect(errorSpy).toHaveBeenCalledWith(error.message, error);
  });

  it('logs details before error', () => {

    const error = new Error('!!!');
    const details = { details: 'many' };

    logger.error(error, zlogDetails(details));
    expect(errorSpy).toHaveBeenCalledWith(error.message, details, error);
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
    expect(errorSpy).toHaveBeenCalledWith('Error', ['extra'], details, error);
  });
  it('logs extra without message text', () => {
    logger.error(zlogExtra('extra', 1, 2));
    expect(errorSpy).toHaveBeenCalledWith('extra', 1, 2);
  });

  it('expands the message', () => {
    logger.error(zlogDefer(() => 'Expanded'));
    expect(errorSpy).toHaveBeenCalledWith('Expanded');
  });

  describe('fatal', () => {
    it('logs with `console.error` and FATAL! prefix', () => {
      logger.fatal('Error');
      expect(errorSpy).toHaveBeenCalledWith('FATAL! Error');
    });
    it('logs FATAL! prefix only without message text', () => {
      logger.fatal(zlogDetails({ fatal: true }));
      expect(errorSpy).toHaveBeenCalledWith('FATAL!', { fatal: true });
    });
    it('logs with `console.error` and FATAL! prefix with higher level', () => {
      logger.log(ZLogLevel.Fatal + 1, 'Error');
      expect(errorSpy).toHaveBeenCalledWith('FATAL! Error');
    });
  });

  describe('error', () => {
    it('logs with `console.error`', () => {
      logger.error('Error');
      expect(errorSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `console.error` with higher level', () => {
      logger.log(ZLogLevel.Fatal - 1, 'Error');
      expect(errorSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('warn', () => {
    it('logs with `console.warn`', () => {
      logger.warn('Error');
      expect(warnSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `console.warn` with higher level', () => {
      logger.log(ZLogLevel.Error - 1, 'Error');
      expect(warnSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('info', () => {
    it('logs with `console.info`', () => {
      logger.info('Error');
      expect(infoSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `console.info` with higher level', () => {
      logger.log(ZLogLevel.Warning - 1, 'Error');
      expect(infoSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('debug', () => {
    it('logs with `console.log`', () => {
      logger.debug('Error');
      expect(logSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `console.log` with higher level', () => {
      logger.log(ZLogLevel.Info - 1, 'Error');
      expect(logSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('trace', () => {
    it('logs with `console.debug` without `stackTrace` set', () => {
      logger.trace('Error');
      expect(debugSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `console.trace` with `stackTrace` set', () => {
      logger.trace('Error', zlogDetails({ stackTrace: true }));
      expect(traceSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `console.debug` with higher level', () => {
      logger.log(ZLogLevel.Debug - 1, 'Error');
      expect(debugSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `console.debug` with lower level', () => {
      logger.log(ZLogLevel.Trace - 1, 'Error');
      expect(debugSpy).toHaveBeenCalledWith('Error');
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
