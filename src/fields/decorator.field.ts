/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import type { ZLogField, ZLogLine } from '../formats';

/**
 * Log field decorator format.
 */
export interface DecoratorZLogFormat {

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
 * @param format  Decoration format.
 * @param field  Log field to decorate.
 *
 * @returns
 */
export function zlofDecorator<TLine extends ZLogLine>(
    format: DecoratorZLogFormat,
    field: ZLogField<TLine>,
): ZLogField<TLine> {
  return line => {

    const value = line.format(field);

    if (value) {

      const { prefix, suffix } = format;

      if (prefix) {
        line.write(prefix);
      }
      line.write(value);
      if (suffix) {
        line.write(suffix);
      }
    } else if (value != null) {

      const { empty } = format;

      if (empty) {
        line.write(empty);
      }
    }
  };
}
