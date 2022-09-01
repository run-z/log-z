import { describe, expect, it } from '@jest/globals';
import { zlogMessage } from '../message';
import {
  zlogDEBUG,
  zlogERROR,
  zlogFATAL,
  zlogINFO,
  ZLogLevelFn,
  zlogTRACE,
  zlogWARN,
} from './levels';
import { ZLogLevel, zlogLevelOf } from './log-level';

describe.each([
  ['FATAL', zlogFATAL, ZLogLevel.Fatal],
  ['ERROR', zlogERROR, ZLogLevel.Error],
  ['WARN', zlogWARN, ZLogLevel.Warning],
  ['INFO', zlogINFO, ZLogLevel.Info],
  ['DEBUG', zlogDEBUG, ZLogLevel.Debug],
  ['TRACE', zlogTRACE, ZLogLevel.Trace],
])('%s', (name: string, levelFn: ZLogLevelFn, level: ZLogLevel) => {
  it('has numeric value', () => {
    // eslint-disable-next-line eqeqeq
    expect(levelFn == level).toBe(true);
    expect(levelFn >= level).toBe(true);
  });
  it('has correct string representation', () => {
    // eslint-disable-next-line eqeqeq
    expect(String(levelFn)).toBe(name);
  });
  it('builds log message', () => {
    expect(levelFn('Message', 'arg')).toEqual(zlogMessage(level, 'Message', 'arg'));
  });

  describe('toLogLevel()', () => {
    it('contains numeric log level value', () => {
      expect(levelFn.toLogLevel()).toBe(level);
    });
  });

  describe('[ZLogLevel__symbol]', () => {
    it('contains numeric log level value', () => {
      expect(zlogLevelOf(levelFn)).toBe(level);
    });
  });

  describe('toJSON', () => {
    it('converts to numeric value', () => {
      expect(JSON.stringify({ level: levelFn })).toEqual(JSON.stringify({ level }));
    });
  });
});
