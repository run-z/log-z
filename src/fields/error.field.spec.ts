import { beforeEach, describe, expect, it } from '@jest/globals';
import type { ZLogFormatter } from '../formats';
import { textZLogFormatter } from '../formats';
import { zlogERROR } from '../level';
import { zlogDetails } from '../message';

describe('errorZLogField', () => {

  let format: ZLogFormatter;

  beforeEach(() => {
    format = textZLogFormatter();
  });

  it('formats error', () => {

    const error = new Error();

    expect(format(zlogERROR('Message', error))).toBe(`[ERROR] Message ${error.stack}`);
  });
  it('formats error without stack', () => {

    const error = new Error();

    error.stack = undefined;

    expect(format(zlogERROR('Message', error))).toBe(`[ERROR] Message ${String(error)}`);
  });
  it('formats `error` detail', () => {
    expect(format(zlogERROR(zlogDetails({ error: 'Error!' }), 'Message'))).toBe(`[ERROR] Message [Error: "Error!"]`);
  });
});
