import { logZ } from './log';
import { ZLogLevel } from './log-level';
import { zlogMessage } from './log-message';
import type { ZLogRecorder } from './log-recorder';
import type { ZLogger } from './logger';

describe('logZ', () => {

  let logger: ZLogger;
  let recorder: jest.Mocked<ZLogRecorder>;

  beforeEach(() => {
    recorder = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };
    logger = logZ({ by: recorder });
  });

  it('logs info message by default', async () => {
    logger.info('TEST');
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'TEST'));
    expect(await logger.whenLogged()).toBe(true);
  });
  it('does not log debug message by default', async () => {
    logger.debug('TEST');
    expect(recorder.record).not.toHaveBeenCalled();
    expect(await logger.whenLogged()).toBe(false);
  });
  it('logs debug message when allowed', async () => {
    logger = logZ({ atLeast: ZLogLevel.Debug, by: recorder });
    logger.debug('TEST');
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Debug, 'TEST'));
    expect(await logger.whenLogged()).toBe(true);
  });

});
