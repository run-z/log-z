import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogFormatter } from './log-formatter';
import { zlogFormatter } from './log-formatter';

describe('zlogFormatter', () => {

  let format: ZLogFormatter;

  beforeEach(() => {
    format = zlogFormatter();
  });

  it('formats log level', () => {
    expect(format(zlogMessage(ZLogLevel.Fatal + 1))).toBe('[FATAL]');
    expect(format(zlogMessage(ZLogLevel.Fatal))).toBe('[FATAL]');
    expect(format(zlogMessage(ZLogLevel.Fatal - 1))).toBe('[ERROR]');
    expect(format(zlogMessage(ZLogLevel.Error))).toBe('[ERROR]');
    expect(format(zlogMessage(ZLogLevel.Error - 1))).toBe('[WARN ]');
    expect(format(zlogMessage(ZLogLevel.Warning))).toBe('[WARN ]');
    expect(format(zlogMessage(ZLogLevel.Warning - 1))).toBe('[INFO ]');
    expect(format(zlogMessage(ZLogLevel.Info))).toBe('[INFO ]');
    expect(format(zlogMessage(ZLogLevel.Info - 1))).toBe('[DEBUG]');
    expect(format(zlogMessage(ZLogLevel.Debug))).toBe('[DEBUG]');
    expect(format(zlogMessage(ZLogLevel.Debug - 1))).toBe('[TRACE]');
    expect(format(zlogMessage(ZLogLevel.Trace))).toBe('[TRACE]');
    expect(format(zlogMessage(ZLogLevel.Trace - 1))).toBe('[SILLY]');
  });
  it('allows to mute level', () => {
    format = zlogFormatter({ level: () => '' });
    expect(format(zlogMessage(ZLogLevel.Fatal, 'Message'))).toBe('Message');
  });
  it('formats message text', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message'))).toBe('[ERROR] Message');
  });
  it('formats message details', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', { some: 'value' })))
        .toBe('[ERROR] Message { some: "value" }');
  });
  it('formats deep message details', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', { some: { index: 2, value: 1 } })))
        .toBe('[ERROR] Message { some: { index: 2; value: 1 } }');
  });
  it('does not format properties with symbol keys', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', { [Symbol.for('skip')]: 99 })))
        .toBe('[ERROR] Message');
  });
  it('does not format properties with `undefined` values', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', { 'skip it': undefined })))
        .toBe('[ERROR] Message');
  });
  it('does not format properties without representation', () => {

    format = zlogFormatter({ value: v => v === 'skip' ? null : v });

    expect(format(zlogMessage(ZLogLevel.Error, 'Message', { 'skip it': 'skip', other: 2 })))
        .toBe('[ERROR] Message { other: 2 }');
  });
  it('formats message extra', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', ['more', { to: 'report' }])))
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
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', [[1, 'or', 2]])))
        .toBe('[ERROR] Message ([1, "or", 2])');
  });
  it('formats empty array parameter', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', [[]])))
        .toBe('[ERROR] Message ([])');
  });
  it('does not format parameter without representation', () => {

    format = zlogFormatter({ value: v => v === 'skip' ? null : v });

    expect(format(zlogMessage(ZLogLevel.Error, ['skip', 'do-not-skip'])))
        .toBe(`[ERROR] (do-not-skip)`);
  });
  it('does not format parameters without representations', () => {

    format = zlogFormatter({ value: () => null });

    expect(format(zlogMessage(ZLogLevel.Error, ['skip', 'skip-too'])))
        .toBe(`[ERROR]`);
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
  it('does not format error without representation', () => {

    format = zlogFormatter({ value: () => null });

    expect(format({
      level: ZLogLevel.Error,
      text: '',
      error: 'Error!',
      details: {},
      extra: [],
    })).toBe(`[ERROR]`);
  });
});
