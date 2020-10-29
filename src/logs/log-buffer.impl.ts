import { isPresent, newPromiseResolver, noop } from '@proc7ts/primitives';
import type { PushIterable } from '@proc7ts/push-iterator';
import { filterIndexed, IndexedItemList, itsEach, itsEvery, PushIterator__symbol } from '@proc7ts/push-iterator';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogBuffer } from './log-buffer';
import type { ZLogBufferSpec } from './to-buffer.log';

/**
 * @internal
 */
export class ZLogBuffer$ {

  length = 0;
  private entries: (ZLogBuffer.Entry | undefined)[] = [];
  private firstAdded: () => void = noop;
  private head = 0;
  private tail = 0;

  constructor(readonly limit: number) {
    this.entries.length = limit;
  }

  next(atOnce: number): Promise<[ZLogBuffer.Entry, ...ZLogBuffer.Entry[]]> {
    if (this.length) {
      return Promise.resolve(this.batch(atOnce));
    }

    return new Promise(resolve => {
      this.firstAdded = () => {
        resolve(this.batch(atOnce));
        this.firstAdded = noop;
      };
    });
  }

  add(message: ZLogMessage, onRecord: Exclude<ZLogBufferSpec['onRecord'], undefined>): ZLogBuffer.Entry {

    let index = -1;

    const whenLogged = newPromiseResolver<boolean>();

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
        return whenLogged.promise();
      },

    };

    onRecord(entry, this.contents());

    if (drop !== noop) {
      // New entry is not dropped.
      // Add it to buffer.
      index = this.tail;
      if (++this.tail >= this.limit) {
        this.tail = 0;
      }

      const prev = this.entries[index];

      if (prev) {
        // The buffer is full.
        // Drop the oldest entry.
        prev.drop();
      }

      this.entries[index] = entry;
      if (!this.length++) {
        this.firstAdded();
      }
    }

    return entry;
  }

  clear(): void {
    itsEach(this.contents(), entry => entry.drop());
  }

  private contents(): ZLogBuffer.Contents & PushIterable<ZLogBuffer.Entry> {

    return {

      [Symbol.iterator]() {
        return this[PushIterator__symbol]();
      },

      [PushIterator__symbol]: accept => {

        const head = this.head;
        const list: IndexedItemList<ZLogBuffer.Entry> = {
          length: this.length,
          item: index => {

            const offset = index + head;
            const overflow = offset - this.limit;

            return this.entries[overflow < 0 ? offset : overflow];
          },
        };

        return filterIndexed(list, isPresent)[PushIterator__symbol](accept);
      },

      fillRatio: () => this.length ? this.length / this.limit : 0,
    };

  }

  private batch(size: number): [ZLogBuffer.Entry, ...ZLogBuffer.Entry[]] {

    const batch: ZLogBuffer.Entry[] = [];

    itsEvery(
        this.contents(),
        entry => {
          batch.push(entry);
          return --size > 0;
        },
    );

    return batch as [ZLogBuffer.Entry, ...ZLogBuffer.Entry[]];
  }

  private remove(entry: ZLogBuffer.Entry, index: number): void {

    const found = this.entries[index];

    if (found !== entry) {
      return;
    }

    this.entries[index] = undefined;

    // The head should never be empty, unless the buffer is.
    do {
      if (index === this.head) {
        --this.length;
        if (++this.head >= this.limit) {
          this.head = 0;
        }
      }
    } while (this.length && this.entries[index]);
  }

}
