import { describe, expect, it } from '@jest/globals';
import type { ZLogField } from '../formats';
import { textZLogFormatter } from '../formats';
import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import type { DecoratorZLogFieldFormat } from './decorator.field';
import { decoratorZLogField } from './decorator.field';

describe('decoratorZLogField', () => {
  it('prefixes non-empty field value', () => {
    expect(format({ prefix: '(' }, line => line.write('!'))).toBe('(!');
  });
  it('appends suffix to non-empty field value', () => {
    expect(format({ suffix: ')' }, line => line.write('!'))).toBe('!)');
  });
  it('does not write empty field value', () => {
    expect(format({ prefix: '(', suffix: ')' }, line => line.write(''))).toBeUndefined();
  });
  it('replaces empty field value', () => {
    expect(format({ prefix: '(', suffix: ')', empty: '-' }, line => line.write(''))).toBe('-');
  });
  it('does not replace absent field value', () => {
    expect(format({ prefix: '(', suffix: ')', empty: '-' }, () => void 0)).toBeUndefined();
  });

  function format(format: DecoratorZLogFieldFormat, field: ZLogField): string | undefined {
    return textZLogFormatter({ fields: [decoratorZLogField(format, field)] })(zlogMessage(ZLogLevel.Info));
  }
});
