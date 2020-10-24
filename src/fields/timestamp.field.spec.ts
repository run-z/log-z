import { textZLogFormatter, ZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogDetails, zlogMessage } from '../log-message';
import { zlofTimestamp } from './timestamp.field';

describe('zlofTimestamp', () => {

  let format: ZLogFormatter;

  beforeEach(() => {
    format = textZLogFormatter();
  });

  it('recognizes `Date` timestamp', () => {

    const date = new Date();

    expect(format(zlogMessage(
        ZLogLevel.Info,
        zlogDetails({ timestamp: date }),
    ))).toBe(`${date.toISOString()} [INFO ]`);
  });
  it('recognizes `number` timestamp', () => {

    const date = new Date();

    expect(format(zlogMessage(
        ZLogLevel.Info,
        zlogDetails({ timestamp: date.getTime() }),
    ))).toBe(`${date.toISOString()} [INFO ]`);
  });
  it('recognizes `string` timestamp', () => {

    const date = new Date().toUTCString();

    expect(format(zlogMessage(
        ZLogLevel.Info,
        zlogDetails({ timestamp: date }),
    ))).toBe(`${date} [INFO ]`);
  });
  it('does not write missing timestamp', () => {
    expect(format(zlogMessage(ZLogLevel.Info))).toBe(`[INFO ]`);
  });

  describe('format', () => {
    it('accepts formatter function', () => {
      format = textZLogFormatter({ fields: [zlofTimestamp({ format: n => String(n) })] });

      const date = new Date();

      expect(format(zlogMessage(
          ZLogLevel.Info,
          zlogDetails({ timestamp: date }),
      ))).toBe(`${date.getTime()}`);
    });
    it('accepts `Intl.DateTimeFormat` function', () => {

      const dtFormat = new Intl.DateTimeFormat();

      format = textZLogFormatter({ fields: [zlofTimestamp({ format: dtFormat })] });

      const date = new Date();

      expect(format(zlogMessage(
          ZLogLevel.Info,
          zlogDetails({ timestamp: date }),
      ))).toBe(`${dtFormat.format(date)}`);
    });
  });

  describe('key', () => {
    it('extracts timestamp from custom property', () => {
      format = textZLogFormatter({ fields: [zlofTimestamp({ key: 'date' })] });

      const date = new Date();

      expect(format(zlogMessage(
          ZLogLevel.Info,
          zlogDetails({ date }),
      ))).toBe(`${date.toISOString()}`);
    });
  });
});
