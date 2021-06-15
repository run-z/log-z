import type { ZLogField, ZLogWriter } from '../formats';

/**
 * Log field decorator format.
 */
export interface DecoratorZLogFieldFormat {

  /**
   * A prefix to add to field value.
   *
   * Applied only when non-empty field value is written.
   */
  readonly prefix?: string;

  /**
   * A suffix to add to field value.
   *
   * Applied only when non-empty field value is written.
   */
  readonly suffix?: string;

  /**
   * Empty value placeholder.
   *
   * It is written instead of empty value.
   *
   * Nothing is written instead of empty value by default.
   */
  readonly empty?: string;

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
