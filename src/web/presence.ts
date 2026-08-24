class GlobalPresenceStore {
  private onlineIds: string[] = [];

  setOnline(ids: readonly string[]): void {
    this.onlineIds = [...ids];
  }

  getOnline(): readonly string[] {
    return this.onlineIds;
  }

  isOnline(teamId: string): boolean {
    return this.onlineIds.includes(teamId);
  }
}

export const globalPresence = new GlobalPresenceStore();
