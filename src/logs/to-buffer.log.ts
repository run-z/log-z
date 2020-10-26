/**
 * @packageDocumentation
 * @module @run-z/log-z
 */
import { newPromiseResolver, noop } from '@proc7ts/primitives';
import type { ZLogMessage } from '../log-message';
import { ZLogBuffer } from './log-buffer';

/**
 * Log buffering specification.
 */
export interface ZLogBufferSpec {

  /**
   * Buffer limit. I.e. the maximum number of log messages to store in buffer.
   *
   * The values less that `1` are treated as `1`.
   *
   * @default 256
   */
  readonly limit?: number;

  /**
   * This is called whenever a log message is about to be buffered.
   *
   * It may {@link ZLogBuffer.Entry drop} either the new message, or the oldest one to prevent buffer overflow.
   *
   * If the buffer is full (i.e. `fillRatio` is `1`), and this method did not drop any of the messages, then the oldest
   * message will be dropped.
   *
   * @param newEntry  Log message entry about to be buffered.
   * @param oldestEntry  The oldest log entry. The same as `newEntry` for empty buffer.
   * @param fillRatio  The fill ratio of the buffer. `0` corresponds to empty buffer, while `1` corresponds to full
   * one.
   */
  onRecord?(newEntry: ZLogBuffer.Entry, oldestEntry: ZLogBuffer.Entry, fillRatio: number): void;

}

/**
 * @internal
 */
class ZLogBuffer$ {

  private entries: (ZLogBuffer.Entry | undefined)[] = [];
  private firstAdded: (entry: ZLogBuffer.Entry) => void = noop;
  private first = 0;
  private last = -1;
  private size = 0;

  constructor(readonly limit: number) {
  }

  next(): Promise<ZLogBuffer.Entry> {

    const first = this.entries[this.first];

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

    const buffer = this;
    let index = -1;

    const whenLogged = newPromiseResolver<boolean>();

    let dropped = false;

    const entry: ZLogBuffer.Entry = {

      message,

      drop() {
        dropped = true;
        if (buffer.remove(this, index)) {
          whenLogged.resolve(false);
        }
      },

      recordTo(target) {
        if (buffer.remove(this, index)) {
          target.record(message);
          whenLogged.resolve(target.whenLogged());
        }
      },

      whenLogged() {
        return whenLogged.promise();
      },

    };

    const oldestEntry = this.entries[this.first] || entry;
    const size = this.size;

    onRecord(entry, oldestEntry, this.limit / size);

    if (!dropped) {
      if (size >= this.limit && size === this.size) {
        // The buffer is full.
        // Drop the oldest entry.
        oldestEntry.drop();
      }

      if (++this.last >= this.limit) {
        this.last = 0;
      }
      index = this.last;

      const prev = this.entries[index];

      if (prev) {
        prev.drop();
      }

      this.entries[index] = entry;
      if (++this.size === 1) {
        this.firstAdded(entry);
      }
    }

    return entry;
  }

  clear(): Promise<unknown> {
    if (this.first <= this.last) {
      return this._clear(this.first, this.last + 1);
    }

    return Promise.all([
      this._clear(0, this.first + 1),
      this._clear(this.first, this.entries.length),
    ]);
  }

  private _clear(from: number, to: number): Promise<unknown> {

    const cleared: Promise<boolean>[] = [];

    for (let i = from; i < to; ++i) {

      const entry = this.entries[i];

      if (entry) {
        entry.drop();
        cleared.push(entry.whenLogged());
      }
    }

    return Promise.all(cleared);
  }

  private remove(entry: ZLogBuffer.Entry, index: number): boolean {

    const found = this.entries[index];

    if (found !== entry) {
      return false;
    }

    this.entries[index] = undefined;
    if (index === this.first && ++this.first >= this.limit) {
      this.first = 0;
    }
    --this.size;

    return true;
  }

}

/**
 * Creates a log buffer.
 *
 * The buffer is expected to be {@link ZLogBuffer.drainTo drained} to some log recorder.
 *
 * @param spec  Log buffering specification.
 *
 * @returns New log buffer.
 */
export function logZToBuffer(spec: ZLogBufferSpec = {}): ZLogBuffer {

  const { limit = 256 } = spec;
  const onRecord = spec.onRecord ? spec.onRecord.bind(spec) : noop;

  const buffer = new ZLogBuffer$(Math.max(1, limit));

  let whenLogged = (): Promise<boolean> => Promise.resolve(true);
  let record = (message: ZLogMessage): void => {

    const entry = buffer.add(message, onRecord);

    whenLogged = () => entry.whenLogged();
  };
  let drainTo = ZLogBuffer.drainer(() => buffer.next());
  let end = (): Promise<void> => {
    record = noop;
    whenLogged = () => Promise.resolve(false);
    end = () => Promise.resolve();
    drainTo = noop;

    return buffer.clear().then(noop);
  };

  return {

    record(message) {
      record(message);
    },

    whenLogged(): Promise<boolean> {
      return whenLogged();
    },

    end() {
      return end();
    },

    drainTo(target) {
      drainTo(target);
    },

  };
}
