import { beforeEach, describe, expect, it } from '@jest/globals';
import { ZLogLevel } from './levels/log-level.js';
import type { ZLogRecorder } from './log-recorder.js';
import { logZ } from './log.js';
import type { ZLogger } from './logger.js';
import { zlogMessage } from './messages/log-message.js';
import { logZToMock } from './spec/mock-log-recorder.js';

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
