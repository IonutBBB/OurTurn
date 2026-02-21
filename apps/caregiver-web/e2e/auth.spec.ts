import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Landing Page', () => {
    test('displays landing page with login and signup links', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('text=OurTurn').first()).toBeVisible();
      // On desktop: nav links visible. On mobile: behind hamburger menu.
      const viewport = page.viewportSize();
      if (viewport && viewport.width >= 768) {
        await expect(page.getByRole('link', { name: /log in/i }).first()).toBeVisible({ timeout: 10000 });
      } else {
        await expect(page.locator('button[aria-label]').first()).toBeVisible();
      }
    });

    test('navigates to login page', async ({ page }) => {
      await page.goto('/login');

      await expect(page).toHaveURL('/login');
      await expect(page.getByText(/welcome back/i)).toBeVisible();
    });

    test('navigates to signup page', async ({ page }) => {
      await page.goto('/signup');

      await expect(page).toHaveURL('/signup');
    });
  });

  test.describe('Login Page', () => {
    test('displays login form elements', async ({ page }) => {
      await page.goto('/login');

      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /continue with apple/i })).toBeVisible();
    });

    test('shows validation for empty form submission', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.locator('#email');
      const passwordInput = page.locator('#password');

      // HTML5 validation should prevent submission
      await expect(emailInput).toHaveAttribute('required', '');
      await expect(passwordInput).toHaveAttribute('required', '');
    });

    test('shows error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.locator('#email').fill('invalid@example.com');
      await page.locator('#password').fill('wrongpassword');
      await page.getByRole('button', { name: /^log in$/i }).click();

      // Should show error message
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    });

    test('has link to signup page', async ({ page }) => {
      await page.goto('/login');

      await page.getByRole('link', { name: /sign up/i }).click();
      await expect(page).toHaveURL('/signup');
    });

    test('has link to forgot password', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
    });
  });

  test.describe('Signup Page', () => {
    test('displays signup form elements', async ({ page }) => {
      await page.goto('/signup');

      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    });

    test('validates password match', async ({ page }) => {
      await page.goto('/signup');

      await page.locator('#email').fill('test@example.com');
      await page.locator('#password').fill('password123');
      await page.locator('#confirmPassword').fill('differentpassword');
      await page.getByRole('button', { name: /create account/i }).click();

      await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    });

    test('validates password length', async ({ page }) => {
      await page.goto('/signup');

      await page.locator('#email').fill('test@example.com');
      await page.locator('#password').fill('short');
      await page.locator('#confirmPassword').fill('short');
      await page.getByRole('button', { name: /create account/i }).click();

      // Either shows custom error or HTML5 validation prevents submission
      const hasCustomError = await page.getByText(/at least 8 characters/i).isVisible().catch(() => false);
      const hasHtmlValidation = await page.locator('#password').evaluate((el: HTMLInputElement) => !el.validity.valid);

      expect(hasCustomError || hasHtmlValidation).toBe(true);
    });

    test('has link to login page', async ({ page }) => {
      await page.goto('/signup');

      await page.getByRole('link', { name: /log in/i }).click();
      await expect(page).toHaveURL('/login');
    });
  });
});
