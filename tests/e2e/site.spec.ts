import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows headline', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Something Greater');
  });

  test('primary CTA links to /start', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /Get the Free Guide/i });
    await expect(cta).toHaveAttribute('href', '/start');
  });

  test('secondary CTA links to /contact', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /Book a Discovery Call/i });
    await expect(cta).toHaveAttribute('href', '/contact');
  });

  test('nav has correct links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /About/i }).first()).toHaveAttribute('href', '/about');
    await expect(page.getByRole('link', { name: /Services/i }).first()).toHaveAttribute('href', '/services');
  });

  test('"What I Believe" section links to /about', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: /Read the full statement/i });
    await expect(link).toHaveAttribute('href', '/about');
  });
});

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
