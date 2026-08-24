import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Accessibility & Responsive E2E (Task 06)', () => {
  test('passes automated axe accessibility scan with 0 critical violations', async ({
    page
  }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v: { impact?: string | null }) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(critical).toEqual([]);
  });

  test('ensures 0 horizontal scroll across mobile (360px) and tablet (768px)', async ({
    page
  }) => {
    const viewports = [
      { width: 360, height: 800 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 }
    ];
    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');
      const isOverflowing = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      );
      expect(isOverflowing).toBe(false);
    }
  });

  test('verifies keyboard focusable elements', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const copyBtn = page.locator('[data-ref="btn-copy-hash"]');
    await expect(copyBtn).toBeVisible();
  });
});
