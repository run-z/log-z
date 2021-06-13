import { describe, expect, it } from '@jest/globals';
import { textZLogFormatter } from '../formats';
import { ZLogLevel } from '../level';
import { zlogMessage } from '../message';
import { messageZLogField } from './message.field';

describe('messageZLogField', () => {
  it('writes message text by default', () => {

    const format = textZLogFormatter();

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('[INFO ] Message');
  });
  it('formats message text', () => {

    const format = textZLogFormatter({ fields: [messageZLogField(line => line.join(' ') + '!')] });

    expect(format(zlogMessage(ZLogLevel.Info, 'Message'))).toBe('Message!');
  });
});
