import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('app server responds', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Login page shows logo image + "Welcome back" text + email input
    await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 });
  });
});
