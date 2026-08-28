export interface UserTeamIdentity {
  teamId: string;
  teamName: string;
  key?: string;
}

class GlobalPresenceStore {
  private onlineIds: string[] = [];
  private myTeam: UserTeamIdentity | null = null;

  setOnline(ids: readonly string[]): void {
    this.onlineIds = [...ids];
  }

  getOnline(): readonly string[] {
    return this.onlineIds;
  }

  isOnline(teamId: string): boolean {
    return this.onlineIds.includes(teamId);
  }

  setMyTeam(team: UserTeamIdentity | null): void {
    this.myTeam = team;
  }

  getMyTeam(): UserTeamIdentity | null {
    return this.myTeam;
  }
}

export const globalPresence = new GlobalPresenceStore();
