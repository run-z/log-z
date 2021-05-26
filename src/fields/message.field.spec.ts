import { describe, expect, it } from '@jest/globals';
import { textZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { messageZLogField } from './message.field';

describe('messageZLogField', () => {
  it('writes message text by default', () => {

    const format = textZLogFormatter();

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('[INFO ] Message');
  });
  it('formats message text', () => {

    const format = textZLogFormatter({ fields: [messageZLogField(text => text + '!')] });

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('Message!');
  });
});
