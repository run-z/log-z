import { newPromiseResolver, noop } from '@proc7ts/primitives';
import type { ZLogMessage } from '../log-message';
import type { ZLogRecorder } from '../log-recorder';
import type { ZLogBuffer } from './log-buffer';
import type { ZLogBufferSpec } from './to-buffer.log';

/**
 * @internal
 */
export class ZLogBuffer$ {

  private entries: (ZLogBuffer.Entry | undefined)[] = [];
  private firstAdded: (entry: ZLogBuffer.Entry) => void = noop;
  private head = 0;
  private tail = 0;
  private size = 0;

  constructor(readonly limit: number) {
    this.entries.length = limit;
  }

  next(): Promise<ZLogBuffer.Entry> {

    const first = this.entries[this.head];

    if (first) {
      return Promise.resolve(first);
    }

    return new Promise<ZLogBuffer.Entry>(resolve => {
      this.firstAdded = entry => {
        resolve(entry);
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

    const oldestEntry = this.entries[this.head] || entry;
    const size = this.size;

    onRecord(entry, oldestEntry, size ? size / this.limit : 0);

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
      if (!this.size++) {
        this.firstAdded(entry);
      }
    }

    return entry;
  }

  clear(): void {
    if (this.size) {
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
        --this.size;
        if (++this.head >= this.limit) {
          this.head = 0;
        }
      }
    } while (this.size && this.entries[index]);
  }

}
