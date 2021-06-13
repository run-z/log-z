import { describe, expect, it } from '@jest/globals';
import { ZLogLevel } from '../level';
import { zlogError } from './log-error';
import { zlogMessage } from './log-message';

describe('logError', () => {
  it('treated as error', () => {

    const error1 = new Error('error1');
    const error2 = new Error('error2');

    expect(zlogMessage(ZLogLevel.Error, 1, 2, zlogError(error1), zlogError(error2))).toEqual({
      level: ZLogLevel.Error,
      text: error1.message,
      error: error1,
      details: {},
      extra: [1, 2, error2],
    });
  });
  it('does not set message with non-`Error` parameter', () => {

    const error = 'error';

    expect(zlogMessage(ZLogLevel.Error, 1, 2, zlogError(error))).toEqual({
      level: ZLogLevel.Error,
      text: '',
      error,
      details: {},
      extra: [1, 2],
    });
  });
});
