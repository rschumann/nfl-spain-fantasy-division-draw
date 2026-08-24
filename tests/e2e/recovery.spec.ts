import { test, expect } from '@playwright/test';

test.describe('Recovery & Multi-tab E2E (Task 06)', () => {
  test('reload preserves draw state', async ({ page }) => {
    await page.goto('/');
    const title = page.locator('[data-ref="brand-title"]');
    await expect(title).toHaveText('NFL Spain');

    await page.reload();
    await expect(title).toHaveText('NFL Spain');
    const divisions = page.locator('.division-card');
    await expect(divisions).toHaveCount(4);
  });

  test('multiple browser tabs display identical commitment hash', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const p1 = await ctx1.newPage();
    const p2 = await ctx2.newPage();

    await p1.goto('/');
    await p2.goto('/');

    const hash1 = await p1.locator('[data-ref="commitment-hash"]').textContent();
    const hash2 = await p2.locator('[data-ref="commitment-hash"]').textContent();

    expect(hash1).toBe(hash2);
    await ctx1.close();
    await ctx2.close();
  });
});
