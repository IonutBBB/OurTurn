import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('app server responds', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });

  test('displays OurTurn branding on load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Welcome to OurTurn Care')).toBeVisible({ timeout: 15000 });
  });
});
