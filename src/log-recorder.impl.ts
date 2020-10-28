/**
 * @internal
 */
export function alreadyLogged(): Promise<true> {
  return Promise.resolve(true);
}

/**
 * @internal
 */
export function notLogged(): Promise<false> {
  return Promise.resolve(false);
}

/**
 * @internal
 */
export function alreadyEnded(): Promise<void> {
  return Promise.resolve();
}
