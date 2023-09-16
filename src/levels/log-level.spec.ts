import { describe, expect, it } from '@jest/globals';
import { valueProvider } from '@proc7ts/primitives';
import {
  ZLogLevel,
  zlogLevelAbbr,
  zlogLevelAbbr5,
  zlogLevelName,
  zlogLevelOf,
} from './log-level.js';

describe('zlogLevelName', () => {
  it('detects level name', () => {
    expect(zlogLevelName(ZLogLevel.Fatal + 1)).toBe('Fatal');
    expect(zlogLevelName(ZLogLevel.Fatal)).toBe('Fatal');
    expect(zlogLevelName(ZLogLevel.Fatal - 1)).toBe('Error');
    expect(zlogLevelName(ZLogLevel.Error)).toBe('Error');
    expect(zlogLevelName(ZLogLevel.Error - 1)).toBe('Warning');
    expect(zlogLevelName(ZLogLevel.Warning)).toBe('Warning');
    expect(zlogLevelName(ZLogLevel.Warning - 1)).toBe('Info');
    expect(zlogLevelName(ZLogLevel.Info)).toBe('Info');
    expect(zlogLevelName(ZLogLevel.Info - 1)).toBe('Debug');
    expect(zlogLevelName(ZLogLevel.Debug)).toBe('Debug');
    expect(zlogLevelName(ZLogLevel.Debug - 1)).toBe('Trace');
    expect(zlogLevelName(ZLogLevel.Trace)).toBe('Trace');
    expect(zlogLevelName(ZLogLevel.Trace - 1)).toBe('Silly');
  });
});

describe('zlogLevelAbbr', () => {
  it('detects level abbreviation', () => {
    expect(zlogLevelAbbr(ZLogLevel.Fatal + 1)).toBe('FATAL');
    expect(zlogLevelAbbr(ZLogLevel.Fatal)).toBe('FATAL');
    expect(zlogLevelAbbr(ZLogLevel.Fatal - 1)).toBe('ERROR');
    expect(zlogLevelAbbr(ZLogLevel.Error)).toBe('ERROR');
    expect(zlogLevelAbbr(ZLogLevel.Error - 1)).toBe('WARN');
    expect(zlogLevelAbbr(ZLogLevel.Warning)).toBe('WARN');
    expect(zlogLevelAbbr(ZLogLevel.Warning - 1)).toBe('INFO');
    expect(zlogLevelAbbr(ZLogLevel.Info)).toBe('INFO');
    expect(zlogLevelAbbr(ZLogLevel.Info - 1)).toBe('DEBUG');
    expect(zlogLevelAbbr(ZLogLevel.Debug)).toBe('DEBUG');
    expect(zlogLevelAbbr(ZLogLevel.Debug - 1)).toBe('TRACE');
    expect(zlogLevelAbbr(ZLogLevel.Trace)).toBe('TRACE');
    expect(zlogLevelAbbr(ZLogLevel.Trace - 1)).toBe('SILLY');
  });
});

describe('zlogLevelAbbr5', () => {
  it('detects level 5-letter abbreviation', () => {
    expect(zlogLevelAbbr5(ZLogLevel.Fatal + 1)).toBe('FATAL');
    expect(zlogLevelAbbr5(ZLogLevel.Fatal)).toBe('FATAL');
    expect(zlogLevelAbbr5(ZLogLevel.Fatal - 1)).toBe('ERROR');
    expect(zlogLevelAbbr5(ZLogLevel.Error)).toBe('ERROR');
    expect(zlogLevelAbbr5(ZLogLevel.Error - 1)).toBe('WARN ');
    expect(zlogLevelAbbr5(ZLogLevel.Warning)).toBe('WARN ');
    expect(zlogLevelAbbr5(ZLogLevel.Warning - 1)).toBe('INFO ');
    expect(zlogLevelAbbr5(ZLogLevel.Info)).toBe('INFO ');
    expect(zlogLevelAbbr5(ZLogLevel.Info - 1)).toBe('DEBUG');
    expect(zlogLevelAbbr5(ZLogLevel.Debug)).toBe('DEBUG');
    expect(zlogLevelAbbr5(ZLogLevel.Debug - 1)).toBe('TRACE');
    expect(zlogLevelAbbr5(ZLogLevel.Trace)).toBe('TRACE');
    expect(zlogLevelAbbr5(ZLogLevel.Trace - 1)).toBe('SILLY');
  });
});

describe('zlogLevelOf', () => {
  it('equals to numeric value', () => {
    expect(zlogLevelOf(123)).toBe(123);
  });
  it('extracts the value from `toLogLevel()`', () => {
    expect(zlogLevelOf({ toLogLevel: valueProvider(ZLogLevel.Info) })).toBe(ZLogLevel.Info);
  });
  it('converts the value from `toLogLevel()` to number', () => {
    expect(zlogLevelOf({ toLogLevel: valueProvider(String(ZLogLevel.Info)) })).toBe(ZLogLevel.Info);
  });
  it('ignores NaN value from `toLogLevel()`', () => {
    expect(zlogLevelOf({ toLogLevel: valueProvider('-') })).toBeUndefined();
  });
  it('returns `undefined` for string', () => {
    expect(zlogLevelOf('WARN')).toBeUndefined();
  });
  it('returns `undefined` for object without `toLogLevel` property', () => {
    expect(zlogLevelOf({})).toBeUndefined();
  });
  it('returns `undefined` for object without `toLogLevel()` method', () => {
    expect(zlogLevelOf({ toLogLevel: ZLogLevel.Info })).toBeUndefined();
  });
});
