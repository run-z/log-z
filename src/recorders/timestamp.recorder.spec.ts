import { createZLogger } from '../create-logger';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogger } from '../logger';
import { timestampZLogRecorder } from './timestamp.recorder';

describe('timestampZLogRecorder', () => {

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
    logger = createZLogger({ level: 0, recorder: timestampZLogRecorder(target) });
  });

  it('records timestamp to messages', () => {
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
    logger = createZLogger({ level: 0, recorder: timestampZLogRecorder({ key: 'ts' }, target) });

    logger.log(ZLogLevel.Error, 'Message');
    expect(target.record).toHaveBeenCalledWith(zlogMessage(
        ZLogLevel.Error,
        'Message',
        { ts: expect.anything() },
    ));
  });
  it('generates timestamp by custom method', () => {
    logger = createZLogger({
      level: 0,
      recorder: timestampZLogRecorder({ timestamp: ({ details: { timestamp } }) => +timestamp + 1, key: 'ts' }, target),
    });

    logger.log(ZLogLevel.Error, 'Message', { timestamp: 12 });
    expect(target.record).toHaveBeenCalledWith(zlogMessage(
        ZLogLevel.Error,
        'Message',
        { timestamp: 12, ts: 13 },
    ));
  });

  describe('whenLogged', () => {
    it('calls target', async () => {

      const whenLogged = logger.whenLogged();

      expect(await whenLogged).toBe(true);
      expect(target.whenLogged).toHaveLastReturnedWith(whenLogged);
    });
  });

  describe('end', () => {
    it('calls target', async () => {

      const whenStopped = logger.end();

      expect(await whenStopped).toBeUndefined();
      expect(target.end).toHaveLastReturnedWith(whenStopped);
    });
  });
});
