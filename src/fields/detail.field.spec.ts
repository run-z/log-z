import { describe, expect, it } from '@jest/globals';
import { textZLogFormatter } from '../formats';
import { zlogERROR } from '../levels';
import { zlogDetails } from '../log-details';
import { decoratorZLogField } from './decorator.field';
import { detailZLogField } from './detail.field';
import { detailsZLogField } from './details.field';

describe('detailZLogField', () => {
  describe('with empty path', () => {
    it('extracts message details', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField(),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ some: 'value' }))))
          .toBe('{ some: "value" }');
    });
    it('extracts empty message details', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField(),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField),
        ],
      });

      expect(format(zlogERROR()))
          .toBe('{}');
    });
    it('applies custom format', () => {
      const format = textZLogFormatter({
        fields: [
          detailZLogField((line, { first, second }: { first: string; second: string }) => {
            line.write(`${first}-${second}`);
          }),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ first: '<', second: '>' }))))
          .toBe('<->');
    });
  });

  describe('with path', () => {
    it('extracts detail', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField('path'),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField()),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ path: 2, value: 1 }))))
          .toBe('2 { value: 1 }');
    });
    it('does not log missing detail', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField('path'),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField()),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ other: 2, value: 1 }))))
          .toBe('{ other: 2, value: 1 }');
    });
    it('extracts nested detail', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField('some', 'path'),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField()),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ some: { path: 2, value: 1 } }))))
          .toBe('2 { some: { value: 1 } }');
    });
    it('does not log missing nested detail', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField('some', 'path'),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField()),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ some: { other: 2, value: 1 } }))))
          .toBe('{ some: { other: 2, value: 1 } }');
    });
    it('does not log the detail nested inside `null`', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField('some', 'path'),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField()),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ some: null }))))
          .toBe('{ some: null }');
    });
    it('does not log the detail nested inside non-object', () => {

      const format = textZLogFormatter({
        fields: [
          detailZLogField('some', 'path'),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField()),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ some: 'some' }))))
          .toBe('{ some: "some" }');
    });
    it('applies custom format', () => {
      const format = textZLogFormatter({
        fields: [
          detailZLogField(
              'some',
              (line, { first, second }: { first: string; second: string }) => {
                line.write(`${first}-${second}`);
              },
          ),
          ' ',
          decoratorZLogField({ prefix: '{ ', suffix: ' }' }, detailsZLogField()),
        ],
      });

      expect(format(zlogERROR(zlogDetails({ some: { first: '<', second: '>' } }))))
          .toBe('<->');
    });
  });
});
