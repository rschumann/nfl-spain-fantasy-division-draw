import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import crypto from 'node:crypto';

export interface ServerChatMessage {
  readonly id: string;
  readonly teamId: string;
  readonly teamName: string;
  readonly body: string;
  readonly createdAt: string;
}

export class ChatStore {
  private readonly messages: ServerChatMessage[] = [];
  private readonly presence = new Map<string, number>();

  constructor(
    private readonly storagePath?: string,
    private readonly maxMessages = 500
  ) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    if (!this.storagePath || !existsSync(this.storagePath)) return;
    try {
      const raw = readFileSync(this.storagePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.messages.push(...parsed.slice(-this.maxMessages));
      }
    } catch {
      // Non-fatal if parse error
    }
  }

  private saveToDisk(): void {
    if (!this.storagePath) return;
    try {
      const dir = dirname(this.storagePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(this.storagePath, JSON.stringify(this.messages, null, 2), 'utf8');
    } catch {
      // Non-fatal if write error
    }
  }

  touchPresence(teamId: string): void {
    this.presence.set(teamId, Date.now());
  }

  getOnlineTeamIds(thresholdMs = 60000): readonly string[] {
    const cutoff = Date.now() - thresholdMs;
    const online: string[] = [];
    for (const [teamId, seenAt] of this.presence.entries()) {
      if (seenAt >= cutoff) online.push(teamId);
    }
    return online;
  }

  addMessage(teamId: string, teamName: string, body: string): ServerChatMessage {
    this.touchPresence(teamId);
    const msg: ServerChatMessage = {
      id: crypto.randomUUID(),
      teamId,
      teamName,
      body: body.trim(),
      createdAt: new Date().toISOString()
    };
    this.messages.push(msg);
    if (this.messages.length > this.maxMessages) {
      this.messages.splice(0, this.messages.length - this.maxMessages);
    }
    this.saveToDisk();
    return msg;
  }

  getMessages(limit = 100): readonly ServerChatMessage[] {
    const start = Math.max(0, this.messages.length - limit);
    return this.messages.slice(start);
  }

  clear(): void {
    this.messages.length = 0;
    this.presence.clear();
    this.saveToDisk();
  }
}
