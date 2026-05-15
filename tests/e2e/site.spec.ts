import { test, expect } from '@playwright/test';
import { BASE_PATH } from '../../playwright.config';

const r = (path: string) => `${BASE_PATH}${path}`;

test.describe('Homepage', () => {
  test('loads and shows headline', async ({ page }) => {
    await page.goto(r('/'));
    await expect(page.locator('h1')).toContainText('Something Greater');
  });

  test('primary CTA links to /start', async ({ page }) => {
    await page.goto(r('/'));
    const cta = page.getByRole('link', { name: /Get the Free Guide/i });
    await expect(cta).toHaveAttribute('href', r('/start'));
  });

  test('secondary CTA links to /contact', async ({ page }) => {
    await page.goto(r('/'));
    const cta = page.getByRole('link', { name: /Start a Conversation/i }).first();
    await expect(cta).toHaveAttribute('href', r('/contact'));
  });

  test('nav has correct links', async ({ page }) => {
    await page.goto(r('/'));
    await expect(page.getByRole('link', { name: /About/i }).first()).toHaveAttribute('href', r('/about'));
    await expect(page.getByRole('link', { name: /Services/i }).first()).toHaveAttribute('href', r('/services'));
  });

  test('"What I Believe" section links to /about', async ({ page }) => {
    await page.goto(r('/'));
    const link = page.getByRole('link', { name: /Read the Full Statement/i });
    await expect(link).toHaveAttribute('href', r('/about'));
  });
});

test.describe('/about page', () => {
  test('loads and shows title', async ({ page }) => {
    await page.goto(r('/about'));
    await expect(page.locator('h1')).toContainText('What I Believe');
  });

  test('has a start a conversation CTA', async ({ page }) => {
    await page.goto(r('/about'));
    const cta = page.getByRole('link', { name: /Start a Conversation/i }).first();
    await expect(cta).toHaveAttribute('href', r('/contact'));
  });
});

test.describe('Lead Magnet Form', () => {
  test('form on /start has correct Netlify attributes', async ({ page }) => {
    await page.goto(r('/start'));
    const form = page.locator('form[name="lead-magnet"]');
    await expect(form).toHaveAttribute('data-netlify', 'true');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', r('/thank-you'));
    const hiddenInput = form.locator('input[name="form-name"]');
    await expect(hiddenInput).toHaveAttribute('value', 'lead-magnet');
  });

  test('email input is required', async ({ page }) => {
    await page.goto(r('/start'));
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });
});

test.describe('/thank-you page', () => {
  test('shows confirmation and Calendly CTA', async ({ page }) => {
    await page.goto(r('/thank-you'));
    await expect(page.locator('h1')).toContainText('on its way');
    const cta = page.getByRole('link', { name: /Start a Conversation/i });
    await expect(cta).toBeVisible();
  });

  test('has no nav or footer', async ({ page }) => {
    await page.goto(r('/thank-you'));
    await expect(page.locator('nav')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
  });
});

test.describe('/services page', () => {
  test('shows both service offerings', async ({ page }) => {
    await page.goto(r('/services'));
    await expect(page.getByText('Leadership Coaching').first()).toBeVisible();
    await expect(page.getByText('Corporate Ministry').first()).toBeVisible();
  });

  test('consulting card shows limited engagements note', async ({ page }) => {
    await page.goto(r('/services'));
    await expect(page.getByText(/Currently accepting limited engagements/i)).toBeVisible();
  });
});

test.describe('/blog page', () => {
  test('loads with empty state message', async ({ page }) => {
    await page.goto(r('/blog'));
    await expect(page.locator('h1')).toContainText('Thinking Out Loud');
    await expect(page.getByText(/First post coming soon/i)).toBeVisible();
  });
});

test.describe('/contact page', () => {
  test('loads and shows FAQ', async ({ page }) => {
    await page.goto(r('/contact'));
    await expect(page.locator('h1')).toContainText('Conversation');
    await expect(page.getByText(/What happens on the call/i)).toBeVisible();
  });
});

test.describe('/alt page', () => {
  test('loads and shows redesigned headline', async ({ page }) => {
    await page.goto(r('/alt'));
    await expect(page.locator('h1')).toContainText('Something Greater');
  });

  test('has alternative site label', async ({ page }) => {
    await page.goto(r('/alt'));
    await expect(page.getByText(/Alternative Design/i)).toBeVisible();
  });
});
