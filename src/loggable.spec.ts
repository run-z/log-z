import { zlogINFO } from './levels';
import { zlogDetails, zlogError, zlogExtra } from './log-message';
import { zlogDefer, zlogExpand } from './loggable';

describe('zlogExpand', () => {
  it('expands message text', () => {
    expect(zlogExpand(zlogINFO(zlogDefer(() => 'Message'))))
        .toEqual(zlogINFO('Message'));
  });
  it('expands string to message extra if message is present already', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDefer(() => 'Extra'))))
        .toEqual(zlogINFO('Message', zlogExtra('Extra')));
  });
  it('ignores expanded string equal to message text', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDefer(() => 'Message'))))
        .toEqual(zlogINFO('Message'));
  });
  it('ignores expanded `null`', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDefer(() => null))))
        .toEqual(zlogINFO('Message'));
  });
  it('expands message details', () => {
    expect(zlogExpand(zlogINFO('Message', zlogDetails({ test1: 1 }), zlogDefer(() => zlogDetails({ test2: 2 })))))
        .toEqual(zlogINFO('Message', zlogDetails({ test1: 1, test2: 2 })));
  });
  it('expands message extra', () => {
    expect(zlogExpand(zlogINFO('Message', 1, zlogDefer(() => 2))))
        .toEqual(zlogINFO('Message', zlogExtra(1, 2)));
  });
  it('expands message extra array', () => {
    expect(zlogExpand(zlogINFO('Message', 1, zlogDefer(() => [2, 3]))))
        .toEqual(zlogINFO('Message', zlogExtra(1, 2, 3)));
  });
  it('recursively expands loggable', () => {
    expect(zlogExpand(zlogINFO('Message', 1, zlogDefer(() => ({ toLog: () => [2, 3] })))))
        .toEqual(zlogINFO('Message', zlogExtra(1, 2, 3)));
  });
  it('recursively expands deferred value', () => {
    expect(zlogExpand(zlogINFO('Message', 1, zlogDefer(() => zlogDefer(() => [2, 3])))))
        .toEqual(zlogINFO('Message', zlogExtra(1, 2, 3)));
  });
  it('preserves message error', () => {

    const error = new Error('Test');

    expect(zlogExpand(zlogINFO(error))).toEqual(zlogINFO(zlogError(error)));
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
