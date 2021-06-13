import { beforeEach, describe, expect, it } from '@jest/globals';
import { ZLogLevel } from './level';
import { logZ } from './log';
import type { ZLogRecorder } from './log-recorder';
import type { ZLogger } from './logger';
import { zlogMessage } from './message';
import { logZToMock } from './spec';

describe('logZ', () => {

  let logger: ZLogger;
  let recorder: ZLogRecorder;

  beforeEach(() => {
    recorder = logZToMock();
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
