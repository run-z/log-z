import type { ZLogMessage } from './log-message';
import { zlogExtra } from './log-message';
import { ZLogMessageBuilder } from './log-message-builder.impl';

/**
 * Arbitrary loggable value.
 */
export interface ZLoggable {

  /**
   * Constructs a representation of this value suitable for logging.
   *
   * The log representation can be anything. It is up to the logger implementation to interpret it.
   * The {@link zlogExpand} function is used by default to expand loggable objects.
   *
   * @returns Loggable value representation.
   */
  toLog(): unknown;

}

/**
 * Builds a special value {@link zlogMessage treated} as {@link ZLoggable loggable} parameter.
 *
 * The resulting value can be passed to {@link zlogMessage} function or to {@link ZLogger.log logger method} to add
 * it to logged message. It will be {@link zlogExpand expanded} only when the message is actually logged.
 *
 * @param toLog - Builds a loggable value representation.
 */
export function zlogDefer(toLog: (this: void) => any): unknown {
  return zlogExtra({ toLog });
}

/**
 * @internal
 */
class ZLogMessageExpander extends ZLogMessageBuilder {

  constructor(message: ZLogMessage) {
    super(message.level);

    const { text, error } = message;

    this.text = text;
    this.hasText = !!text;

    this.details = { ...message.details };

    if (isLoggable(error)) {
      this.add(error);
    } else {
      this.error = error;
      this.hasError = error != null;
    }
  }

  add(param: unknown): void {
    if (isLoggable(param)) {
      this.addLoggable(param);
    } else {
      this.extra.push(param);
    }
  }

  private addLoggable(loggable: ZLoggable): void {

    const value = loggable.toLog();

    if (value != null) {
      super.add(value);
    }
  }

  protected addExtra(extra: unknown[]): void {
    extra.forEach(e => this.add(e));
  }

  protected addOther(param: unknown): boolean {
    if (isLoggable(param)) {
      this.addLoggable(param);
      return true;
    }

    if (Array.isArray(param)) {
      param.forEach(p => super.add(p));
      return true;
    }

    return false;
  }

}

/**
 * Expands a log message by replacing its {@link ZLogMessage.error error} and {@link ZLogMessage.extra uninterpreted
 * parameters} with their loggable representations.
 *
 * If error or parameter is a {@link ZLoggable loggable value}, then extracts its {@link ZLoggable.toLog loggable
 * representation}, and processes as following:
 *
 * 1. Ignores `null` and `undefined`.
 * 2. Ignores a string equal to the {@link ZLogMessage.text message text}.
 * 3. Treats a special value created by one of {@link zlogDetails}, {@link zlogError}, or {@link zlogExtra} accordingly.
 * 4. Processes a {@link ZLoggable loggable value} recursively.
 * 5. Treats a string as a {@link ZLogMessage.text message text}, unless the message has it already, in which case it
 *    is treated as {@link ZLogMessage.extra uninterpreted parameter}.
 * 6. Treats an `Error` instance as a {@link ZLogMessage.error message error}, unless the message has it already,
 *    in which case it is treated as {@link ZLogMessage.extra uninterpreted parameter}.
 * 7. Processes each array element recursively.
 * 8. Treats everything else as {@link ZLogMessage.extra uninterpreted parameter}.
 *
 * @param message - A message to expand.
 *
 * @returns Expanded log message.
 */
export function zlogExpand(message: ZLogMessage): ZLogMessage {

  const expander = new ZLogMessageExpander(message);

  expander.addAll(message.extra);

  return expander.message();
}

/**
 * @internal
 */
function isLoggable(value: unknown): value is ZLoggable {
  return !!value && typeof value === 'object' && typeof (value as { toLog?: unknown }).toLog === 'function';
}
