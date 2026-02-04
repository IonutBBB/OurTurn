import { test, expect } from '@playwright/test';

test.describe('Legal Pages', () => {
  test.describe('Privacy Policy', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/privacy');
    });

    test('displays privacy policy content', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
      await expect(page.getByText(/last updated/i)).toBeVisible();
    });

    test('contains required GDPR sections', async ({ page }) => {
      // Check for key privacy sections
      await expect(page.getByText(/information we collect/i)).toBeVisible();
      await expect(page.getByText(/how we use your information/i)).toBeVisible();
      await expect(page.getByText(/your rights \(gdpr\)/i)).toBeVisible();
    });

    test('has link to terms of service', async ({ page }) => {
      await expect(page.getByRole('link', { name: /terms of service/i })).toBeVisible();
    });

    test('has link back to home', async ({ page }) => {
      await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
    });
  });

  test.describe('Terms of Service', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/terms');
    });

    test('displays terms of service content', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /terms of service/i })).toBeVisible();
      await expect(page.getByText(/last updated/i)).toBeVisible();
    });

    test('contains medical disclaimer', async ({ page }) => {
      await expect(page.getByText(/not a medical device/i)).toBeVisible();
    });

    test('has link to privacy policy', async ({ page }) => {
      await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
    });
  });
});
