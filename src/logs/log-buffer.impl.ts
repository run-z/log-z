import { PromiseResolver } from '@proc7ts/async';
import { noop } from '@proc7ts/primitives';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogMessage } from '../message';
import type { ZLogBuffer } from './log-buffer';
import type { ZLogBufferSpec } from './to-buffer.log';

/**
 * @internal
 */
export class ZLogBuffer$ {

  readonly #limit: number;
  readonly #entries: (ZLogBuffer.Entry | undefined)[] = [];
  #head = 0;
  #tail = 0;
  #size = 0;
  readonly #contents: ZLogBuffer.Contents;
  #firstAdded: () => void = noop;

  constructor(limit: number) {
    this.#limit = limit;
    this.#entries.length = limit;
    this.#contents = {
      [Symbol.iterator]: () => this.#iterate(),
      fillRatio: () => (this.#size ? this.#size / this.#limit : 0),
    };
  }

  *#iterate(): IterableIterator<ZLogBuffer.Entry> {
    for (let i = 0; i < this.#size; ++i) {
      const offset = this.#head + i;
      const overflow = offset - this.#limit;
      const entry = this.#entries[overflow < 0 ? offset : overflow];

      if (entry != null) {
        yield entry;
      }
    }
  }

  next(atOnce: number): Promise<[ZLogBuffer.Entry, ...ZLogBuffer.Entry[]]> {
    if (this.#size) {
      return Promise.resolve(this.batch(atOnce));
    }

    return new Promise(resolve => {
      this.#firstAdded = () => {
        resolve(this.batch(atOnce));
        this.#firstAdded = noop;
      };
    });
  }

  add(
    message: ZLogMessage,
    onRecord: Exclude<ZLogBufferSpec['onRecord'], undefined>,
  ): ZLogBuffer.Entry {
    let index = -1;

    const whenLogged = new PromiseResolver<boolean>();

    let drop: (entry: ZLogBuffer.Entry) => void;
    let recordTo = (entry: ZLogBuffer.Entry, target: ZLogRecorder): void => {
      drop = noop;
      recordTo = noop;
      this.remove(entry, index);
      target.record(message);
      whenLogged.resolve(target.whenLogged());
    };

    drop = (entry: ZLogBuffer.Entry): void => {
      drop = noop;
      recordTo = noop;
      this.remove(entry, index);
      whenLogged.resolve(false);
    };

    const entry: ZLogBuffer.Entry = {
      message,

      drop() {
        drop(this);
      },

      recordTo(target) {
        recordTo(this, target);
      },

      whenLogged() {
        return whenLogged.whenDone();
      },
    };

    onRecord(entry, this.#contents);

    if (drop !== noop) {
      // New entry is not dropped.
      // Add it to buffer.
      index = this.#tail;
      if (++this.#tail >= this.#limit) {
        this.#tail = 0;
      }

      const prev = this.#entries[index];

      if (prev) {
        // The buffer is full.
        // Drop the oldest entry.
        prev.drop();
      }

      this.#entries[index] = entry;
      if (!this.#size++) {
        this.#firstAdded();
      }
    }

    return entry;
  }

  clear(): void {
    for (const entry of [...this.#iterate()]) {
      entry.drop();
    }
  }

  whenAllLogged(): Promise<unknown> {
    return Promise.all([...this.#iterate()].map(async entry => await entry.whenLogged()));
  }

  private batch(size: number): [ZLogBuffer.Entry, ...ZLogBuffer.Entry[]] {
    const batch: ZLogBuffer.Entry[] = [];

    for (const entry of this.#iterate()) {
      if (size-- > 0) {
        batch.push(entry);
      }
    }

    return batch as [ZLogBuffer.Entry, ...ZLogBuffer.Entry[]];
  }

  private remove(entry: ZLogBuffer.Entry, index: number): void {
    const found = this.#entries[index];

    if (found !== entry) {
      return;
    }

    this.#entries[index] = undefined;

    // The head should never be empty, unless the buffer is.
    do {
      if (index === this.#head) {
        --this.#size;
        if (++this.#head >= this.#limit) {
          this.#head = 0;
        }
      }
    } while (this.#size && this.#entries[index]);
  }

}
