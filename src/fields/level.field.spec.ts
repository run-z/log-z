import { textZLogFormatter } from '../formats';
import { ZLogLevel, zlogLevelName } from '../log-level';
import { zlogMessage } from '../log-message';
import { zlofLevel } from './level.field';

describe('zlofLevel', () => {
  it('writes log level by default', () => {

    const format = textZLogFormatter();

    expect(format(zlogMessage(ZLogLevel.Info))).toBe('[INFO ]');
  });
  it('formats log level', () => {

    const format = textZLogFormatter({ fields: [zlofLevel(zlogLevelName)] });

    expect(format(zlogMessage(ZLogLevel.Warning, 'Message'))).toBe('Warning');
  });
});
