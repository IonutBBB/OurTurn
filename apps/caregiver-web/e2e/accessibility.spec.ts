import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page has accessible form labels', async ({ page }) => {
    await page.goto('/login');

    // Check that form inputs have associated labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('signup page has accessible form labels', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/login');

    // Check OAuth buttons
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with apple/i })).toBeVisible();
  });

  test('links have meaningful text', async ({ page }) => {
    await page.goto('/');

    // Check navigation links
    await expect(page.getByRole('link', { name: /log in/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /get started|start free trial/i }).first()).toBeVisible();
  });

  test('page has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1 on landing page
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });
});
