import type { ZLogDetails } from './log-message';

/**
 * @internal
 */
export const ZLogMessageData__symbol = (/*#__PURE__*/ Symbol('zlog-message-data'));

/**
 * @internal
 */
export type ZLogMessageData =
    | ZLogMessageData.Details
    | ZLogMessageData.Error
    | ZLogMessageData.Extra;

/**
 * @internal
 */
export namespace ZLogMessageData {

  export interface Details {
    readonly [ZLogMessageData__symbol]: 'details';
    readonly details: ZLogDetails;
  }

  export interface Error {
    readonly [ZLogMessageData__symbol]: 'error';
    readonly error: any;
  }

  export interface Extra {
    readonly [ZLogMessageData__symbol]: 'extra';
    readonly extra: any[];
  }

}

/**
 * @internal
 */
export function isZLogMessageData(value: any): value is ZLogMessageData {
  return !!value[ZLogMessageData__symbol];
}
