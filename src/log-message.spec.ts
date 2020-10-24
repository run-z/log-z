import { ZLogLevel } from './log-level';
import { zlogDetails, zlogError, zlogExtra, zlogMessage } from './log-message';

describe('zlogMessage', () => {
  it('treats the first textual argument as message text', () => {
    expect(zlogMessage(ZLogLevel.Error, 1, 2, 'text1', 'text2')).toEqual({
      level: ZLogLevel.Error,
      text: 'text1',
      details: {},
      extra: [1, 2, 'text2'],
    });
  });
  it('treats the first error argument as error', () => {

    const error1 = new Error('error1');
    const error2 = new Error('error2');

    expect(zlogMessage(ZLogLevel.Error, 1, 2, error1, error2)).toEqual({
      level: ZLogLevel.Error,
      text: error1.message,
      error: error1,
      details: {},
      extra: [1, 2, error2],
    });
  });
  it('treats the first `zlogError()` result as error', () => {

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
  it('does not override message text with error message', () => {

    const error = new Error('error');

    expect(zlogMessage(ZLogLevel.Error, 1, 2, 'text', error)).toEqual({
      level: ZLogLevel.Error,
      text: 'text',
      error,
      details: {},
      extra: [1, 2],
    });
  });
  it('does not set message text with non-error `zlogError()` result', () => {

    const error = 'error';

    expect(zlogMessage(ZLogLevel.Error, 1, 2, zlogError(error))).toEqual({
      level: ZLogLevel.Error,
      text: '',
      error,
      details: {},
      extra: [1, 2],
    });
  });
  it('prefers textual message over error one', () => {

    const error = new Error('error');

    expect(zlogMessage(ZLogLevel.Error, 1, 2, error, 'text')).toEqual({
      level: ZLogLevel.Error,
      text: 'text',
      error: error,
      details: {},
      extra: [1, 2],
    });
  });
  it('treats `zlogDetails()` result as message details', () => {
    expect(zlogMessage(
        ZLogLevel.Debug,
        zlogDetails({ test: 'value' }),
        zlogDetails({ test2: 'value2' }),
        'msg',
    )).toEqual({
      level: ZLogLevel.Debug,
      text: 'msg',
      details: {
        test: 'value',
        test2: 'value2',
      },
      extra: [],
    });
  });
  it('treats `zlogExtra()` result as message extra', () => {
    expect(zlogMessage(ZLogLevel.Error, zlogExtra('text', 2))).toEqual({
      level: ZLogLevel.Error,
      text: '',
      details: {},
      extra: ['text', 2],
    });
  });
});
