import { logZ } from '../log';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogger } from '../logger';
import { logZTimestamp } from './timestamp.log';

describe('logZTimestamp', () => {

  let target: jest.Mocked<ZLogRecorder>;

  beforeEach(() => {
    target = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };
  });

  let logger: ZLogger;

  beforeEach(() => {
    logger = logZ({ atLeast: 0, by: logZTimestamp(target) });
  });

  it('adds timestamp to messages', () => {
    logger.log(ZLogLevel.Error, 'Message');
    expect(target.record).toHaveBeenCalledWith(zlogMessage(
        ZLogLevel.Error,
        'Message',
        { timestamp: expect.anything() },
    ));
  });
  it('does not override existing timestamp', () => {
    logger.log(ZLogLevel.Error, 'Message', { timestamp: 'set' });
    expect(target.record).toHaveBeenCalledWith(zlogMessage(
        ZLogLevel.Error,
        'Message',
        { timestamp: 'set' },
    ));
  });
  it('records timestamp to custom details property', () => {
    logger = logZ({ atLeast: 0, by: logZTimestamp({ to: 'ts' }, target) });

    logger.log(ZLogLevel.Error, 'Message');
    expect(target.record).toHaveBeenCalledWith(zlogMessage(
        ZLogLevel.Error,
        'Message',
        { ts: expect.anything() },
    ));
  });
  it('generates timestamp by custom method', () => {
    logger = logZ({
      atLeast: 0,
      by: logZTimestamp(
          {
            to: 'ts',
            get: ({ details: { timestamp } }) => +timestamp + 1,
          },
          target,
      ),
    });

    logger.log(ZLogLevel.Error, 'Message', { timestamp: 12 });
    expect(target.record).toHaveBeenCalledWith(zlogMessage(
        ZLogLevel.Error,
        'Message',
        { timestamp: 12, ts: 13 },
    ));
  });
});
