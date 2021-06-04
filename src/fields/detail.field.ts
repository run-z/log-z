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

export function detailZLogField<T>(
    write: (this: void, line: ZLogLine, value: T) => void,
    ...path: (keyof ZLogDetails)[]
): ZLogField;

export function detailZLogField<T>(
    writeOrKey: ((this: void, line: ZLogLine, value: T) => void) | keyof ZLogDetails,
    ...path: (keyof ZLogDetails)[]
): ZLogField {

  let write: (this: void, line: ZLogLine, value: T) => void;

  if (typeof writeOrKey === 'function') {
    write = writeOrKey;
  } else {
    write = detailZLogField$write;
    path = writeOrKey != null ? [writeOrKey, ...path] : path;
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
