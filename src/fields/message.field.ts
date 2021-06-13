import type { ZLogField } from '../formats';

/**
 * Creates a log field containing a {@link ZLogMessage.line log line}.
 *
 * By default, writes message line as space-separated string representations of values.
 *
 * @param format - Message text format. A function accepting message line and returning it formatted.
 *
 * @returns Log line field.
 */
export function messageZLogField(
    format: (this: void, line: readonly unknown[]) => string = messageZLogField$default,
): ZLogField {
  return writer => writer.write(format(writer.message.line));
}

function messageZLogField$default(line: readonly unknown[]): string {
  return line.join(' ');
}
