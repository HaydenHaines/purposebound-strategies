import { test, expect } from '@playwright/test';

test.describe('Lead Magnet Form', () => {
  test('form on /start has correct Netlify attributes', async ({ page }) => {
    await page.goto('/start');
    const form = page.locator('form[name="lead-magnet"]');
    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', '/thank-you');
    // hidden form-name input is required by Netlify
    const hiddenInput = form.locator('input[name="form-name"]');
    await expect(hiddenInput).toHaveAttribute('value', 'lead-magnet');
  });

  test('email input is required', async ({ page }) => {
    await page.goto('/start');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });
});
