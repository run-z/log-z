import { beforeEach, describe, expect, it } from '@jest/globals';
import { ZLogFormatter } from '../formats/log-formatter.js';
import { textZLogFormatter } from '../formats/text.format.js';
import { zlogERROR } from '../levels/levels.js';
import { zlogDetails } from '../messages/log-details.js';

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
    expect(format(zlogERROR(zlogDetails({ error: 'Error!' }), 'Message'))).toBe(
      `[ERROR] Message [Error: "Error!"]`,
    );
  });
});
