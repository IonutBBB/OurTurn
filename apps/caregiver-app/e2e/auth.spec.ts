import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('displays login form elements', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      // Login page shows logo image + input fields (no "OurTurn" text)
      await expect(page.locator('input').first()).toBeVisible({ timeout: 15000 });
    });
  });
});
