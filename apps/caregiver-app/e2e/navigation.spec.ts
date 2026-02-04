import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('app server responds', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=MemoGuard').first()).toBeVisible({ timeout: 15000 });
  });
});
