import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.describe('Public Routes', () => {
    test('landing page is accessible', async ({ page }) => {
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
    });

    test('login page is accessible', async ({ page }) => {
      const response = await page.goto('/login');
      expect(response?.status()).toBe(200);
    });

    test('signup page is accessible', async ({ page }) => {
      const response = await page.goto('/signup');
      expect(response?.status()).toBe(200);
    });

    test('privacy page is accessible', async ({ page }) => {
      const response = await page.goto('/privacy');
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
    });

    test('terms page is accessible', async ({ page }) => {
      const response = await page.goto('/terms');
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible();
    });
  });

  test.describe('Protected Routes (Unauthenticated)', () => {
    test('dashboard redirects to login', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to login or show login page
      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('care-plan redirects to login', async ({ page }) => {
      await page.goto('/care-plan');

      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('location redirects to login', async ({ page }) => {
      await page.goto('/location');

      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('coach redirects to login', async ({ page }) => {
      await page.goto('/coach');

      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('family redirects to login', async ({ page }) => {
      await page.goto('/family');

      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('wellbeing redirects to login', async ({ page }) => {
      await page.goto('/wellbeing');

      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('settings redirects to login', async ({ page }) => {
      await page.goto('/settings');

      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('reports redirects to login', async ({ page }) => {
      await page.goto('/reports');

      await expect(page).toHaveURL(/\/(login|$)/);
    });

    test('onboarding redirects to login', async ({ page }) => {
      await page.goto('/onboarding');

      await expect(page).toHaveURL(/\/(login|$)/);
    });
  });
});
