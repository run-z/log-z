import { describe, expect, it } from '@jest/globals';
import { textZLogFormatter } from '../formats/text.format.js';
import { zlogMessage } from '../messages/log-message.js';
import { ZLogLevel } from '../levels/log-level.js';
import { messageZLogField } from './message.field.js';

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
