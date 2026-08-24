import { describe, it, expect } from 'vitest';
import {
  DeterministicRandomStream,
  hexToBytes,
  bytesToHex
} from '../../src/domain/random-stream.js';
import { sha256Bytes, hmacSha256Bytes } from '../../src/domain/sha256.js';

describe('Deterministic Random Stream & Pure SHA-256 (Task 03)', () => {
  const seed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  it('converts hex to bytes and back with exact roundtrip', () => {
    const bytes = hexToBytes(seed);
    expect(bytes).toHaveLength(32);
    expect(bytesToHex(bytes)).toBe(seed);
  });

  it('rejects invalid hex strings', () => {
    expect(() => hexToBytes('invalid')).toThrow(/Invalid hex string/);
    expect(() => hexToBytes('123')).toThrow(/Invalid hex string/);
  });

  it('computes pure SHA-256 correctly for standard NIST vector', () => {
    const msg = new TextEncoder().encode('abc');
    const hash = bytesToHex(sha256Bytes(msg));
    expect(hash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('computes pure HMAC-SHA-256 correctly with long key > 64 bytes', () => {
    const longKey = new Uint8Array(80).fill(0xaa);
    const data = new TextEncoder().encode('Test message for long key HMAC');
    const hmac = bytesToHex(hmacSha256Bytes(longKey, data));
    expect(hmac).toHaveLength(64);
  });

  it('generates identical sequence for same seed and domain', () => {
    const s1 = new DeterministicRandomStream(seed, 'teams');
    const s2 = new DeterministicRandomStream(seed, 'teams');
    const vals1 = [s1.nextUniformInt(16), s1.nextUniformInt(16), s1.nextUniformInt(16)];
    const vals2 = [s2.nextUniformInt(16), s2.nextUniformInt(16), s2.nextUniformInt(16)];
    expect(vals1).toEqual(vals2);
  });

  it('generates different sequences for different domains with same seed', () => {
    const s1 = new DeterministicRandomStream(seed, 'teams');
    const s2 = new DeterministicRandomStream(seed, 'division-slots');
    const vals1 = Array.from({ length: 8 }, () => s1.nextUniformInt(16));
    const vals2 = Array.from({ length: 8 }, () => s2.nextUniformInt(16));
    expect(vals1).not.toEqual(vals2);
  });

  it('handles uniform integer generation across block boundaries', () => {
    const stream = new DeterministicRandomStream(seed, 'boundary-test');
    for (let i = 0; i < 20; i++) {
      const val = stream.nextUniformInt(10);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(10);
    }
  });

  it('handles edge case for maxExclusive <= 1', () => {
    const stream = new DeterministicRandomStream(seed, 'test');
    expect(stream.nextUniformInt(1)).toBe(0);
    expect(stream.nextUniformInt(0)).toBe(0);
  });
});
