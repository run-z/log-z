import { jest } from '@jest/globals';
import type { Mock } from 'jest-mock';
import type { ZLogRecorder } from '../log-recorder';

export type MockZLogRecorder = {
  [K in keyof ZLogRecorder]: Mock<ReturnType<ZLogRecorder[K]>, Parameters<ZLogRecorder[K]>>
};

export function logZToMock(): MockZLogRecorder {
  return {
    record: jest.fn(),
    whenLogged: jest.fn(() => Promise.resolve(true)),
    end: jest.fn(() => Promise.resolve()),
  };
}
