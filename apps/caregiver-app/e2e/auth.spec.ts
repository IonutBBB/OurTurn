import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('displays login form elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=MemoGuard').first()).toBeVisible({ timeout: 15000 });
      // Check for email input field
      await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
    });
  });
});
