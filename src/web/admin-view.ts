export interface AdminKeyItem {
  teamId: string;
  teamName: string;
  key: string;
  url: string;
  isPending?: boolean;
  logoUrl?: string;
}

export interface AdminDashboardData {
  config: Record<string, unknown>;
  keys: AdminKeyItem[];
  teams: Array<{ id: string; name: string; logoUrl?: string }>;
}

export function renderVarsHtml(cfg: Record<string, unknown>): string {
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

export function renderRow(k: AdminKeyItem): string {
  if (k.isPending || k.key === 'pendiente-invitacion') {
    return `
      <tr>
        <td><strong>${k.teamName}</strong> <span style="color:#d29922;font-size:0.75rem;">(Invitación Pendiente)</span></td>
        <td><span style="color:var(--color-text-muted);font-size:0.75rem;">Pendiente de unirse</span></td>
        <td><span style="color:var(--color-text-muted);font-size:0.75rem;">Sin token aún</span></td>
      </tr>`;
  }
  return `
    <tr>
      <td><strong>${k.teamName}</strong> <span style="color:#3fb950;font-size:0.75rem;">(Activo)</span></td>
      <td><code>${k.key}</code></td>
      <td>
        <button type="button" class="admin-btn" data-copy="${k.url}">Copiar</button>
        <button type="button" class="admin-btn" data-regen="${k.teamId}">🔄 Regenerar</button>
      </td>
    </tr>`;
}

export function buildSectionsHtml(data: AdminDashboardData): string {
  return `
    <section class="admin-section">
      <h3 class="admin-section-title">⚙️ Variables de Configuración</h3>
      <div class="admin-vars-grid">${renderVarsHtml(data.config)}</div>
    </section>
    <section class="admin-section">
      <h3 class="admin-section-title">🔑 Enlaces y Claves de Equipos Activos</h3>
      <div class="admin-actions-bar">
        <button type="button" class="admin-btn admin-btn-primary" data-ref="admin-gen-missing">✨ Generar Solo Faltantes</button>
        <button type="button" class="admin-btn" data-ref="admin-sync-espn">⚡ Sincronizar ESPN</button>
        <button type="button" class="admin-btn" data-ref="admin-copy-all">📋 Copiar Todos los Enlaces</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Equipo</th><th>Token</th><th>Acción</th></tr></thead>
          <tbody data-ref="admin-tbody">${data.keys.map(renderRow).join('')}</tbody>
        </table>
      </div>
    </section>`;
}
