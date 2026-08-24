export interface TeamSession {
  key: string;
  teamId: string;
  teamName: string;
}

const STORAGE_KEY = 'nfl_team_key';
const STORAGE_TEAM_ID = 'nfl_team_id';
const STORAGE_TEAM_NAME = 'nfl_team_name';

export function getUrlKey(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('key') || params.get('token') || null;
  } catch {
    return null;
  }
}

export function getStoredSession(): TeamSession | null {
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    const teamId = localStorage.getItem(STORAGE_TEAM_ID);
    const teamName = localStorage.getItem(STORAGE_TEAM_NAME);
    if (!key || !teamId || !teamName) return null;
    return { key, teamId, teamName };
  } catch {
    return null;
  }
}

export function saveStoredSession(session: TeamSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, session.key);
    localStorage.setItem(STORAGE_TEAM_ID, session.teamId);
    localStorage.setItem(STORAGE_TEAM_NAME, session.teamName);
  } catch {
    // Ignore storage quota errors
  }
}

export function clearStoredSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TEAM_ID);
    localStorage.removeItem(STORAGE_TEAM_NAME);
  } catch {
    // Ignore storage errors
  }
}
