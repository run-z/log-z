import type { Loggable } from '@proc7ts/logger';
import type { DueLogZ } from './due-log';

/**
 * Arbitrary loggable value.
 */
export interface ZLoggable extends Loggable {

  toLog(target: DueLogZ): void | unknown;

}
