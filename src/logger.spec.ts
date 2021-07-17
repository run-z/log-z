import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { CxBuilder, cxConstAsset } from '@proc7ts/context-builder';
import { CxGlobals } from '@proc7ts/context-values';
import { consoleLogger } from '@proc7ts/logger';
import { SpyInstance, spyOn } from 'jest-mock';
import { ZLogLevel } from './level';
import { ZLogger } from './logger';
import { zlogDetails } from './message';
import { logZToMock } from './spec';

describe('ZLogger', () => {

  let cxBuilder: CxBuilder;

  beforeEach(() => {
    cxBuilder = new CxBuilder(get => ({ get }));
    cxBuilder.provide(cxConstAsset(CxGlobals, cxBuilder.context));
  });

  let logger: ZLogger;

  beforeEach(() => {
    logger = cxBuilder.get(ZLogger);
  });

  it('logs to most recent log recorder', () => {

    const testLogRecorder = logZToMock();

    cxBuilder.provide(cxConstAsset(ZLogger, testLogRecorder));

    const error = new Error('Test');

    logger.error('Error', zlogDetails({ test: true }), error);

    expect(testLogRecorder.record).toHaveBeenCalledWith({
      level: ZLogLevel.Error,
      line: ['Error', error],
      details: { test: true },
    });
    expect(testLogRecorder.record).toHaveBeenCalledTimes(1);
  });
  it('is singleton', () => {

    const cxBuilder2 = new CxBuilder(get => ({ get }), cxBuilder);

    expect(cxBuilder2.get(ZLogger)).toBe(logger);
  });

  describe('by default', () => {

    let infoSpy: SpyInstance<void, unknown[]>;
    let debugSpy: SpyInstance<void, unknown[]>;

    beforeEach(() => {
      infoSpy = spyOn(consoleLogger, 'info').mockImplementation(() => void 0);
      debugSpy = spyOn(consoleLogger, 'debug').mockImplementation(() => void 0);
    });
    afterEach(() => {
      infoSpy.mockRestore();
    });

    it('logs info message to console', () => {

      const error = new Error('Test');

      logger.info('Info', error);

      expect(infoSpy).toHaveBeenCalledWith('Info', error);
      expect(infoSpy).toHaveBeenCalledTimes(1);
    });
    it('does not log debug messages', () => {
      logger.debug('Ignored');

      expect(debugSpy).not.toHaveBeenCalled();
    });
  });

  describe('toString', () => {
    it('provides string representation', () => {
      expect(String(ZLogger)).toBe('[ZLogger]');
    });
  });
});
