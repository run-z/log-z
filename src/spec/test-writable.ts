import { Writable, WritableOptions } from 'stream';

export class TestWritable extends Writable {

  readonly chunks: any[] = [];

  constructor(opts: WritableOptions = {}) {
    super({ decodeStrings: false, ...opts });
  }

  _write(
      chunk: any,
      _encoding: string,
      callback: (error?: (Error | null)) => void,
  ): void {
    this.chunks.push(chunk);
    callback();
  }

}
