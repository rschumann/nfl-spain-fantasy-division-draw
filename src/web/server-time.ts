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

export function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  const hh = hours.toString().padStart(2, '0');

  if (days > 0) return `${days}d ${hh}h ${mm}m ${ss}s`;
  if (hours > 0) return `${hh}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

export function formatMinutesSeconds(totalSeconds: number): string {
  return formatCountdown(totalSeconds);
}
