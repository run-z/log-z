import { isPresent, newPromiseResolver, noop } from '@proc7ts/primitives';
import { filterIndexed, IndexedItemList, itsHead, PushIterable, PushIterator__symbol } from '@proc7ts/push-iterator';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogBuffer } from './log-buffer';
import type { ZLogBufferSpec } from './to-buffer.log';

/**
 * @internal
 */
export class ZLogBuffer$ implements IndexedItemList<ZLogBuffer.Entry> {

  readonly contents: ZLogBuffer.Contents & PushIterable<ZLogBuffer.Entry>;
  length = 0;
  private entries: (ZLogBuffer.Entry | undefined)[] = [];
  private firstAdded: () => void = noop;
  private head = 0;
  private tail = 0;

  constructor(readonly limit: number) {
    this.entries.length = limit;

    const all = filterIndexed(this, isPresent);

    this.contents = {
      [Symbol.iterator]: () => all[PushIterator__symbol](),
      [PushIterator__symbol]: accept => all[PushIterator__symbol](accept),
      fillRatio: () => this.length ? this.length / this.limit : 0,
    };
  }

  item(index: number): ZLogBuffer.Entry | undefined {

    const offset = index + this.head;
    const overflow = offset - this.limit;

    return this.entries[overflow >= 0 ? overflow : offset];
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

  private batch(size: number): [ZLogBuffer.Entry, ...ZLogBuffer.Entry[]] {

    const batch: ZLogBuffer.Entry[] = [];

    itsHead(
        this.contents,
        entry => {
          batch.push(entry);
          return --size > 0 ? undefined : false;
        },
    );

    return batch as [ZLogBuffer.Entry, ...ZLogBuffer.Entry[]];
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

    onRecord(entry, this.contents);

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
    if (this.length) {
      if (this.head < this.tail) {
        this._clear(this.head, this.tail);
      } else {
        this._clear(this.head, this.entries.length);
        this._clear(0, this.tail);
      }
    }
  }

  private _clear(from: number, to: number): void {
    for (let i = from; i < to; ++i) {

      const entry = this.entries[i];

      if (entry) {
        entry.drop();
      }
    }
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
