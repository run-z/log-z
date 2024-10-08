import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { Logger } from '@proc7ts/logger';
import { consoleLogger, logDefer, processingLogger } from '@proc7ts/logger';
import { noop } from '@proc7ts/primitives';
import { ZLogLevel } from '../levels/log-level.js';
import { logZ } from '../log.js';
import { ZLogger } from '../logger.js';
import { zlogDetails } from '../messages/log-details.js';
import { logZToLogger } from './to-logger.log.js';

describe('logZToLogger', () => {
  let testLogger: Logger;
  let errorSpy: jest.Mock<(...args: unknown[]) => void>;
  let warnSpy: jest.Mock<(...args: unknown[]) => void>;
  let infoSpy: jest.Mock<(...args: unknown[]) => void>;
  let debugSpy: jest.Mock<(...args: unknown[]) => void>;
  let traceSpy: jest.Mock<(...args: unknown[]) => void>;

  beforeEach(() => {
    testLogger = {
      error: noop,
      warn: noop,
      info: noop,
      debug: noop,
      trace: noop,
    };
    spyOnLogger(testLogger);
  });
  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    debugSpy.mockRestore();
    traceSpy.mockRestore();
  });

  let logger: ZLogger;

  beforeEach(() => {
    logger = logZ({ atLeast: 0, by: logZToLogger(processingLogger(testLogger)) });
  });

  it('logs to `consoleLogger` by default', () => {
    spyOnLogger(consoleLogger);
    logger = logZ();
    logger.error('Test');
    expect(errorSpy).toHaveBeenCalledWith('Test');
  });

  it('logs empty message', () => {
    logger.error();
    expect(errorSpy).toHaveBeenCalledWith();
  });

  it('logs error', () => {
    const error = new Error('!!!');

    logger.error(error);
    expect(errorSpy).toHaveBeenCalledWith(error);
  });

  it('logs details after error', () => {
    const error = new Error('!!!');
    const details = { details: 'many' };

    logger.error(error, zlogDetails(details));
    expect(errorSpy).toHaveBeenCalledWith(error, details);
  });
  it('logs details without message text', () => {
    const details = { details: 'many' };

    logger.error(zlogDetails(details));
    expect(errorSpy).toHaveBeenCalledWith(details);
  });
  it('expands the message', () => {
    logger.error(logDefer(() => 'Expanded'));
    expect(errorSpy).toHaveBeenCalledWith('Expanded');
  });

  describe('fatal', () => {
    it('logs with `Logger.error` and FATAL! prefix', () => {
      logger.fatal('Error');
      expect(errorSpy).toHaveBeenCalledWith('FATAL!', 'Error');
    });
    it('logs FATAL! prefix only without message text', () => {
      logger.fatal(zlogDetails({ fatal: true }));
      expect(errorSpy).toHaveBeenCalledWith('FATAL!', { fatal: true });
    });
    it('logs with `Logger.error` and FATAL! prefix with higher level', () => {
      logger.log(ZLogLevel.Fatal + 1, 'Error');
      expect(errorSpy).toHaveBeenCalledWith('FATAL!', 'Error');
    });
  });

  describe('error', () => {
    it('logs with `Logger.error`', () => {
      logger.error('Error');
      expect(errorSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `Logger.error` with higher level', () => {
      logger.log(ZLogLevel.Fatal - 1, 'Error');
      expect(errorSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('warn', () => {
    it('logs with `Logger.warn`', () => {
      logger.warn('Error');
      expect(warnSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `Logger.warn` with higher level', () => {
      logger.log(ZLogLevel.Error - 1, 'Error');
      expect(warnSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('info', () => {
    it('logs with `Logger.info`', () => {
      logger.info('Error');
      expect(infoSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `Logger.info` with higher level', () => {
      logger.log(ZLogLevel.Warning - 1, 'Error');
      expect(infoSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('debug', () => {
    it('logs with `Logger.debug`', () => {
      logger.debug('Error');
      expect(debugSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `Logger.debug` with higher level', () => {
      logger.log(ZLogLevel.Info - 1, 'Error');
      expect(debugSpy).toHaveBeenCalledWith('Error');
    });
  });

  describe('trace', () => {
    it('logs with `Logger.trace`', () => {
      logger.trace('Error');
      expect(traceSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `Logger.trace` with higher level', () => {
      logger.log(ZLogLevel.Debug - 1, 'Error');
      expect(traceSpy).toHaveBeenCalledWith('Error');
    });
    it('logs with `Logger.trace` with lower level', () => {
      logger.log(ZLogLevel.Trace - 1, 'Error');
      expect(traceSpy).toHaveBeenCalledWith('Error');
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

  function spyOnLogger(testLogger: Logger): void {
    errorSpy = jest.spyOn(testLogger, 'error').mockImplementation(() => {
      /* noop */
    }) as typeof errorSpy;
    warnSpy = jest.spyOn(testLogger, 'warn').mockImplementation(() => {
      /* noop */
    }) as typeof warnSpy;
    infoSpy = jest.spyOn(testLogger, 'info').mockImplementation(() => {
      /* noop */
    }) as typeof infoSpy;
    debugSpy = jest.spyOn(testLogger, 'debug').mockImplementation(() => {
      /* noop */
    }) as typeof debugSpy;
    traceSpy = jest.spyOn(testLogger, 'trace').mockImplementation(() => {
      /* noop */
    }) as typeof traceSpy;
  }
});
