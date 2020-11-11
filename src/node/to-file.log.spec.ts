import { readFile, remove } from 'fs-extra';
import * as path from 'path';
import { logZBy } from '../log-by';
import { zlogDetails } from '../log-details';
import type { ZLogMessage } from '../log-message';
import type { ZLogger } from '../logger';
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
    await remove(testRootDir);
  });

  it('logs to file', async () => {

    const logger = newLogger();

    logger.info('Message 1');
    logger.info('Message 2');

    expect(await logger.whenLogged('all')).toBe(true);

    await logger.end();

    const log = (await readFile(logFile)).toString();

    expect(log).toContain('[INFO ] Message 1');
    expect(log).toContain('[INFO ] Message 2');
  });
  it('logs to dedicated file', async () => {

    const logger = newLogger(({ details: { log } }) => path.join(logDir, log));

    logger.info('Message 1', zlogDetails({ log: '1.log' }));

    expect(await logger.whenLogged()).toBe(true);

    logger.info('Message 2', zlogDetails({ log: '2.log' }));

    expect(await logger.whenLogged('all')).toBe(true);

    await logger.end();

    const log1 = (await readFile(path.join(logDir, '1.log'))).toString();
    const log2 = (await readFile(path.join(logDir, '2.log'))).toString();

    expect(log1).toContain('[INFO ] Message 1');
    expect(log2).toContain('[INFO ] Message 2');
  });
  it('logs to latest file', async () => {

    const logger = newLogger(({ details: { log } }) => path.join(logDir, log));

    logger.info('Message 1', zlogDetails({ log: '1.log' }));
    logger.info('Message 2', zlogDetails({ log: '2.log' }));

    expect(await logger.whenLogged('all')).toBe(true);

    await logger.end();

    const log = (await readFile(path.join(logDir, '2.log'))).toString();

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
