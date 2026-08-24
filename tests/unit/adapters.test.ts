import { describe, it, expect } from 'vitest';
import { NodeEntropy } from '../../src/adapters/node-entropy.js';
import { SystemClock } from '../../src/adapters/system-clock.js';

describe('System Clock and Node Entropy Adapters (Task 04)', () => {
  it('generates 32-byte (64 hex chars) entropy', () => {
    const entropy = new NodeEntropy();
    const seed1 = entropy.generateSeedHex();
    const seed2 = entropy.generateSeedHex();
    expect(seed1).toHaveLength(64);
    expect(seed2).toHaveLength(64);
    expect(seed1).not.toBe(seed2);
  });

  it('provides real time via SystemClock', () => {
    const clock = new SystemClock();
    const before = Date.now();
    const now = clock.now().getTime();
    const after = Date.now();
    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(after);
  });
});
