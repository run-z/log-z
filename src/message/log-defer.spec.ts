import { describe, expect, it } from '@jest/globals';
import { dueLog } from '@proc7ts/logger';
import { zlogERROR, ZLogLevel } from '../level';
import { zlogDefer } from './log-defer';

describe('zlogDefer', () => {
  it('is not expanded in input stage', () => {

    const deferred = zlogDefer(() => ({ foo: 'bar' }));

    expect(zlogERROR(deferred)).toEqual({
      level: ZLogLevel.Error,
      line: [deferred],
      details: {},
    });
  });
  it('is expanded outside `log-z` in undefined stage', () => {
    expect(dueLog({ line: [zlogDefer(() => ({ foo: 'bar' }))] }).line).toEqual([{ foo: 'bar' }]);
  });
});
