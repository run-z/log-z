import { describe, expect, it } from '@jest/globals';
import { dueLog } from '@proc7ts/logger';
import { ZLogLevel } from '../level';
import { assignZLogDetails, cloneZLogDetails, ZLogDetails, zlogDetails } from './log-details';
import { zlogMessage } from './log-message';

describe('zlogDetails', () => {
  it('logged as details object outside `log-z`', () => {
    expect(dueLog({ line: [zlogDetails({ foo: 'bar' })] }).line).toEqual([{ foo: 'bar' }]);
  });
  it('treated as message details', () => {
    expect(zlogMessage(
        ZLogLevel.Debug,
        zlogDetails({ test: 'value' }),
        zlogDetails({ test2: 'value2' }),
        'msg',
    )).toEqual({
      level: ZLogLevel.Debug,
      line: ['msg'],
      details: {
        test: 'value',
        test2: 'value2',
      },
    });
  });
});

describe('cloneZLogDetails', () => {
  it('deeply clones message details', () => {
    expect(cloneZLogDetails({
      n: 1,
      o: {
        a: [1, 2],
        b: { foo: 'bar' },
        c: undefined,
        d: null,
      },
    })).toEqual({
      n: 1,
      o: {
        a: [1, 2],
        b: { foo: 'bar' },
        d: null,
      },
    });
  });
});

describe('assignZLogDetails', () => {
  it('merges records', () => {

    const target: ZLogDetails.Mutable = {
      a: {
        a: 1,
        b: 2,
        c: 3,
      },
    };

    expect(assignZLogDetails(target, { a: { b: 12, d: 22 } })).toEqual({
      a: {
        a: 1,
        b: 12,
        c: 3,
        d: 22,
      },
    });
  });
  it('overrides raw values with objects', () => {

    const target: ZLogDetails.Mutable = {
      a: {
        b: 1,
      },
    };

    expect(assignZLogDetails(target, { a: { b: { c: 1 } } })).toEqual({ a: { b: { c: 1 } } });
  });
  it('overrides objects with raw values', () => {

    const target: ZLogDetails.Mutable = {
      a: {
        b: { c: 1 },
      },
    };

    expect(assignZLogDetails(target, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
  });
});
