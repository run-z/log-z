import { textZLogFormatter, ZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';

describe('extraZLogField', () => {

  let format: ZLogFormatter;

  beforeEach(() => {
    format = textZLogFormatter();
  });

  it('formats message extra', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', 'more', { to: 'report' })))
        .toBe('[ERROR] Message ("more", { to: "report" })');
  });
  it('formats `null` parameter', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', null)))
        .toBe('[ERROR] Message (null)');
  });
  it('formats `undefined` parameter', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', undefined)))
        .toBe('[ERROR] Message (undefined)');
  });
  it('formats array parameter', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', [1, 'or', 2])))
        .toBe('[ERROR] Message ([1, "or", 2])');
  });
  it('formats empty array parameter', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', [])))
        .toBe('[ERROR] Message ([])');
  });
});
