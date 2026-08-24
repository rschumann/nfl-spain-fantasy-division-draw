import { test, expect } from '@playwright/test';

test.describe('Chat UI E2E (Task 08)', () => {
  test('desktop displays chat sidebar with team selector and input form', async ({
    page
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    const chatSection = page.locator('#chat-root');
    await expect(chatSection).toBeVisible();

    const select = chatSection.locator('[data-ref="team-select"]');
    await expect(select).toBeVisible();

    const input = chatSection.locator('[data-ref="chat-input"]');
    await expect(input).toBeVisible();
  });

  test('mobile displays floating toggle and opens bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const toggleBtn = page.locator('#chat-toggle-btn');
    await expect(toggleBtn).toBeVisible();

    await toggleBtn.click();
    const chatSection = page.locator('#chat-root');
    await expect(chatSection).toHaveClass(/sheet-open/);
  });
});
