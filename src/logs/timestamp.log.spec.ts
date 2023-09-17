import { beforeEach, describe, expect, it } from '@jest/globals';
import { ZLogLevel } from '../levels/log-level.js';
import { ZLogRecorder } from '../log-recorder.js';
import { logZ } from '../log.js';
import { ZLogger } from '../logger.js';
import { zlogDetails } from '../messages/log-details.js';
import { zlogMessage } from '../messages/log-message.js';
import { logZToMock } from '../spec/mock-log-recorder.js';
import { logZTimestamp } from './timestamp.log.js';

describe('logZTimestamp', () => {
  let target: ZLogRecorder;

  beforeEach(() => {
    target = logZToMock();
  });

  let logger: ZLogger;

  beforeEach(() => {
    logger = logZ({ atLeast: 0, by: logZTimestamp(target) });
  });

  it('adds timestamp to messages', () => {
    logger.log(ZLogLevel.Error, 'Message');
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ timestamp: expect.anything() })),
    );
  });
  it('does not override existing timestamp', () => {
    logger.log(ZLogLevel.Error, 'Message', zlogDetails({ timestamp: 'set' }));
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ timestamp: 'set' })),
    );
  });
  it('records timestamp to custom details property', () => {
    logger = logZ({ atLeast: 0, by: logZTimestamp({ to: 'ts' }, target) });

    logger.log(ZLogLevel.Error, 'Message');
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ ts: expect.anything() })),
    );
  });
  it('generates timestamp by custom method', () => {
    logger = logZ({
      atLeast: 0,
      by: logZTimestamp(
        {
          to: 'ts',
          get: ({ details: { timestamp } }) => +(timestamp as number | string) + 1,
        },
        target,
      ),
    });

    logger.log(ZLogLevel.Error, 'Message', zlogDetails({ timestamp: 12 }));
    expect(target.record).toHaveBeenCalledWith(
      zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ timestamp: 12, ts: 13 })),
    );
  });
});
