import { describe, expect, it } from '@jest/globals';
import { textZLogFormatter } from '../formats/text.format.js';
import { zlogMessage } from '../messages/log-message.js';
import { ZLogLevel, zlogLevelName } from '../levels/log-level.js';
import { levelZLogField } from './level.field.js';

describe('levelZLogField', () => {
  it('writes log level by default', () => {
    const format = textZLogFormatter();

    expect(format(zlogMessage(ZLogLevel.Info))).toBe('[INFO ]');
  });
  it('formats log level', () => {
    const format = textZLogFormatter({ fields: [levelZLogField(zlogLevelName)] });

    expect(format(zlogMessage(ZLogLevel.Warning, 'Message'))).toBe('Warning');
  });
});
