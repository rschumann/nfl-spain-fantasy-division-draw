import { test, expect } from '@playwright/test';

test.describe('Chat UI E2E with Team Key Authentication', () => {
  test('authenticates with team key, searches and adds emoji, and sends message', async ({
    page
  }) => {
    await page.goto('/');
    const width = page.viewportSize()?.width ?? 1440;
    if (width < 1024) await page.locator('#chat-toggle-btn').click();

    await expect(page.locator('.chat-title')).toHaveText('Chat de la liga');
    await expect(page.locator('.badge-spectator')).toBeVisible();

    const keyInput = page.locator('[data-ref="chat-key-input"]');
    await keyInput.fill('steelers-7821');
    await page.locator('[data-ref="chat-login-form"] button[type="submit"]').click();

    await expect(page.locator('.badge-team')).toContainText('Madrid Steelers');
    await expect(page.locator('[data-ref="my-team-badge"]')).toContainText(
      'Madrid Steelers'
    );
    await expect(page.locator('.team-chip.is-my-team')).toContainText('Madrid Steelers');

    const msgInput = page.locator('[data-ref="chat-input"]');
    await msgInput.fill('¡Madrid Steelers listos ');

    const emojiToggle = page.locator('[data-ref="emoji-toggle-btn"]');
    await emojiToggle.click();
    await expect(page.locator('[data-ref="emoji-popover"]')).toBeVisible();

    const searchInput = page.locator('.emoji-search-input');
    await searchInput.fill('fuego');
    const fireBtn = page.locator('.emoji-btn', { hasText: '🔥' });
    await expect(fireBtn).toBeVisible();
    await fireBtn.click();

    await expect(msgInput).toHaveValue('¡Madrid Steelers listos 🔥');
    await page.locator('[data-ref="chat-form"] button[type="submit"]').click();

    await expect(page.locator('.chat-message-item').last()).toContainText(
      'Madrid Steelers'
    );
    await expect(page.locator('.chat-message-body').last()).toContainText(
      '¡Madrid Steelers listos 🔥'
    );
  });

  test('auto-authenticates and personalizes via URL parameter', async ({ page }) => {
    await page.goto('/?key=patriots-4912');
    await expect(page.locator('.badge-team')).toContainText('Toledo Patriots');
    await expect(page.locator('[data-ref="my-team-badge"]')).toContainText(
      'Toledo Patriots'
    );
  });

  test('mobile opens bottom sheet and displays chat', async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width >= 1024) return;
    await page.goto('/');
    const toggleBtn = page.locator('#chat-toggle-btn');
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await expect(page.locator('#chat-root')).toHaveClass(/sheet-open/);
  });
});
