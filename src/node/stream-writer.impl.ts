import { lazyValue, noop, valueProvider } from '@proc7ts/primitives';
import type { Writable } from 'stream';

/**
 * @internal
 */
export type WhenWritten = () => Promise<boolean>;

/**
 * @internal
 */
export function streamWriter(to: Writable): (data: any) => WhenWritten {

  let drainPromise: Promise<boolean> | undefined;
  const whenDrained: WhenWritten = () => {
    if (!drainPromise) {
      // Register listener once
      drainPromise = new Promise<boolean>(resolve => to.once(
          'drain',
          () => {
            drainPromise = undefined;
            resolve(true);
          },
      ));
    }
    return drainPromise;
  };
  let reportError: (error: any) => void = noop;

  to.on('error', error => reportError(error));

  return data => {

    let whenWritten: WhenWritten;
    let setWhenWritten = (newWhenWritten: WhenWritten): void => {
      whenWritten = newWhenWritten;
    };

    // Global stream errors reported by the most recent write.
    const onWriteError = reportError = error => {
      setWhenWritten(() => Promise.reject(error));
      setWhenWritten = noop; // Errors have higher priority.
    };

    if (to.write(data, error => {
      if (error) {
        onWriteError(error);
      }
    })) {
      setWhenWritten(alreadyWritten);
    } else {
      setWhenWritten(valueProvider(whenDrained()));
    }

    return lazyValue(() => whenWritten()); // Always report the promise once reported
  };
}

/**
 * @internal
 */
export function alreadyWritten(): Promise<true> {
  return Promise.resolve(true);
}

/**
 * @internal
 */
export function notWritten(): Promise<false> {
  return Promise.resolve(false);
}
