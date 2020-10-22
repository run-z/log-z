import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { defaultZLogFormat } from './default.format';

describe('defaultZLogFormat', () => {
  it('allows to copy its methods', () => {

    const format = { details: defaultZLogFormat.details };

    expect(format.details(zlogMessage(ZLogLevel.Error, 'Message', { foo: 'bar' }))).toBe('{ foo: "bar" }');
  });
});
