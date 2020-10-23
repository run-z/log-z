import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { ZLogFormatter } from './log-formatter';
import { textZLogFormatter } from './text.format';

describe('textZLogFormatter', () => {
  describe('by default', () => {

    let format: ZLogFormatter;

    beforeEach(() => {
      format = textZLogFormatter();
    });

    it('formats log level', () => {
      expect(format(zlogMessage(ZLogLevel.Warning))).toBe('[WARN ] ');
    });
  });
});
