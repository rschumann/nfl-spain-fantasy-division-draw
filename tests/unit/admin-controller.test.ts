// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminController } from '../../src/web/admin-controller.js';

describe('AdminController UI (Task 06 / Admin Panel)', () => {
  const mockData = {
    config: { leagueName: 'NFL Spain', seasonLabel: '26-27' },
    keys: [
      {
        teamId: 'madrid-steelers',
        teamName: 'Madrid Steelers',
        key: 'steelers-1234',
        url: 'http://127.0.0.1:3000/?key=steelers-1234',
        isPending: false
      },
      {
        teamId: 'nico',
        teamName: 'Nico',
        key: 'pendiente-invitacion',
        url: 'http://127.0.0.1:3000/?key=pendiente-invitacion',
        isPending: true
      }
    ],
    teams: [{ id: 'madrid-steelers', name: 'Madrid Steelers' }]
  };

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.stubGlobal('alert', vi.fn());
    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true
    });
  });

  it('handles failed auth initialization', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false } as Response);
    const header = document.createElement('header');
    const controller = new AdminController('invalid-key');
    await controller.init(header);
    expect(header.querySelector('.admin-badge-btn')).toBeNull();
  });

  it('initializes button and opens/closes modal', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as unknown as Response);

    const header = document.createElement('header');
    const controller = new AdminController('admin-secret-key-998877');
    await controller.init(header);

    const btn = header.querySelector<HTMLButtonElement>('.admin-badge-btn');
    btn?.click();

    expect(document.querySelector('.admin-modal')).not.toBeNull();
    const closeBtn = document.querySelector<HTMLButtonElement>(
      '[data-ref="admin-close"]'
    );
    closeBtn?.click();
    expect(document.querySelector('.admin-modal')).toBeNull();
  });

  it('handles copy-all, copy single, key generation and espn sync actions', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => mockData } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: mockData.keys })
      } as Response)
      .mockResolvedValueOnce({ ok: true } as Response);

    const header = document.createElement('header');
    const controller = new AdminController('admin-secret-key-998877');
    await controller.init(header);

    header.querySelector<HTMLButtonElement>('.admin-badge-btn')?.click();

    document.querySelector<HTMLButtonElement>('[data-ref="admin-copy-all"]')?.click();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    document.querySelector<HTMLButtonElement>('button[data-copy]')?.click();

    const genBtn = document.querySelector<HTMLButtonElement>(
      '[data-ref="admin-gen-keys"]'
    );
    genBtn?.click();

    const syncBtn = document.querySelector<HTMLButtonElement>(
      '[data-ref="admin-sync-espn"]'
    );
    syncBtn?.click();
  });
});
