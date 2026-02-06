import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/OurTurn/i);
  });

  test('displays hero section', async ({ page }) => {
    await expect(page.getByText(/daily care support/i)).toBeVisible();
    await expect(page.getByText(/families living with dementia/i)).toBeVisible();
  });

  test('displays feature cards', async ({ page }) => {
    await expect(page.getByText(/daily care plan/i)).toBeVisible();
    await expect(page.getByText(/location & safety/i)).toBeVisible();
    await expect(page.getByText(/ai care coach/i)).toBeVisible();
    await expect(page.getByText(/take me home/i)).toBeVisible();
    await expect(page.getByText(/family circle/i)).toBeVisible();
    await expect(page.getByText(/caregiver wellbeing/i)).toBeVisible();
  });

  test('displays call to action buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /start free trial/i })).toBeVisible();
  });

  test('displays footer with disclaimer', async ({ page }) => {
    await expect(page.getByText(/wellness app, not a medical device/i)).toBeVisible();
  });

  test('start free trial navigates to signup', async ({ page }) => {
    await page.getByRole('link', { name: /start free trial/i }).click();
    await expect(page).toHaveURL('/signup');
  });
});
