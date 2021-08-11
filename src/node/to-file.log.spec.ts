import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { promises as fs } from 'fs';
import * as path from 'path';
import { logZBy } from '../log-by';
import type { ZLogger } from '../logger';
import type { ZLogMessage } from '../message';
import { zlogDetails } from '../message';
import { FileZLogSpec, logZToFile } from './to-file.log';

describe('logZToFile', () => {

  let testRootDir: string;
  let logDir: string;
  let logFile: string;

  beforeEach(() => {
    testRootDir = path.join('target', 'test');
    logDir = path.join(testRootDir, 'test-logs');
    logFile = path.join(logDir, 'test.log');
  });
  afterEach(async () => {
    try {
      await fs.rmdir(testRootDir, { recursive: true });
    } catch (e) {
      // Throws in Node 16+.
      // Replace with `fs.rm` for Node 14+.
    }
  });

  it('logs to file', async () => {

    const logger = newLogger();

    logger.info('Message 1');
    logger.info('Message 2');

    expect(await logger.whenLogged('all')).toBe(true);

    await logger.end();

    const log = (await fs.readFile(logFile)).toString();

    expect(log).toContain('[INFO ] Message 1');
    expect(log).toContain('[INFO ] Message 2');
  });
  it('logs to dedicated file', async () => {

    const logger = newLogger(({ details: { log } }) => path.join(logDir, log as string));

    logger.info('Message 1', zlogDetails({ log: '1.log' }));

    expect(await logger.whenLogged()).toBe(true);

    logger.info('Message 2', zlogDetails({ log: '2.log' }));

    expect(await logger.whenLogged('all')).toBe(true);

    await logger.end();

    const log1 = (await fs.readFile(path.join(logDir, '1.log'))).toString();
    const log2 = (await fs.readFile(path.join(logDir, '2.log'))).toString();

    expect(log1).toContain('[INFO ] Message 1');
    expect(log2).toContain('[INFO ] Message 2');
  });
  it('logs to latest file', async () => {

    const logger = newLogger(({ details: { log } }) => path.join(logDir, log as string));

    logger.info('Message 1', zlogDetails({ log: '1.log' }));
    logger.info('Message 2', zlogDetails({ log: '2.log' }));

    expect(await logger.whenLogged('all')).toBe(true);

    await logger.end();

    const log = (await fs.readFile(path.join(logDir, '2.log'))).toString();

    expect(log).toContain('[INFO ] Message 1');
    expect(log).toContain('[INFO ] Message 2');
  });

  describe('end', () => {
    it('ends logger before logging anything', async () => {

      const logger = newLogger();

      expect(await logger.whenLogged('all')).toBe(true);
      await logger.end();
    });
  });

  function newLogger(
      to: string | ((message: ZLogMessage) => string) = logFile,
      how?: FileZLogSpec,
  ): ZLogger {
    return logZBy(logZToFile(to, how));
  }

});
