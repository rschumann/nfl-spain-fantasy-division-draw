import {
  existsSync,
  readFileSync,
  mkdirSync,
  openSync,
  writeSync,
  fsyncSync,
  fchmodSync,
  closeSync,
  renameSync,
  unlinkSync
} from 'node:fs';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import type { DrawRepository } from '../application/ports.js';
import type { LockedDrawState } from '../domain/types.js';

const lockedStateSchema = z.object({
  schemaVersion: z.literal(1),
  algorithmVersion: z.literal('hmac-sha256-fisher-yates-v1'),
  eventId: z.string().min(1),
  configFingerprint: z.string().length(64),
  lockedAt: z.string().min(1),
  seedHex: z.string().length(64),
  commitmentHash: z.string().length(64),
  assignments: z
    .array(
      z.object({
        position: z.number().int().min(1).max(16),
        teamId: z.string().min(1),
        divisionId: z.enum(['NORTH', 'EAST', 'WEST', 'SOUTH']),
        revealAt: z.string().min(1)
      })
    )
    .length(16)
});

export class FileDrawRepository implements DrawRepository {
  constructor(private readonly filePath: string) {}

  async loadLockedDraw(eventId: string): Promise<LockedDrawState | null> {
    if (!existsSync(this.filePath)) return null;
    try {
      const raw = readFileSync(this.filePath, 'utf8');
      const parsed = lockedStateSchema.parse(JSON.parse(raw));
      if (parsed.eventId !== eventId) {
        throw new Error(
          `State eventId mismatch: file has ${parsed.eventId}, expected ${eventId}`
        );
      }
      return parsed as unknown as LockedDrawState;
    } catch (err) {
      throw new Error(
        `Failed to load locked draw state: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private writeAtomic(tempPath: string, content: string): void {
    const fd = openSync(tempPath, 'w', 0o600);
    try {
      writeSync(fd, content, 0, 'utf8');
      fsyncSync(fd);
      fchmodSync(fd, 0o600);
    } finally {
      closeSync(fd);
    }
    renameSync(tempPath, this.filePath);
  }

  async saveLockedDraw(state: LockedDrawState): Promise<void> {
    const validated = lockedStateSchema.parse(state);
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const tempName = `.draw-state.${randomBytes(6).toString('hex')}.tmp`;
    const tempPath = join(dir, tempName);
    const content = JSON.stringify(validated, null, 2);
    this.writeAtomic(tempPath, content);
  }

  async resetAllowedState(): Promise<void> {
    if (existsSync(this.filePath)) {
      unlinkSync(this.filePath);
    }
  }
}
