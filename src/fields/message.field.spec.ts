import { textZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { zlofMessage } from './message.field';

describe('zlofMessage', () => {
  it('writes message text by default', () => {

    const format = textZLogFormatter();

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('[INFO ] Message');
  });
  it('formats message text', () => {

    const format = textZLogFormatter({ fields: [zlofMessage(text => text + '!')] });

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('Message!');
  });
});
