import { ZLogLevel } from '../log-level';
import { zlogMessage } from '../log-message';
import { TextZLogFormat, textZLogFormatter } from './text.format';

describe('textZLogFormatter', () => {
  describe('delimiters', () => {
    it('adds the only delimiter', () => {

      expect(format({ fields: ['prefix-'] })).toBe('prefix-');
    });

    it('delimits fields', () => {
      expect(format({ fields: [line => line.write('1'), '|', line => line.write('2')] })).toBe('1|2');
    });
    it('delimits fields multiple times', () => {
      expect(format({ fields: [line => line.write('1'), '-', '|', '-', line => line.write('2')] })).toBe('1-|-2');
    });
    it('does not delimit not written fields', () => {
      expect(format({
        fields: [
          line => line.write('1'),
          '|',
          () => void 0,
          '|',
          line => line.write('3'),
        ],
      })).toBe('1|3');
    });
    it('does not delimit empty fields', () => {
      expect(format({
        fields: [
          line => line.write('1'),
          '|',
          line => line.write(''),
          '|',
          line => line.write('3'),
        ],
      })).toBe('1|3');
    });

    it('adds prefix', () => {
      expect(format({ fields: ['prefix-', line => line.write('field')] })).toBe('prefix-field');
    });
    it('adds prefix before not written field', () => {
      expect(format({ fields: ['prefix-', () => void 0, line => line.write('field')] })).toBe('prefix-field');
    });
    it('adds prefix before empty field', () => {
      expect(format({ fields: ['prefix-', line => line.write(''), line => line.write('field')] })).toBe('prefix-field');
    });
    it('adds prefix if no fields written', () => {
      expect(format({ fields: ['prefix-', () => void 0] })).toBe('prefix-');
    });
    it('adds prefix if all fields are empty', () => {
      expect(format({ fields: ['prefix-', line => line.write('')] })).toBe('prefix-');
    });

    it('adds suffix', () => {
      expect(format({ fields: [line => line.write('field'), '-suffix'] })).toBe('field-suffix');
    });
    it('adds suffix after not written field', () => {
      expect(format({ fields: [line => line.write('field'), () => void 0, '-suffix'] })).toBe('field-suffix');
    });
    it('adds suffix after empty field', () => {
      expect(format({ fields: [line => line.write('field'), line => line.write(''), '-suffix'] })).toBe('field-suffix');
    });
    it('adds suffix if no fields written', () => {
      expect(format({ fields: [() => void 0, '-suffix'] })).toBe('-suffix');
    });
    it('adds suffix if all fields are empty', () => {
      expect(format({ fields: [line => line.write(''), '-suffix'] })).toBe('-suffix');
    });

    it('adds prefix and suffix no other fields', () => {
      expect(format({ fields: ['prefix-', '-suffix'] })).toBe('prefix--suffix');
    });
    it('adds prefix and suffix if no fields written', () => {
      expect(format({ fields: ['prefix-', () => void 0, '-suffix'] })).toBe('prefix--suffix');
    });
    it('adds prefix and suffix if all fields are empty', () => {
      expect(format({ fields: ['prefix-', line => line.write(''), '-suffix'] })).toBe('prefix--suffix');
    });
  });

  describe('ordering', () => {
    it('changes order', () => {
      expect(format({
        fields: ['(prefix)', 1, '(foo)', 2, '(bar)', '(baz)', 0, '(field)'],
      })).toBe('(prefix)(field)(foo)(bar)(baz)');
    });
  });

  function format(
      spec: TextZLogFormat | undefined,
      level = ZLogLevel.Error,
      ...args: any[]
  ): string | undefined {
    return textZLogFormatter(spec)(zlogMessage(level, ...args));
  }
});
