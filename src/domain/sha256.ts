// Pure SHA-256 and HMAC-SHA256 implementation with zero external dependencies

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
  0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
  0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
  0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
  0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
  0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2
]);

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

function padMessage(msg: Uint8Array): Uint8Array {
  const len = msg.length;
  const bitLen = len * 8;
  const k = (448 - ((len * 8 + 8) % 512) + 512) % 512;
  const padLen = len + 1 + k / 8 + 8;
  const padded = new Uint8Array(padLen);
  padded.set(msg);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 4, bitLen >>> 0);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000));
  return padded;
}

function compressBlock(w: Uint32Array, h: Uint32Array): void {
  let [a, b, c, d, e, f, g, i] = [h[0]!, h[1]!, h[2]!, h[3]!, h[4]!, h[5]!, h[6]!, h[7]!];
  for (let j = 0; j < 64; j++) {
    const s1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
    const ch = (e & f) ^ (~e & g);
    const temp1 = (i + s1 + ch + K[j]! + w[j]!) >>> 0;
    const s0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const temp2 = (s0 + maj) >>> 0;
    i = g;
    g = f;
    f = e;
    e = (d + temp1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (temp1 + temp2) >>> 0;
  }
  h[0] = (h[0]! + a) >>> 0;
  h[1] = (h[1]! + b) >>> 0;
  h[2] = (h[2]! + c) >>> 0;
  h[3] = (h[3]! + d) >>> 0;
  h[4] = (h[4]! + e) >>> 0;
  h[5] = (h[5]! + f) >>> 0;
  h[6] = (h[6]! + g) >>> 0;
  h[7] = (h[7]! + i) >>> 0;
}

function processChunk(chunk: Uint8Array, h: Uint32Array, w: Uint32Array): void {
  const view = new DataView(chunk.buffer, chunk.byteOffset, 64);
  for (let j = 0; j < 16; j++) w[j] = view.getUint32(j * 4);
  for (let j = 16; j < 64; j++) {
    const s0 = rotr(7, w[j - 15]!) ^ rotr(18, w[j - 15]!) ^ (w[j - 15]! >>> 3);
    const s1 = rotr(17, w[j - 2]!) ^ rotr(19, w[j - 2]!) ^ (w[j - 2]! >>> 10);
    w[j] = (w[j - 16]! + s0 + w[j - 7]! + s1) >>> 0;
  }
  compressBlock(w, h);
}

export function sha256Bytes(msg: Uint8Array): Uint8Array {
  const padded = padMessage(msg);
  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab,
    0x5be0cd19
  ]);
  const w = new Uint32Array(64);
  for (let i = 0; i < padded.length; i += 64) {
    processChunk(padded.subarray(i, i + 64), h, w);
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let j = 0; j < 8; j++) outView.setUint32(j * 4, h[j]!);
  return out;
}

export function hmacSha256Bytes(key: Uint8Array, msg: Uint8Array): Uint8Array {
  let k = key;
  if (k.length > 64) k = sha256Bytes(k);
  const kPad = new Uint8Array(64);
  kPad.set(k);
  const iPad = new Uint8Array(64 + msg.length);
  const oPad = new Uint8Array(64 + 32);
  for (let i = 0; i < 64; i++) {
    iPad[i] = kPad[i]! ^ 0x36;
    oPad[i] = kPad[i]! ^ 0x5c;
  }
  iPad.set(msg, 64);
  oPad.set(sha256Bytes(iPad), 64);
  return sha256Bytes(oPad);
}
