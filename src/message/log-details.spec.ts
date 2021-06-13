import { describe, expect, it } from '@jest/globals';
import { dueLog } from '@proc7ts/logger';
import { ZLogLevel } from '../level';
import { zlogDetails } from './log-details';
import { zlogMessage } from './log-message';

describe('zlogDetails', () => {
  it('logged as details object outside `log-z`', () => {
    expect(dueLog({ line: [zlogDetails({ foo: 'bar' })] }).line).toEqual([{ foo: 'bar' }]);
  });
  it('treated as message details', () => {
    expect(zlogMessage(
        ZLogLevel.Debug,
        zlogDetails({ test: 'value' }),
        zlogDetails({ test2: 'value2' }),
        'msg',
    )).toEqual({
      level: ZLogLevel.Debug,
      text: 'msg',
      details: {
        test: 'value',
        test2: 'value2',
      },
      extra: [],
    });
  });
});
