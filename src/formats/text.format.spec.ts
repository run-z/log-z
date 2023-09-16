import { describe, expect, it } from '@jest/globals';
import { detailsZLogField } from '../fields/details.field.js';
import { zlogINFO } from '../levels/levels.js';
import { ZLogLevel } from '../levels/log-level.js';
import { zlogDetails } from '../messages/log-details.js';
import { zlogMessage } from '../messages/log-message.js';
import type { ZLogField } from './log-field.js';
import { TextZLogFormat, textZLogFormatter } from './text.format.js';

describe('textZLogFormatter', () => {
  describe('delimiters', () => {
    it('adds the only delimiter', () => {
      expect(format({ fields: ['prefix-'] })).toBe('prefix-');
    });

    it('delimits fields', () => {
      expect(
        format({ fields: [writer => writer.write('1'), '|', writer => writer.write('2')] }),
      ).toBe('1|2');
    });
    it('delimits fields multiple times', () => {
      expect(
        format({
          fields: [writer => writer.write('1'), '-', '|', '-', writer => writer.write('2')],
        }),
      ).toBe('1-|-2');
    });
    it('does not delimit not written fields', () => {
      expect(
        format({
          fields: [
            writer => writer.write('1'),
            '|',
            () => void 0,
            '|',
            writer => writer.write('3'),
          ],
        }),
      ).toBe('1|3');
    });
    it('does not delimit empty fields', () => {
      expect(
        format({
          fields: [
            writer => writer.write('1'),
            '|',
            writer => writer.write(''),
            '|',
            writer => writer.write('3'),
          ],
        }),
      ).toBe('1|3');
    });

    it('adds prefix', () => {
      expect(format({ fields: ['prefix-', writer => writer.write('field')] })).toBe('prefix-field');
    });
    it('adds prefix before not written field', () => {
      expect(format({ fields: ['prefix-', () => void 0, writer => writer.write('field')] })).toBe(
        'prefix-field',
      );
    });
    it('adds prefix before empty field', () => {
      expect(
        format({
          fields: ['prefix-', writer => writer.write(''), writer => writer.write('field')],
        }),
      ).toBe('prefix-field');
    });
    it('adds prefix if no fields written', () => {
      expect(format({ fields: ['prefix-', () => void 0] })).toBe('prefix-');
    });
    it('adds prefix if all fields are empty', () => {
      expect(format({ fields: ['prefix-', writer => writer.write('')] })).toBe('prefix-');
    });

    it('adds suffix', () => {
      expect(format({ fields: [writer => writer.write('field'), '-suffix'] })).toBe('field-suffix');
    });
    it('adds suffix after not written field', () => {
      expect(format({ fields: [writer => writer.write('field'), () => void 0, '-suffix'] })).toBe(
        'field-suffix',
      );
    });
    it('adds suffix after empty field', () => {
      expect(
        format({
          fields: [writer => writer.write('field'), writer => writer.write(''), '-suffix'],
        }),
      ).toBe('field-suffix');
    });
    it('adds suffix if no fields written', () => {
      expect(format({ fields: [() => void 0, '-suffix'] })).toBe('-suffix');
    });
    it('adds suffix if all fields are empty', () => {
      expect(format({ fields: [writer => writer.write(''), '-suffix'] })).toBe('-suffix');
    });

    it('adds prefix and suffix no other fields', () => {
      expect(format({ fields: ['prefix-', '-suffix'] })).toBe('prefix--suffix');
    });
    it('adds prefix and suffix if no fields written', () => {
      expect(format({ fields: ['prefix-', () => void 0, '-suffix'] })).toBe('prefix--suffix');
    });
    it('adds prefix and suffix if all fields are empty', () => {
      expect(format({ fields: ['prefix-', writer => writer.write(''), '-suffix'] })).toBe(
        'prefix--suffix',
      );
    });
  });

  describe('format', () => {
    it('allows to change original message', () => {
      const field: ZLogField = writer => {
        writer.write(
          writer.format(w => {
            w.write(`meta(${w.extractDetail('meta')})`);
          }) || '',
        );
      };
      const format = textZLogFormatter({
        fields: [field, ' ', detailsZLogField()],
      });

      expect(format(zlogINFO(zlogDetails({ meta: 'test' })))).toBe('meta(test)');
    });
    it('does not change original message when formats another one', () => {
      const field: ZLogField = writer => {
        writer.write(
          writer.format(
            w => {
              w.write(`meta(${w.extractDetail('meta')})`);
            },
            { ...writer.message },
          ) || '',
        );
      };
      const format = textZLogFormatter({
        fields: [field, ' ', detailsZLogField()],
      });

      expect(format(zlogINFO(zlogDetails({ meta: 'test' })))).toBe('meta(test) meta: "test"');
    });
  });

  describe('ordering', () => {
    it('changes order', () => {
      expect(
        format({
          fields: ['(prefix)', 1, '(foo)', 2, '(bar)', '(baz)', 0, '(field)'],
        }),
      ).toBe('(prefix)(field)(foo)(bar)(baz)');
    });
  });

  function format(
    spec: TextZLogFormat | undefined,
    level = ZLogLevel.Error,
    ...args: unknown[]
  ): string | undefined {
    return textZLogFormatter(spec)(zlogMessage(level, ...args));
  }
});
