import { describe, expect, it } from '@jest/globals';
import { zlogINFO } from '../level';
import { zlogDefer } from './log-defer';
import { zlogDetails } from './log-details';
import { zlogExpand } from './log-expand';

describe('zlogExpand', () => {
  it('expands message text', () => {
    expect(zlogExpand(zlogINFO(zlogDefer(() => 'Message'))))
        .toEqual(zlogINFO('Message'));
  });
  it('ignores expanded empty array', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDefer(() => []))))
        .toEqual(zlogINFO('Message'));
  });
  it('expands message details', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDetails({ test1: 1 }), zlogDefer(() => zlogDetails({ test2: 2 })))))
        .toEqual(zlogINFO('Message', zlogDetails({ test1: 1, test2: 2 })));
  });
  it('expands message details in shorter form', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDetails({ test1: 1 }), zlogDetails(() => ({ test2: 2 })))))
        .toEqual(zlogINFO('Message', zlogDetails({ test1: 1, test2: 2 })));
  });
  it('does not expand absent message details', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDetails({ test1: 1 }), zlogDetails(() => null))))
        .toEqual(zlogINFO('Message', zlogDetails({ test1: 1 })));
  });
  it('recursively expands loggable', () => {
    expect(zlogExpand(zlogINFO('Message', 1, zlogDefer(() => ({ toLog: () => [2, 3] })))))
        .toEqual(zlogINFO('Message', 1, 2, 3));
  });
  it('recursively expands deferred value', () => {
    expect(zlogExpand(zlogINFO('Message', 1, zlogDefer(() => zlogDefer(() => [2, 3])))))
        .toEqual(zlogINFO('Message', 1, 2, 3));
  });
  it('preserves message error', () => {

    const error = new Error('Test');

    expect(zlogExpand(zlogINFO(error))).toEqual(zlogINFO(error));
  });
  it('expands message error', () => {

    class TestError extends Error {

      toLog(): unknown {
        return zlogDetails({ error: this.message + '!' });
      }

    }

    const error = new TestError('Test');

    expect(zlogExpand(zlogINFO('Message', error))).toEqual(zlogINFO('Message', zlogDetails({ error: 'Test!' })));
  });
});
