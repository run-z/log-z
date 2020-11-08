import { logZBy } from '../log-by';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogger } from '../logger';
import { logZWhenLevel } from './when-level.log';

describe('logZWhenLevel', () => {

  let logger: ZLogger;
  let recorder: jest.Mocked<ZLogRecorder>;

  beforeEach(() => {
    recorder = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };
    logger = logZBy(logZWhenLevel(recorder));
  });

  it('logs info message by default', async () => {
    logger.info('TEST');
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'TEST'));
    expect(await logger.whenLogged()).toBe(true);
    expect(await logger.whenLogged('all')).toBe(true);
  });
  it('does not log debug message by default', async () => {
    logger.debug('TEST');
    expect(recorder.record).not.toHaveBeenCalled();
    expect(await logger.whenLogged()).toBe(false);
    expect(await logger.whenLogged('all')).toBe(false);
  });
  it('does not log debug message by default after info one', async () => {
    logger.info('INFO');
    expect(await logger.whenLogged()).toBe(true);
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'INFO'));

    logger.debug('DEBUG');
    expect(recorder.record).toHaveBeenCalledTimes(1);
    expect(await logger.whenLogged()).toBe(false);
    expect(await logger.whenLogged('all')).toBe(false);
  });
  it('logs debug message when allowed', async () => {
    logger = logZBy(logZWhenLevel(ZLogLevel.Trace, recorder));
    logger.debug('TEST');
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Debug, 'TEST'));
    expect(await logger.whenLogged()).toBe(true);
    expect(await logger.whenLogged('all')).toBe(true);
  });
  it('returns the target log when everything logged', () => {
    expect(logZWhenLevel(0, recorder)).toBe(recorder);
  });
  it('logs messages with log level satisfying the condition', async () => {

    logger = logZBy(logZWhenLevel(level => level < ZLogLevel.Error, recorder));

    logger.debug('TEST');
    logger.error('ERROR');

    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Debug, 'TEST'));
    expect(recorder.record).not.toHaveBeenCalledWith(zlogMessage(ZLogLevel.Error, 'ERROR'));
    expect(await logger.whenLogged()).toBe(false);
    expect(await logger.whenLogged('all')).toBe(false);
  });
  it('logs not matching messages by another recorder', async () => {

    const other: jest.Mocked<ZLogRecorder> = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };

    logger = logZBy(logZWhenLevel(recorder, other));

    logger.debug('TEST');
    expect(other.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Debug, 'TEST'));
    expect(await logger.whenLogged()).toBe(true);
    expect(await logger.whenLogged('all')).toBe(true);

    logger.error('ERROR');
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Error, 'ERROR'));
    expect(await logger.whenLogged()).toBe(true);
    expect(await logger.whenLogged('all')).toBe(true);

    await logger.end();

    expect(recorder.end).toHaveBeenCalledWith();
    expect(other.end).toHaveBeenCalledWith();
  });
  it('creates new logger if everything logged, but not matching messages directed to another logger', async () => {

    const other: jest.Mocked<ZLogRecorder> = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };

    logger = logZBy(logZWhenLevel(0, recorder, other));

    logger.debug('TEST');
    logger.error('ERROR');

    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Debug, 'TEST'));
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Error, 'ERROR'));
    expect(await logger.whenLogged()).toBe(true);
    expect(await logger.whenLogged('all')).toBe(true);
    expect(await logger.whenLogged()).toBe(true);
    expect(await logger.whenLogged('all')).toBe(true);
    expect(other.record).not.toHaveBeenCalled();

    await logger.end();

    expect(recorder.end).toHaveBeenCalledWith();
    expect(other.end).toHaveBeenCalledWith();
  });
});
