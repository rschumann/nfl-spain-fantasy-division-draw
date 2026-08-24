const STORAGE_KEY = 'nfl-spain-chat-team';

export function getSelectedTeamId(defaultTeamId = 'madrid-steelers'): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || defaultTeamId;
  } catch {
    return defaultTeamId;
  }
}

export function setSelectedTeamId(teamId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, teamId);
  } catch {
    // Ignore localStorage failures in private browsing
  }
}
