import type { PublicDrawDto } from '../domain/types.js';

export function applyStaleGuard(
  newDto: PublicDrawDto,
  currentDto: PublicDrawDto | null
): PublicDrawDto {
  if (!currentDto) return newDto;
  if (newDto.eventId !== currentDto.eventId) return newDto;
  if (newDto.revealedCount < currentDto.revealedCount) {
    console.warn(
      `Ignoring stale API response: new revealedCount (${newDto.revealedCount}) < current (${currentDto.revealedCount})`
    );
    return { ...currentDto, serverNow: newDto.serverNow };
  }
  return newDto;
}

export async function fetchPublicDraw(
  currentDto: PublicDrawDto | null = null,
  fetchFn: typeof fetch = window.fetch
): Promise<PublicDrawDto> {
  const response = await fetchFn('/api/draw', {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error(`API error: HTTP ${response.status}`);
  }
  const data = (await response.json()) as PublicDrawDto;
  return applyStaleGuard(data, currentDto);
}
