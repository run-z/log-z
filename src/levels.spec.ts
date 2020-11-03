import { zlogDEBUG, zlogERROR, zlogFATAL, zlogINFO, zlogTRACE, zlogWARN } from './levels';
import { ZLogLevel } from './log-level';
import type { ZLogMessage } from './log-message';
import { zlogMessage } from './log-message';

describe.each([
    ['FATAL', zlogFATAL, ZLogLevel.Fatal],
    ['ERROR', zlogERROR, ZLogLevel.Error],
    ['WARN', zlogWARN, ZLogLevel.Warning],
    ['INFO', zlogINFO, ZLogLevel.Info],
    ['DEBUG', zlogDEBUG, ZLogLevel.Debug],
    ['TRACE', zlogTRACE, ZLogLevel.Trace],
])('%s', (name: string, build: ((...args: any[]) => ZLogMessage) & ZLogLevel, level: ZLogLevel) => {
  it('has numeric value', () => {
    // eslint-disable-next-line eqeqeq
    expect(build == level).toBe(true);
    expect(build >= level).toBe(true);
  });
  it('has correct string representation', () => {
    // eslint-disable-next-line eqeqeq
    expect(String(build)).toBe(name);
  });
  it('builds log message', () => {
    expect(build('Message', 'arg')).toEqual(zlogMessage(level, 'Message', 'arg'));
  });
});
