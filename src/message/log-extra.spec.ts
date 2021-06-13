import { describe, expect, it } from '@jest/globals';
import { ZLogLevel } from '../level';
import { zlogExtra } from './log-extra';
import { zlogMessage } from './log-message';

describe('logExtra', () => {
  it('treated as message extra', () => {
    expect(zlogMessage(ZLogLevel.Error, zlogExtra('text', 2))).toEqual({
      level: ZLogLevel.Error,
      text: '',
      details: {},
      extra: ['text', 2],
    });
  });
});
