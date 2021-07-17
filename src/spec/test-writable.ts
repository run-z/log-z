import { Writable, WritableOptions } from 'stream';

export class TestWritable extends Writable {

  readonly chunks: unknown[] = [];

  constructor(opts: WritableOptions = {}) {
    super({ decodeStrings: false, ...opts });
  }

  override _write(
      chunk: unknown,
      _encoding: string,
      callback: (error?: (Error | null)) => void,
  ): void {
    this.chunks.push(chunk);
    callback();
  }

}
