import { jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import type { ZLogRecorder } from '../log-recorder.js';

export type MockZLogRecorder = {
  [K in keyof ZLogRecorder]: Mock<ZLogRecorder[K]>;
};

export function logZToMock(): MockZLogRecorder {
  return {
    record: jest.fn(),
    whenLogged: jest.fn(() => Promise.resolve(true)),
    end: jest.fn(() => Promise.resolve()),
  };
}
