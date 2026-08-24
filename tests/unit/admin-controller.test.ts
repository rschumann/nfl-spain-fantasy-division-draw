// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminController } from '../../src/web/admin-controller.js';

describe('AdminController UI (Direct Admin Modal & Key Actions)', () => {
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

  it('directly opens modal on initDirect and handles close', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    } as unknown as Response);

    const controller = new AdminController('admin-secret-key-998877');
    await controller.initDirect();

    expect(document.querySelector('.admin-modal')).not.toBeNull();
    const closeBtn = document.querySelector<HTMLButtonElement>(
      '[data-ref="admin-close"]'
    );
    closeBtn?.click();
    expect(document.querySelector('.admin-modal')).toBeNull();
  });

  it('handles network failure on initDirect', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    const controller = new AdminController('wrong-key');
    await controller.initDirect();
    expect(document.querySelector('.admin-modal')).toBeNull();
  });

  it('handles cancelled confirmation and errors on actions', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => mockData } as Response)
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce({ ok: false } as Response);

    const controller = new AdminController('admin-secret-key-998877');
    await controller.initDirect();

    vi.stubGlobal(
      'confirm',
      vi.fn(() => false)
    );
    const regenBtn = document.querySelector<HTMLButtonElement>('button[data-regen]');
    regenBtn?.click();

    vi.stubGlobal(
      'confirm',
      vi.fn(() => true)
    );
    regenBtn?.click();

    const genMissingBtn = document.querySelector<HTMLButtonElement>(
      '[data-ref="admin-gen-missing"]'
    );
    genMissingBtn?.click();
  });

  it('handles copy-all, copy single, generate missing, single regen and espn sync', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => mockData } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: mockData.keys })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: mockData.keys })
      } as Response)
      .mockResolvedValueOnce({ ok: true } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => mockData } as Response);

    const controller = new AdminController('admin-secret-key-998877');
    await controller.initDirect();

    document.querySelector<HTMLButtonElement>('[data-ref="admin-copy-all"]')?.click();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    document.querySelector<HTMLButtonElement>('button[data-copy]')?.click();

    const genMissingBtn = document.querySelector<HTMLButtonElement>(
      '[data-ref="admin-gen-missing"]'
    );
    genMissingBtn?.click();

    const regenSingleBtn =
      document.querySelector<HTMLButtonElement>('button[data-regen]');
    regenSingleBtn?.click();

    const syncBtn = document.querySelector<HTMLButtonElement>(
      '[data-ref="admin-sync-espn"]'
    );
    syncBtn?.click();
  });
});
