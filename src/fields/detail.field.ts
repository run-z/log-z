import type { ZLogField, ZLogLine } from '../formats';
import type { ZLogDetails } from '../log-details';

/**
 * Creates a log field for {@link ZLogLine.extractDetail extracted} message detail.
 *
 * Writes the value with {@link ZLogLine.writeValue} method. Writes nothing if the target detail is undefined.
 *
 * @param path - A path to details property to extract. Empty path means extracting of all details.
 *
 * @returns Log detail field.
 */
export function detailZLogField(...path: (keyof ZLogDetails)[]): ZLogField;

/**
 * Creates a log field for {@link ZLogLine.extractDetail extracted} message detail in specific format.
 *
 * Writes the value with {@link ZLogLine.writeValue} method. Writes nothing if the target detail is undefined.
 *
 * @param pathAndWrite - A path to details property to extract and value writer function. Empty path means extracting
 * of all details.
 *
 * @returns Log detail field.
 */
export function detailZLogField<T>(...pathAndWrite: [
  ...path: (keyof ZLogDetails)[],
  write: (this: void, line: ZLogLine, value: T) => void,
]): ZLogField;

export function detailZLogField<T>(...pathAndWrite: [
  ...path: (keyof ZLogDetails)[],
  ...write: [((this: void, line: ZLogLine, value: T) => void)?],
]): ZLogField {

  let path: (keyof ZLogDetails)[];
  let write: (this: void, line: ZLogLine, value: T) => void;
  const writeOrKey = pathAndWrite[pathAndWrite.length - 1];

  if (typeof writeOrKey === 'function') {
    path = pathAndWrite.slice(0, pathAndWrite.length - 1) as (keyof ZLogDetails)[];
    write = writeOrKey;
  } else {
    path = pathAndWrite as (keyof ZLogDetails)[];
    write = detailZLogField$write;
  }

  return line => {

    const value = line.extractDetail(...path);

    if (value !== undefined) {
      write(line, value as T);
    }
  };
}

function detailZLogField$write(line: ZLogLine, value: unknown): void {
  line.writeValue(value);
}
