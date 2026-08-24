import { hmacSha256Bytes } from './sha256.js';

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error(`Invalid hex string: ${hex}`);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0');
  }
  return hex;
}

export class DeterministicRandomStream {
  private readonly seedBytes: Uint8Array;
  private readonly domainBytes: Uint8Array;
  private blockIndex = 0;
  private currentBlock: Uint8Array = new Uint8Array(0);
  private blockOffset = 0;

  constructor(seedHex: string, domain: string) {
    this.seedBytes = hexToBytes(seedHex);
    this.domainBytes = new TextEncoder().encode(domain);
  }

  private nextBlock(): void {
    const counterStr = `:${this.blockIndex++}`;
    const counterBytes = new TextEncoder().encode(counterStr);
    const msg = new Uint8Array(this.domainBytes.length + counterBytes.length);
    msg.set(this.domainBytes, 0);
    msg.set(counterBytes, this.domainBytes.length);
    this.currentBlock = hmacSha256Bytes(this.seedBytes, msg);
    this.blockOffset = 0;
  }

  private nextUint32(): number {
    if (this.blockOffset + 4 > this.currentBlock.length) {
      this.nextBlock();
    }
    const view = new DataView(
      this.currentBlock.buffer,
      this.currentBlock.byteOffset + this.blockOffset,
      4
    );
    this.blockOffset += 4;
    return view.getUint32(0, false);
  }

  nextUniformInt(maxExclusive: number): number {
    if (maxExclusive <= 1) return 0;
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    let candidate = this.nextUint32();
    while (candidate >= limit) {
      candidate = this.nextUint32();
    }
    return candidate % maxExclusive;
  }
}
