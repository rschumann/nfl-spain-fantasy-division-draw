import { randomBytes } from 'node:crypto';
import type { EntropySource } from '../application/ports.js';

export class NodeEntropy implements EntropySource {
  generateSeedHex(): string {
    return randomBytes(32).toString('hex');
  }
}
