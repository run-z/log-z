import { ZLogField } from '../formats/log-field.js';
import { ZLogWriter } from '../formats/log-writer.js';

/**
 * Log field decorator format.
 */
export interface DecoratorZLogFieldFormat {
  /**
   * A prefix to add to field value.
   *
   * Applied only when non-empty field value is written.
   */
  readonly prefix?: string | undefined;

  /**
   * A suffix to add to field value.
   *
   * Applied only when non-empty field value is written.
   */
  readonly suffix?: string | undefined;

  /**
   * Empty value placeholder.
   *
   * It is written instead of empty value.
   *
   * Nothing is written instead of empty value by default.
   */
  readonly empty?: string | undefined;
}

/**
 * Creates a log field that decorates another field value.
 *
 * Decoration is not applied if target field did not write any value.
 *
 * @param format - Decoration format.
 * @param field - Log field to decorate.
 *
 * @returns
 */
export function decoratorZLogField<TWriter extends ZLogWriter>(
  format: DecoratorZLogFieldFormat,
  field: ZLogField<TWriter>,
): ZLogField<TWriter> {
  return writer => {
    const value = writer.format(field);

    if (value) {
      const { prefix, suffix } = format;

      if (prefix) {
        writer.write(prefix);
      }
      writer.write(value);
      if (suffix) {
        writer.write(suffix);
      }
    } else if (value != null) {
      const { empty } = format;

      if (empty) {
        writer.write(empty);
      }
    }
  };
}
