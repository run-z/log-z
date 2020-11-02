import { lazyValue, noop, valueProvider } from '@proc7ts/primitives';
import type { Writable } from 'stream';
import { alreadyLogged } from '../log-recorder.impl';

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

  return data => {

    let whenWritten: WhenWritten;
    let setWhenWritten = (newWhenWritten: WhenWritten): void => {
      whenWritten = newWhenWritten;
    };

    // Global stream errors reported by the most recent write.
    if (to.write(data, error => {
      if (error) {
        setWhenWritten(() => Promise.reject(error));
        setWhenWritten = noop; // Errors have higher priority.
      }
    })) {
      setWhenWritten(alreadyLogged);
    } else {
      setWhenWritten(valueProvider(whenDrained()));
    }

    return lazyValue(() => whenWritten()); // Always report the promise once reported
  };
}
