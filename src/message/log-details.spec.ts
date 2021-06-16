import { describe, expect, it } from '@jest/globals';
import { dueLog, logline } from '@proc7ts/logger';
import { zlogDEBUG, ZLogLevel } from '../level';
import { assignZLogDetails, cloneZLogDetails, ZLogDetails, zlogDetails } from './log-details';

describe('zlogDetails', () => {
  it('treated as message details', () => {
    expect(zlogDEBUG(
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
  it('can be used within `logline`', () => {
    expect(zlogDEBUG(logline`
        ${zlogDetails({ test: 'value' })}${zlogDetails({ test2: 'value2' })}
        msg
    `)).toEqual({
      level: ZLogLevel.Debug,
      line: ['msg'],
      details: {
        test: 'value',
        test2: 'value2',
      },
    });
  });

  describe('outside `log-z`', () => {
    it('does nothing in input stage', () => {

      const details = zlogDetails({ foo: 'bar' });

      expect(dueLog({ on: 'in', line: ['a', details, 'b'] }).line).toEqual(['a', details, 'b']);
    });
    it('logs an object', () => {
      expect(dueLog({ line: ['a', zlogDetails({ foo: 'bar' }), 'b'] }).line).toEqual(['a', { foo: 'bar' }, 'b']);
    });
    it('logs an object if the last in the line', () => {
      expect(dueLog({ line: ['a', zlogDetails({ foo: 'bar' })] }).line).toEqual(['a', { foo: 'bar' }]);
    });
    it('logs nothing if empty', () => {
      expect(dueLog({ line: ['a', zlogDetails({}), 'b'] }).line).toEqual(['a', 'b']);
    });

    describe('with `error`', () => {
      it('logs an object if not the last in the line', () => {

        const error = new Error();

        expect(dueLog({ line: ['a', zlogDetails({ error }), 'b'] }).line).toEqual(['a', { error }, 'b']);
      });
      it('logs an error if the last in the line', () => {

        const error = new Error();

        expect(dueLog({ line: ['a', zlogDetails({ error })] }).line).toEqual(['a', error]);
      });
      it('logs non-empty object and error if the last in the line', () => {

        const error = new Error();

        expect(dueLog({ line: ['a', zlogDetails({ error, foo: 'bar' })] }).line).toEqual(['a', { foo: 'bar' }, error]);
      });
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
  it('overrides plain objects with non-plain objects', () => {

    const target: ZLogDetails.Mutable = {
      a: {
        b: 1,
      },
    };

    expect(assignZLogDetails(target, { a: { b: [1, 2, 3] } })).toEqual({ a: { b: [1, 2, 3] } });
  });
});
