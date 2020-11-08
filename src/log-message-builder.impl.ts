import type { ZLogLevel } from './log-level';
import type { ZLogMessage } from './log-message';
import { isZLogMessageData, ZLogMessageData, ZLogMessageData__symbol } from './log-message-data.impl';

/**
 * @internal
 */
export class ZLogMessageBuilder {

  protected text = '';
  protected hasText = false;
  protected error: any | undefined;
  protected hasError = false;
  protected details: Record<string | symbol, any> = {};
  protected readonly extra: any[] = [];

  constructor(private readonly level: ZLogLevel) {
  }

  setError(newError: any, newText?: string): void {
    if (this.hasError) {
      this.extra.push(newError);
      return;
    }

    this.hasError = true;
    this.error = newError;

    if (!this.hasText) {
      if (newText !== undefined) {
        this.text = newText;
      } else if (newError instanceof Error) {
        this.text = newError.message;
      }
    }
  }

  addAll(args: readonly any[]): void {
    args.forEach(arg => this.add(arg));
  }

  add(param: any): void {
    if (typeof param === 'string') {
      if (!this.hasText) {
        this.text = param;
        this.hasText = true;
      } else if (param !== this.text) {
        this.extra.push(param);
      }
      return;
    }

    if (param && typeof param === 'object') {
      if (isZLogMessageData(param)) {
        switch (param[ZLogMessageData__symbol]) {
        case 'error':
          this.setError((param as ZLogMessageData.Error).error);
          return;
        case 'details':
          Object.assign(this.details, (param as ZLogMessageData.Details).details);
          return;
        case 'extra':
          this.addExtra((param as ZLogMessageData.Extra).extra);
          return;
        }
      }
    }

    if (this.addOther(param)) {
      return;
    }

    if (param instanceof Error) {
      this.setError(param, param.message);
      return;
    }

    this.extra.push(param);
  }

  protected addExtra(extra: any[]): void {
    this.extra.push(...extra);
  }

  protected addOther(_param: any): boolean {
    return false;
  }

  message(): ZLogMessage {
    return {
      level: this.level,
      text: this.text,
      error: this.error,
      details: this.details,
      extra: this.extra,
    };
  }

}


