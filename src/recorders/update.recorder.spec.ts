import { createZLogger } from '../create-logger';
import { ZLogLevel } from '../log-level';
import type { ZLogMessage } from '../log-message';
import { zlogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogger } from '../logger';
import { updateZLogRecorder } from './update.recorder';

describe('updateZLogRecorder', () => {

  let target: jest.Mocked<ZLogRecorder>;

  beforeEach(() => {
    target = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      end: jest.fn(() => Promise.resolve()),
    };
  });

  let update: jest.Mock<ZLogMessage, [ZLogMessage]>;
  let logger: ZLogger;

  beforeEach(() => {
    update = jest.fn(message => message);
    logger = createZLogger({ level: 0, recorder: updateZLogRecorder(update, target) });
  });

  it('records updated message', () => {
    update.mockImplementation(message => ({ ...message, details: { ...message.details, update: true } }));

    logger.error('Message');
    expect(target.record).toHaveBeenCalledWith(zlogMessage(ZLogLevel.Error, 'Message', { update: true }));
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
