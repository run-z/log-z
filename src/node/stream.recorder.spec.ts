import { Writable, WritableOptions } from 'stream';
import { zlogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { RecordingZLogger } from '../recorders';
import { streamZLogRecorder } from './stream.recorder';

describe('streamZLogRecorder', () => {

  it('formats message', async () => {

    const out = new TestWritable();
    const logger = new RecordingZLogger(streamZLogRecorder(out));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual(['[INFO ] TEST', '[ERROR] ERROR']);
  });
  it('formats message with custom format', async () => {

    const out = new TestWritable();
    const logger = new RecordingZLogger(streamZLogRecorder(
        out,
        {
          format: { text: ({ text }) => `${text}.` },
        },
    ));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual(['[INFO ] TEST.', '[ERROR] ERROR.']);
  });
  it('formats message by custom formatter', async () => {

    const out = new TestWritable();
    const logger = new RecordingZLogger(streamZLogRecorder(
        out,
        {
          format: zlogFormatter({ text: ({ text }) => `${text}.` }),
        },
    ));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual(['[INFO ] TEST.', '[ERROR] ERROR.']);
  });
  it('writes message as is in object mode', async () => {

    const out = new TestWritable({ objectMode: true });
    const logger = new RecordingZLogger(streamZLogRecorder(out));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual([
      zlogMessage(ZLogLevel.Info, 'TEST'),
      zlogMessage(ZLogLevel.Error, 'ERROR'),
    ]);
  });
  it('writes errors to dedicated stream', async () => {

    const out = new TestWritable({ objectMode: true });
    const errors = new TestWritable({ objectMode: true });
    const logger = new RecordingZLogger(streamZLogRecorder(out, { errors }));

    logger.info('TEST');
    logger.error('ERROR');

    expect(await logger.whenLogged()).toBe(true);

    expect(out.chunks).toEqual([
      zlogMessage(ZLogLevel.Info, 'TEST'),
    ]);
    expect(errors.chunks).toEqual([
      zlogMessage(ZLogLevel.Error, 'ERROR'),
    ]);
  });
  it('stops logging when stream finished', async () => {

    const out = new TestWritable({ objectMode: true });
    const logger = new RecordingZLogger(streamZLogRecorder(out));

    await new Promise(resolve => {
      out.end(resolve);
    });

    logger.info('TEST');
    expect(await logger.whenLogged()).toBe(false);
    expect(await logger.end()).toBeUndefined();
  });
  it('does not log if the stream is ended already', async () => {

    const out = new TestWritable({ objectMode: true });

    out.end();

    const logger = new RecordingZLogger(streamZLogRecorder(out));

    logger.info('TEST');
    expect(await logger.whenLogged()).toBe(false);
    expect(await logger.end()).toBeUndefined();
  });

  describe('ends', () => {
    it('stops logging', async () => {

      const out = new TestWritable({ objectMode: true });
      const logger = new RecordingZLogger(streamZLogRecorder(out));

      await logger.end();

      logger.info('TEST');

      expect(await logger.whenLogged()).toBe(false);
      expect(out.chunks).toHaveLength(0);
      expect(out.writableFinished).toBe(true);
    });
    it('stops logging to errors', async () => {

      const out = new TestWritable({ objectMode: true });
      const errors = new TestWritable({ objectMode: false });
      const logger = new RecordingZLogger(streamZLogRecorder(out, { errors }));

      await logger.end();

      logger.info('TEST');

      const whenInfoLogger = logger.whenLogged();

      logger.error('ERROR');

      const whenErrorLogged = logger.whenLogged();

      expect(await whenInfoLogger).toBe(false);
      expect(await whenErrorLogged).toBe(false);
      expect(out.chunks).toHaveLength(0);
      expect(errors.chunks).toHaveLength(0);
      expect(out.writableFinished).toBe(true);
      expect(errors.writableFinished).toBe(true);
    });
    it('does nothing after the second time', async () => {

      const out = new TestWritable({ objectMode: true });
      const logger = new RecordingZLogger(streamZLogRecorder(out));
      const whenEnded = logger.end();

      expect(logger.end()).toBe(whenEnded);
      expect(await whenEnded).toBeUndefined();
    });
  });

});

class TestWritable extends Writable {

  readonly chunks: any[] = [];

  constructor(opts: WritableOptions = {}) {
    super({ decodeStrings: false, ...opts });
  }

  _write(
      chunk: any,
      _encoding: string,
      callback: (error?: (Error | null)) => void,
  ): void {
    this.chunks.push(chunk);
    callback();
  }

}
