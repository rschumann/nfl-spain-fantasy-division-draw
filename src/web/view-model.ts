import type { PublicDrawDto, PublicDivision, Team } from '../domain/types.js';
import { formatMinutesSeconds } from './server-time.js';

export interface DrawViewModel {
  readonly leagueName: string;
  readonly seasonLabel: string;
  readonly status: string;
  readonly statusBadgeClass: string;
  readonly timerLabel: string;
  readonly timerFormatted: string;
  readonly showTimer: boolean;
  readonly spotlightText: string | null;
  readonly divisions: readonly PublicDivision[];
  readonly pendingTeams: readonly Team[];
  readonly progressText: string;
  readonly commitmentHash: string;
  readonly shortHash: string;
  readonly isComplete: boolean;
  readonly isReconnecting: boolean;
}

function getStatusBadge(
  status: string,
  isReconnecting: boolean
): { label: string; className: string } {
  if (isReconnecting) return { label: 'Reconectando…', className: 'status-reconnecting' };
  if (status === 'scheduled')
    return { label: 'Programado', className: 'status-scheduled' };
  if (status === 'complete') return { label: 'Finalizado', className: 'status-complete' };
  return { label: 'En directo', className: 'status-running' };
}

function formatShortHash(hash: string): string {
  return hash.length === 64 ? `${hash.substring(0, 8)}...${hash.substring(56)}` : hash;
}

export function createDrawViewModel(
  dto: PublicDrawDto,
  secondsRemaining: number,
  isReconnecting = false
): DrawViewModel {
  const badge = getStatusBadge(dto.status, isReconnecting);
  const spotlight = dto.lastAssignment
    ? `${dto.lastAssignment.teamName}  →  ${dto.lastAssignment.divisionId}`
    : null;
  return {
    leagueName: dto.leagueName,
    seasonLabel: dto.seasonLabel,
    status: badge.label,
    statusBadgeClass: badge.className,
    timerLabel:
      dto.status === 'scheduled' ? 'El sorteo empieza en' : 'Siguiente equipo en',
    timerFormatted: formatMinutesSeconds(secondsRemaining),
    showTimer: dto.status !== 'complete',
    spotlightText: spotlight,
    divisions: dto.divisions,
    pendingTeams: dto.pendingTeams,
    progressText: `${dto.revealedCount} de ${dto.teamCount} equipos sorteados`,
    commitmentHash: dto.commitmentHash,
    shortHash: formatShortHash(dto.commitmentHash),
    isComplete: dto.status === 'complete',
    isReconnecting
  };
}
