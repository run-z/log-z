import { textZLogFormatter } from '../formats';
import { ZLogLevel, zlogLevelName } from '../log-level';
import { zlogMessage } from '../log-message';
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
