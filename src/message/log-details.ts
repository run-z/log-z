import { logDefer } from '@proc7ts/logger';
import type { DueLogZ } from './due-log';
import type { ZLoggable } from './loggable';

/**
 * Log message details map.
 *
 * The keys of this map are specific to application or log recorder implementation.
 */
export type ZLogDetails = { readonly [key in string | symbol]?: unknown };

export namespace ZLogDetails {

  /**
   * Mutable log message details map.
   */
  export type Mutable = { [key in string | symbol]?: unknown };

}

/**
 * Creates a {@link ZLoggable loggable} value {@link zlogMessage treated} as additional {@link ZLogMessage.details
 * message details}.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to any {@link ZLogger.log logger method} to add
 * details to logged message.
 *
 * @param details - Either log message details to add, or a function constructing ones. The function will be called to
 * {@link zlogExpand expand} the log message details. It may return `null`/`undefined` to expand to nothing.
 *
 * @returns Loggable value.
 */
export function zlogDetails(details: ZLogDetails | ((this: void) => ZLogDetails | null | undefined)): ZLoggable {
  if (typeof details === 'function') {
    return logDefer(() => ({
      toLog(_target: DueLogZ) {

        const expanded = details();

        return expanded ? zlogDetails(expanded) : [];
      },
    }));
  }

  return {
    toLog(target: DueLogZ) {

      const { zDetails } = target;

      if (!zDetails) {
        return details;
      }

      assignZLogDetails(zDetails, details);

      return [];
    },
  };
}

/**
 * Creates a deep clone of log message details.
 *
 * @param details - Log message details to clone.
 *
 * @returns Mutable `details` clone.
 */
export function cloneZLogDetails(details: ZLogDetails): ZLogDetails.Mutable {

  const clone: ZLogDetails.Mutable = {};

  for (const key of Reflect.ownKeys(details)) {

    const value = details[key as string];

    if (value !== undefined) {
      if (isZLogDetails(value)) {
        clone[key as string] = cloneZLogDetails(value);
      } else {
        clone[key as string] = value;
      }
    }
  }

  return clone;
}

/**
 * Assigns log message details to `target` ones.
 *
 * @param target - Mutable map to assign `details` to.
 * @param details - Log message details to assign.
 *
 * @returns `target` details instance.
 */
export function assignZLogDetails(target: ZLogDetails.Mutable, details: ZLogDetails): ZLogDetails.Mutable {
  for (const key of Reflect.ownKeys(details)) {

    const oldValue = target[key as string];
    const newValue = details[key as string];

    if (newValue !== undefined) {
      if (!isZLogDetails(newValue) || !isZLogDetails(oldValue)) {
        target[key as string] = newValue;
      } else {
        assignZLogDetails(oldValue, newValue);
      }
    }
  }

  return target;
}

function isZLogDetails(value: unknown): value is ZLogDetails {
  return typeof value === 'object' && !!value && (value.constructor === Object || value.constructor == null);
}
