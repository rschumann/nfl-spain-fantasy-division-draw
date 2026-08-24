import { test, expect } from '@playwright/test';

test.describe('Draw Page E2E Flow (Task 06)', () => {
  test('displays league header, timer, 4 divisions and 16 pending teams', async ({
    page
  }) => {
    await page.goto('/');

    await expect(page.locator('[data-ref="brand-title"]')).toHaveText('NFL Spain');
    await expect(page.locator('[data-ref="brand-subtitle"]')).toContainText(
      'Temporada 26-27'
    );

    const divisions = page.locator('.division-card');
    await expect(divisions).toHaveCount(4);

    const slots = page.locator('.slot-item');
    await expect(slots).toHaveCount(16);

    const pendingChips = page.locator('.team-chip');
    await expect(pendingChips).toHaveCount(16);

    const progressEl = page.locator('[data-ref="progress-text"]');
    await expect(progressEl).toBeVisible();
  });
});
