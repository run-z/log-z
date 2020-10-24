import type { ZLogFormatter } from '../formats';
import { textZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';

describe('zlofError', () => {

  let format: ZLogFormatter;

  beforeEach(() => {
    format = textZLogFormatter();
  });

  it('formats error', () => {

    const error = new Error();

    expect(format(zlogMessage(ZLogLevel.Error, error))).toBe(`[ERROR] ${String(error)} ${error.stack}`);
  });
  it('formats error without stack', () => {

    const error = new Error();

    error.stack = undefined;

    expect(format(zlogMessage(ZLogLevel.Error, error))).toBe(`[ERROR] ${String(error)}`);
  });
  it('formats error value', () => {
    expect(format({
      level: ZLogLevel.Error,
      text: '',
      error: 'Error!',
      details: {},
      extra: [],
    })).toBe(`[ERROR] [Error: "Error!"]`);
  });
});
