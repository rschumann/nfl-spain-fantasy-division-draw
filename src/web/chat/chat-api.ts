export interface ChatMessage {
  id: string;
  teamId: string;
  teamName: string;
  body: string;
  createdAt: string;
}

export interface LoginResult {
  valid: boolean;
  teamId?: string;
  teamName?: string;
  error?: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  onlineTeamIds: string[];
}

export async function loginWithTeamKey(key: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    const data = (await res.json()) as LoginResult;
    return res.ok ? data : { valid: false, error: data.error || 'Clave no válida' };
  } catch {
    return { valid: false, error: 'Error al conectar con el servidor' };
  }
}

export async function fetchMessages(teamKey?: string): Promise<MessagesResponse> {
  try {
    const url = teamKey
      ? `/api/chat/messages?key=${encodeURIComponent(teamKey)}`
      : '/api/chat/messages';
    const res = await fetch(url);
    if (!res.ok) return { messages: [], onlineTeamIds: [] };
    const data = (await res.json()) as MessagesResponse;
    return {
      messages: data.messages ?? [],
      onlineTeamIds: data.onlineTeamIds ?? []
    };
  } catch {
    return { messages: [], onlineTeamIds: [] };
  }
}

export async function sendChatMessage(
  key: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, body })
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      return { ok: false, error: data.error };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Error al enviar mensaje' };
  }
}
