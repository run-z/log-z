import { beforeEach, describe, expect, it } from '@jest/globals';
import { textZLogFormatter, ZLogFormatter } from '../formats';
import { ZLogLevel } from '../level';
import { zlogDetails, zlogMessage } from '../message';

describe('detailsZLogField', () => {

  let format: ZLogFormatter;

  beforeEach(() => {
    format = textZLogFormatter();
  });

  it('formats message details', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ some: 'value' }))))
        .toBe('[ERROR] Message { some: "value" }');
  });
  it('formats object within message details', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ some: { index: 2, value: 1 } }))))
        .toBe('[ERROR] Message { some: { index: 2, value: 1 } }');
  });
  it('formats empty object within message details', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ some: {} }))))
        .toBe('[ERROR] Message { some: {} }');
  });
  it('formats array within message details', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ some: [1, 2, 3] }))))
        .toBe('[ERROR] Message { some: [1, 2, 3] }');
  });
  it('formats empty array within message details', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ some: [] }))))
        .toBe('[ERROR] Message { some: [] }');
  });
  it('formats properties with symbol keys', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ [Symbol.for('test')]: 99 }))))
        .toBe('[ERROR] Message { Symbol(test): 99 }');
  });
  it('does not format properties with `undefined` values', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ 'skip it': undefined }))))
        .toBe('[ERROR] Message');
  });
  it('does not format nested properties with `undefined` values', () => {
    expect(format(zlogMessage(ZLogLevel.Error, 'Message', zlogDetails({ value: { 'skip it': undefined } }))))
        .toBe('[ERROR] Message { value: {} }');
  });
});
