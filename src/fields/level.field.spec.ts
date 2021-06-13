import { describe, expect, it } from '@jest/globals';
import { textZLogFormatter } from '../formats';
import { ZLogLevel, zlogLevelName } from '../level';
import { zlogMessage } from '../message';
import { levelZLogField } from './level.field';

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
