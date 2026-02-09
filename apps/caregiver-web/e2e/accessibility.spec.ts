import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('login page has accessible form labels', async ({ page }) => {
    await page.goto('/login');

    // Check that form inputs have associated labels via htmlFor
    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');

    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('signup page has accessible form labels', async ({ page }) => {
    await page.goto('/signup');

    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');
    const confirmLabel = page.locator('label[for="confirmPassword"]');

    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
    await expect(confirmLabel).toBeVisible();
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/login');

    // Check OAuth buttons have aria-labels
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

  test('login form has proper ARIA landmarks', async ({ page }) => {
    await page.goto('/login');

    // Main landmark with descriptive label
    await expect(page.locator('main[aria-label="Login form"]')).toBeVisible();
    // OAuth group
    await expect(page.locator('[role="group"][aria-label="Sign in with social providers"]')).toBeVisible();
    // Email form
    await expect(page.locator('form[aria-label="Sign in with email"]')).toBeVisible();
  });

  test('signup form has proper ARIA landmarks', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.locator('main[aria-label="Signup form"]')).toBeVisible();
    await expect(page.locator('[role="group"][aria-label="Sign up with social providers"]')).toBeVisible();
    await expect(page.locator('form[aria-label="Sign up with email"]')).toBeVisible();
  });
});
