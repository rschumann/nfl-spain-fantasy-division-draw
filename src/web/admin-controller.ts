import {
  type AdminKeyItem,
  type AdminDashboardData,
  buildSectionsHtml,
  renderRow
} from './admin-view.js';

export class AdminController {
  private overlay: HTMLElement | null = null;
  private data: AdminDashboardData | null = null;

  constructor(private readonly adminKey: string) {}

  async initDirect(): Promise<void> {
    try {
      const res = await fetch(
        `/api/admin/dashboard?adminKey=${encodeURIComponent(this.adminKey)}`
      );
      if (!res.ok) return;
      this.data = (await res.json()) as AdminDashboardData;
      this.openModal();
    } catch {
      // Admin auth failed
    }
  }

  private openModal(): void {
    if (!this.data) return;
    this.closeModal();
    this.overlay = document.createElement('div');
    this.overlay.className = 'admin-modal-overlay';
    this.overlay.innerHTML = `
      <div class="admin-modal" role="dialog" aria-label="Panel de Administración">
        <div class="admin-modal-header">
          <h2 class="admin-modal-title">👑 Panel de Administración de la Liga</h2>
          <button type="button" class="admin-close-btn" data-ref="admin-close">&times;</button>
        </div>
        <div class="admin-modal-body">${buildSectionsHtml(this.data)}</div>
      </div>`;
    this.attachModalEvents();
    document.body.appendChild(this.overlay);
  }

  private closeModal(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  private attachModalEvents(): void {
    if (!this.overlay) return;
    this.overlay
      .querySelector('[data-ref="admin-close"]')
      ?.addEventListener('click', () => this.closeModal());
    this.overlay
      .querySelector('[data-ref="admin-copy-all"]')
      ?.addEventListener('click', () => this.copyAllLinks());
    this.overlay
      .querySelector('[data-ref="admin-gen-missing"]')
      ?.addEventListener('click', () => void this.generateMissing());
    this.overlay
      .querySelector('[data-ref="admin-sync-espn"]')
      ?.addEventListener('click', () => void this.syncEspn());
    this.overlay.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((b) => {
      b.onclick = () => void navigator.clipboard.writeText(b.dataset.copy || '');
    });
    this.overlay
      .querySelectorAll<HTMLButtonElement>('button[data-regen]')
      .forEach((b) => {
        b.onclick = () => void this.regenerateSingleTeam(b.dataset.regen || '');
      });
  }

  private async generateMissing(): Promise<void> {
    const url = `/api/admin/keys/generate-missing?adminKey=${encodeURIComponent(this.adminKey)}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) return;
    const json = (await res.json()) as { keys: AdminKeyItem[] };
    if (this.data) this.data.keys = json.keys;
    this.updateTable(json.keys);
    alert('Claves generadas para equipos activos sin token.');
  }

  private async regenerateSingleTeam(teamId: string): Promise<void> {
    if (!confirm(`¿Regenerar clave solo para este equipo?`)) return;
    const url = `/api/admin/keys/regenerate-team?adminKey=${encodeURIComponent(this.adminKey)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId })
    });
    if (!res.ok) return;
    const json = (await res.json()) as { keys: AdminKeyItem[] };
    if (this.data) this.data.keys = json.keys;
    this.updateTable(json.keys);
  }

  private updateTable(keys: AdminKeyItem[]): void {
    const tbody = this.overlay?.querySelector('[data-ref="admin-tbody"]');
    if (tbody) tbody.innerHTML = keys.map(renderRow).join('');
    this.attachModalEvents();
  }

  private async syncEspn(): Promise<void> {
    await fetch(`/api/admin/espn/sync?adminKey=${encodeURIComponent(this.adminKey)}`, {
      method: 'POST'
    });
    const res = await fetch(
      `/api/admin/dashboard?adminKey=${encodeURIComponent(this.adminKey)}`
    );
    if (res.ok) {
      this.data = (await res.json()) as AdminDashboardData;
      this.updateTable(this.data.keys);
    }
    alert('Sincronización con ESPN completada.');
  }

  private copyAllLinks(): void {
    if (!this.data) return;
    const active = this.data.keys.filter(
      (k) => !k.isPending && k.key !== 'pendiente-invitacion'
    );
    const text = active.map((k) => `${k.teamName}: ${k.url}`).join('\n');
    void navigator.clipboard.writeText(text);
    alert('Enlaces de todos los equipos activos copiados al portapapeles.');
  }
}
