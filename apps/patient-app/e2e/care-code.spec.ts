import { test, expect } from '@playwright/test';

test.describe('Care Code Entry', () => {
  test('displays care code entry screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Welcome to OurTurn Care')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Enter your Care Code')).toBeVisible({ timeout: 10000 });
  });

  test('has digit input fields for care code', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Welcome to OurTurn Care')).toBeVisible({ timeout: 15000 });
    // Care code has 6 digit inputs
    const inputs = page.locator('input');
    const count = await inputs.count();
    expect(count).toBe(6);
  });
});
