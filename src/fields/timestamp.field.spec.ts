import { beforeEach, describe, expect, it } from '@jest/globals';
import { textZLogFormatter, ZLogFormatter } from '../formats';
import { zlogDetails } from '../log-details';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { timestampZLogField } from './timestamp.field';

describe('timestampZLogField', () => {

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
      format = textZLogFormatter({ fields: [timestampZLogField({ format: n => String(n) })] });

      const date = new Date();

      expect(format(zlogMessage(
          ZLogLevel.Info,
          zlogDetails({ timestamp: date }),
      ))).toBe(`${date.getTime()}`);
    });
    it('accepts `Intl.DateTimeFormat` function', () => {

      const dtFormat = new Intl.DateTimeFormat();

      format = textZLogFormatter({ fields: [timestampZLogField({ format: dtFormat })] });

      const date = new Date();

      expect(format(zlogMessage(
          ZLogLevel.Info,
          zlogDetails({ timestamp: date }),
      ))).toBe(`${dtFormat.format(date)}`);
    });
  });

  describe('key', () => {
    it('extracts timestamp from custom property', () => {
      format = textZLogFormatter({ fields: [timestampZLogField({ key: 'date' })] });

      const date = new Date();

      expect(format(zlogMessage(
          ZLogLevel.Info,
          zlogDetails({ date }),
      ))).toBe(`${date.toISOString()}`);
    });
  });
});
