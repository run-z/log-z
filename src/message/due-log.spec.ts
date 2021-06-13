import { describe, expect, it } from '@jest/globals';
import { ZLogLevel } from '../level';
import { dueLogZ } from './due-log';
import { zlogDetails } from './log-details';
import { zlogError } from './log-error';
import { zlogExtra } from './log-extra';
import type { ZLogMessage } from './log-message';
import type { ZLoggable } from './loggable';

describe('dueLogZ', () => {
  it('processes raw values', () => {
    expect(dueLogZ({
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1],
      },
    })).toEqual({
      line: [1],
      index: 1,
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1],
      },
    });
  });
  it('applies message text on input', () => {
    expect(dueLogZ({
      on: 'in',
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, 'message', 3, 'more'],
      },
    })).toEqual({
      on: 'in',
      line: [1, 3, 'more'],
      index: 3,
      zMessage: {
        level: ZLogLevel.Error,
        text: 'message',
        details: {},
        extra: [1, 3, 'more'],
      },
    });
  });
  it('applies error on input', () => {

    const error = new Error('Test');
    const error2 = new Error('Test2');

    expect(dueLogZ({
      on: 'in',
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, error, 3, error2],
      },
    })).toEqual({
      on: 'in',
      line: [1, 3, error2],
      index: 3,
      zMessage: {
        level: ZLogLevel.Error,
        text: 'Test',
        error,
        details: {},
        extra: [1, 3, error2],
      },
    });
  });
  it('applies error and text on input', () => {

    const error = new Error('Test');

    expect(dueLogZ({
      on: 'in',
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, error, 3, 'message'],
      },
    })).toEqual({
      on: 'in',
      line: [1, 3],
      index: 2,
      zMessage: {
        level: ZLogLevel.Error,
        text: 'message',
        error,
        details: {},
        extra: [1, 3],
      },
    });
  });
  it('treats `zlogError()` as error', () => {

    const error = 'error';

    expect(dueLogZ({
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, zlogError(error), 3],
      },
    })).toEqual({
      line: [1, 3],
      index: 2,
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        error,
        details: {},
        extra: [1, 3],
      },
    });
  });
  it('treats `zlogExtra()` as log line on input', () => {
    expect(dueLogZ({
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, zlogExtra('a', 'b', 'c'), 3],
      },
    })).toEqual({
      line: [1, 'a', 'b', 'c', 3],
      index: 5,
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, 'a', 'b', 'c', 3],
      },
    });
  });
  it('treats `zlogDetails()` as message details', () => {
    expect(dueLogZ({
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, zlogDetails({ a: 2 }), 3],
      },
    })).toEqual({
      line: [1, 3],
      index: 2,
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: { a: 2 },
        extra: [1, 3],
      },
    });
  });
  it('handles message extra replacement', () => {

    const message: ZLogMessage = {
      level: ZLogLevel.Error,
      text: 'Replacement',
      details: {},
      extra: [1, 2, 3],
    };
    const loggable: ZLoggable = {
      toLog(target) {
        target.zMessage = message;
      },
    };

    expect(dueLogZ({
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [loggable],
      },
    })).toEqual({
      line: message.extra,
      index: message.extra.length,
      zMessage: message,
    });
  });
  it('handles log line replacement', () => {

    const loggable: ZLoggable = {
      toLog(target) {
        target.line = [1, 2, 3];
      },
    };

    expect(dueLogZ({
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [loggable],
      },
    })).toEqual({
      line: [1, 2, 3],
      index: 3,
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [1, 2, 3],
      },
    });
  });
  it('handles log message an line replacement', () => {

    const loggable: ZLoggable = {
      toLog(target) {

        const extra = [1, 2, 3];

        target.zMessage = { ...target.zMessage!, text: 'Replaced', extra };
        target.line = extra;
      },
    };

    expect(dueLogZ({
      zMessage: {
        level: ZLogLevel.Error,
        text: '',
        details: {},
        extra: [loggable],
      },
    })).toEqual({
      line: [1, 2, 3],
      index: 3,
      zMessage: {
        level: ZLogLevel.Error,
        text: 'Replaced',
        details: {},
        extra: [1, 2, 3],
      },
    });
  });
});
