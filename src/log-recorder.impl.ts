/**
 * @internal
 */
export function alreadyLogged(): Promise<boolean> {
  return Promise.resolve(true);
}

/**
 * @internal
 */
export function notLogged(): Promise<boolean> {
  return Promise.resolve(false);
}

/**
 * @internal
 */
export function alreadyEnded(): Promise<void> {
  return Promise.resolve();
}
