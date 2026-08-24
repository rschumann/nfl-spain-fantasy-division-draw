export function computeTimeOffsetMs(
  serverNowIso: string,
  clientNowMs: number = Date.now()
): number {
  const serverMs = new Date(serverNowIso).getTime();
  if (Number.isNaN(serverMs)) return 0;
  return serverMs - clientNowMs;
}

export function computeSecondsRemaining(
  targetIso: string | null,
  offsetMs: number,
  clientNowMs: number = Date.now()
): number {
  if (!targetIso) return 0;
  const targetMs = new Date(targetIso).getTime();
  if (Number.isNaN(targetMs)) return 0;
  const currentServerEstimate = clientNowMs + offsetMs;
  const diffMs = targetMs - currentServerEstimate;
  return Math.max(0, Math.ceil(diffMs / 1000));
}

export function formatMinutesSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}
