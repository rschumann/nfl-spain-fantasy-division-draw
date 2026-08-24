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
  private readonly maxMessages: number;

  constructor(maxMessages = 500) {
    this.maxMessages = maxMessages;
  }

  touchPresence(teamId: string): void {
    this.presence.set(teamId, Date.now());
  }

  getOnlineTeamIds(thresholdMs = 15000): readonly string[] {
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
    return msg;
  }

  getMessages(limit = 100): readonly ServerChatMessage[] {
    const start = Math.max(0, this.messages.length - limit);
    return this.messages.slice(start);
  }

  clear(): void {
    this.messages.length = 0;
    this.presence.clear();
  }
}
