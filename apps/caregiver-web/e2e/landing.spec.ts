import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/OurTurn/i);
  });

  test('displays hero section', async ({ page }) => {
    await expect(page.getByText(/care with/i).first()).toBeVisible();
    await expect(page.getByText(/confidence/i).first()).toBeVisible();
    await expect(page.getByText(/living with dementia/i).first()).toBeVisible();
  });

  test('displays feature cards', async ({ page }) => {
    await expect(page.getByText(/daily care plan/i).first()).toBeVisible();
    await expect(page.getByText(/location & safety/i).first()).toBeVisible();
    await expect(page.getByText(/ai care coach/i).first()).toBeVisible();
    await expect(page.getByText(/take me home/i).first()).toBeVisible();
    await expect(page.getByText(/family circle/i).first()).toBeVisible();
    await expect(page.getByText(/your wellbeing/i).first()).toBeVisible();
  });

  test('displays call to action buttons', async ({ page }) => {
    await expect(page.getByRole('link', { name: /start.*free|get started/i }).first()).toBeVisible();
  });

  test('displays footer with disclaimer', async ({ page }) => {
    await expect(page.getByText(/not a medical device/i).first()).toBeVisible();
  });

  test('start free trial navigates to signup', async ({ page }) => {
    await page.getByRole('link', { name: /get started free/i }).first().click();
    await expect(page).toHaveURL('/signup');
  });
});
