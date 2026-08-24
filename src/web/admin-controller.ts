interface AdminKeyItem {
  teamId: string;
  teamName: string;
  key: string;
  url: string;
  isPending?: boolean;
  logoUrl?: string;
}

interface AdminDashboardData {
  config: Record<string, unknown>;
  keys: AdminKeyItem[];
  teams: Array<{ id: string; name: string; logoUrl?: string }>;
}

function renderVarsHtml(cfg: Record<string, unknown>): string {
  return Object.entries(cfg)
    .filter(([k]) => typeof cfg[k] !== 'object')
    .map(
      ([k, v]) => `
      <div class="admin-var-item">
        <span class="admin-var-label">${k}</span>
        <span class="admin-var-val">${String(v)}</span>
      </div>`
    )
    .join('');
}

function renderRow(k: AdminKeyItem): string {
  const badge = k.isPending
    ? '<span style="color:#d29922;font-size:0.75rem;">(Invitación Pendiente)</span>'
    : '<span style="color:#3fb950;font-size:0.75rem;">(Activo)</span>';
  return `
    <tr>
      <td><strong>${k.teamName}</strong> ${badge}</td>
      <td><code>${k.key}</code></td>
      <td>
        <button type="button" class="admin-btn" data-copy="${k.url}">Copiar</button>
      </td>
    </tr>`;
}

function buildSectionsHtml(data: AdminDashboardData): string {
  return `
    <section class="admin-section">
      <h3 class="admin-section-title">⚙️ Variables de Configuración</h3>
      <div class="admin-vars-grid">${renderVarsHtml(data.config)}</div>
    </section>
    <section class="admin-section">
      <h3 class="admin-section-title">🔑 Enlaces y Claves de Equipos</h3>
      <div class="admin-actions-bar">
        <button type="button" class="admin-btn admin-btn-primary" data-ref="admin-gen-keys">🔄 Generar Claves</button>
        <button type="button" class="admin-btn" data-ref="admin-sync-espn">⚡ Sincronizar ESPN</button>
        <button type="button" class="admin-btn" data-ref="admin-copy-all">📋 Copiar Todos</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Equipo</th><th>Clave</th><th>Acción</th></tr></thead>
          <tbody data-ref="admin-tbody">${data.keys.map(renderRow).join('')}</tbody>
        </table>
      </div>
    </section>`;
}

export class AdminController {
  private overlay: HTMLElement | null = null;
  private data: AdminDashboardData | null = null;

  constructor(private readonly adminKey: string) {}

  async init(headerEl: HTMLElement): Promise<void> {
    try {
      const res = await fetch(
        `/api/admin/dashboard?adminKey=${encodeURIComponent(this.adminKey)}`
      );
      if (!res.ok) return;
      this.data = (await res.json()) as AdminDashboardData;
      this.renderAdminButton(headerEl);
    } catch {
      // Admin auth failed
    }
  }

  private renderAdminButton(header: HTMLElement): void {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'admin-badge-btn';
    btn.textContent = '👑 Panel Admin';
    btn.onclick = () => this.openModal();
    header.appendChild(btn);
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
      .querySelector('[data-ref="admin-gen-keys"]')
      ?.addEventListener('click', () => void this.generateKeys());
    this.overlay
      .querySelector('[data-ref="admin-sync-espn"]')
      ?.addEventListener('click', () => void this.syncEspn());
    this.overlay.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach((b) => {
      b.onclick = () => void navigator.clipboard.writeText(b.dataset.copy || '');
    });
  }

  private async generateKeys(): Promise<void> {
    if (!confirm('¿Regenerar claves para los equipos?')) return;
    const url = `/api/admin/keys/generate?adminKey=${encodeURIComponent(this.adminKey)}`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) return;
    const json = (await res.json()) as { keys: AdminKeyItem[] };
    if (this.data) this.data.keys = json.keys;
    const tbody = this.overlay?.querySelector('[data-ref="admin-tbody"]');
    if (tbody) tbody.innerHTML = json.keys.map(renderRow).join('');
  }

  private async syncEspn(): Promise<void> {
    await fetch(`/api/admin/espn/sync?adminKey=${encodeURIComponent(this.adminKey)}`, {
      method: 'POST'
    });
    alert('Sincronización con ESPN completada.');
  }

  private copyAllLinks(): void {
    if (!this.data) return;
    const text = this.data.keys.map((k) => `${k.teamName}: ${k.url}`).join('\n');
    void navigator.clipboard.writeText(text);
    alert('Todos los enlaces han sido copiados al portapapeles.');
  }
}
