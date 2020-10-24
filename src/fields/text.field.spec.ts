import { textZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { zlofText } from './text.field';

describe('zlofText', () => {
  it('writes message text by default', () => {

    const format = textZLogFormatter();

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('[INFO ] Message');
  });
  it('formats message text', () => {

    const format = textZLogFormatter({ fields: [zlofText(text => text + '!')] });

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('Message!');
  });
});
