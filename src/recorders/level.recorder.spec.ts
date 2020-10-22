import { createZLogger } from '../create-logger';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogger } from '../logger';

describe('levelZLogRecorder', () => {

  let logger: ZLogger;
  let recorder: jest.Mocked<ZLogRecorder>;

  beforeEach(() => {
    recorder = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };
    logger = createZLogger({ recorder });
  });

  it('logs info messages by default', async () => {
    logger.info('TEST');
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'TEST'));
    expect(await logger.whenLogged()).toBe(true);
  });
  it('does not log debug messages by default', async () => {
    logger.debug('TEST');
    expect(recorder.record).not.toHaveBeenCalled();
    expect(await logger.whenLogged()).toBe(false);
  });
  it('does not log debug messages by default after info on', async () => {
    logger.info('INFO');
    expect(await logger.whenLogged()).toBe(true);
    expect(recorder.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Info, 'INFO'));

    logger.debug('DEBUG');
    expect(recorder.record).toHaveBeenCalledTimes(1);
    expect(await logger.whenLogged()).toBe(false);
  });
});
