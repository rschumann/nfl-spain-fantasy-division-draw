import type { PublicDrawDto } from '../domain/types.js';
import { fetchPublicDraw } from './api.js';
import { computeTimeOffsetMs, computeSecondsRemaining } from './server-time.js';
import { createDrawViewModel } from './view-model.js';
import { renderHeader } from './render-header.js';
import { renderDivisions } from './render-divisions.js';
import { renderPendingTeams } from './render-pending.js';
import { renderVerification } from './render-verification.js';
import { globalPresence } from './presence.js';

export class DrawSyncController {
  private currentDto: PublicDrawDto | null = null;
  private offsetMs = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private isReconnecting = false;

  constructor(
    private readonly container: HTMLElement,
    private readonly liveRegion: HTMLElement | null
  ) {}

  private announceUpdate(dto: PublicDrawDto): void {
    if (!this.liveRegion || !dto.lastAssignment) return;
    this.liveRegion.textContent = `Nueva asignación: ${dto.lastAssignment.teamName} a la división ${dto.lastAssignment.divisionId}.`;
  }

  private render(dto: PublicDrawDto): void {
    const target = dto.status === 'scheduled' ? dto.startAt : dto.nextRevealAt;
    const remaining = computeSecondsRemaining(target, this.offsetMs);
    const vm = createDrawViewModel(dto, remaining, this.isReconnecting);
    const online = globalPresence.getOnline();

    renderHeader(this.container, vm);
    renderDivisions(this.container, vm.divisions, online);
    renderPendingTeams(this.container, vm.pendingTeams, vm.progressText, online);
    renderVerification(this.container, vm, dto);
  }

  async sync(): Promise<void> {
    try {
      const prevCount = this.currentDto?.revealedCount ?? -1;
      const dto = await fetchPublicDraw(this.currentDto);
      this.offsetMs = computeTimeOffsetMs(dto.serverNow);
      this.currentDto = dto;
      this.isReconnecting = false;
      this.render(dto);
      if (prevCount >= 0 && dto.revealedCount > prevCount) {
        this.announceUpdate(dto);
      }
    } catch {
      this.isReconnecting = true;
      if (this.currentDto) this.render(this.currentDto);
    }
  }

  private onTick(): void {
    if (!this.currentDto) return;
    const target =
      this.currentDto.status === 'scheduled'
        ? this.currentDto.startAt
        : this.currentDto.nextRevealAt;
    const remaining = computeSecondsRemaining(target, this.offsetMs);
    if (remaining === 0 && this.currentDto.status !== 'complete') {
      this.sync();
    } else {
      this.render(this.currentDto);
    }
  }

  start(): void {
    this.sync();
    this.timerInterval = setInterval(() => this.onTick(), 1000);
    this.pollInterval = setInterval(() => this.sync(), 5000);
    window.addEventListener('online', () => this.sync());
    window.addEventListener('focus', () => this.sync());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.sync();
    });
  }

  stop(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}
