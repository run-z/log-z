import { createZLogger } from './create-logger';
import type { ZLogRecorder } from './log-recorder';
import type { ZLogger } from './logger';

describe('ZLogger', () => {

  let recorder: jest.Mocked<ZLogRecorder>;
  let logger: ZLogger;

  beforeEach(() => {
    recorder = {
      record: jest.fn(),
      whenLogged: jest.fn(() => Promise.resolve(true)),
      discard: jest.fn(() => Promise.resolve()),
    };
    logger = createZLogger({ recorder, level: 0 });
  });

  describe('finish', () => {
    it('awaits for message logging', async () => {

      let logLast!: (written: boolean) => void;
      const whenLogged = new Promise<boolean>(resolve => logLast = resolve);

      recorder.whenLogged.mockImplementation(() => whenLogged);

      let finished = false;
      const whenFinished = logger.finish().then(() => finished = true);

      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();

      expect(finished).toBe(false);
      expect(recorder.discard).not.toHaveBeenCalled();

      logLast(true);
      await whenFinished;
      expect(finished).toBe(true);
      expect(recorder.discard).toHaveBeenCalledTimes(1);
    });
    it('finishes when logging failed', async () => {

      const logError = new Error('Not logged');
      const discardError = new Error('Not discarded');

      recorder.whenLogged.mockImplementation(() => Promise.reject(logError));
      recorder.discard.mockImplementation(() => Promise.reject(discardError));

      expect(await logger.finish().catch(e => e)).toBe(logError);
      expect(recorder.discard).toHaveBeenCalledTimes(1);
    });
  });
});
