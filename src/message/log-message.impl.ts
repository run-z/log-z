import type { ZLogMessage } from './log-message';

/**
 * @internal
 */
export function zlogMessage$hasText({ text, error }: ZLogMessage): boolean | string {
  return text && !(error instanceof Error && text === error.message);
}
