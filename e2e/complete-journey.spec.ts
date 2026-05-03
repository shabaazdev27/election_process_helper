import { test, expect } from '@playwright/test';

/**
 * Playwright E2E Test Suite for ElectionGuide
 * Complete user flow from Landing → Process → Assistant → Dashboard
 */

/**
 * Sends a chat message by typing with real key events and clicking send.
 * Using `input.type()` (key-event driven) is more reliable than `fill()`
 * in WebKit/Safari, which can skip React's synthetic onChange pipeline.
 * We also wait for the input to be enabled and empty before typing so
 * that a previous loading state doesn't swallow keystrokes.
 */
async function sendChatMessage(
  page: import('@playwright/test').Page,
  text: string
) {
  const input = page.getByTestId('chat-input');
  const sendButton = page.getByTestId('chat-send-button');

  // Wait for prior request to finish (input re-enabled, not loading).
  await expect(input).toBeEnabled({ timeout: 15_000 });
  await expect(input).toHaveValue('', { timeout: 5_000 });

  await input.click();
  await input.type(text, { delay: 20 }); // tiny delay avoids dropped chars in CI
  await expect(sendButton).toBeEnabled({ timeout: 5_000 });
  await sendButton.click();
}

test.describe('ElectionGuide - Complete User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    let requestCount = 0;

    await page.route('**/api/chat*', async (route) => {
      if (route.request().method() === 'POST') {
        requestCount++;
        if (requestCount > 5) {
          await route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Rate limit exceeded. Please sign in to continue or try again later.',
            }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'text/plain',
            body: 'This is a mocked AI response about the Election Commission of India (ECI) and voter registration.',
          });
        }
      } else {
        // GET → return CSRF token mock
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ csrfToken: 'mock-csrf-token' }),
        });
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  // ══════════════════════════════════════════════════════════════════════════
  test.describe('Landing Page & Authentication', () => {
    test('should display landing page with hero section', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('body')).toContainText(/election|voting/i);
    });

    test('should have working navigation menu', async ({ page, isMobile }) => {
      await expect(
        page.getByRole('navigation', { name: /Main Navigation/i })
      ).toBeVisible();
      if (isMobile) {
        const menuBtn = page.getByRole('button', { name: /Open Menu/i });
        await expect(menuBtn).toBeEnabled({ timeout: 10_000 });
        await menuBtn.click();
      }
      const navLinks = page.getByRole('navigation').getByRole('link');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display call-to-action buttons', async ({ page }) => {
      await expect(
        page.getByRole('link', { name: 'My Voter Dashboard' })
      ).toBeVisible();
      await expect(
        page.getByRole('link', { name: 'Ask Election Assistant' })
      ).toBeVisible();
    });

    test('guest user can access process guides', async ({ page }) => {
      await page.goto('/process', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1')).toContainText('Process');
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  test.describe('Authentication Flow', () => {
    test('should allow guest access without authentication', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toContainText(/Guest|ECI Guided/i);
    });

    test('should show sign-in prompt for premium features in assistant', async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await page.goto('/assistant', { waitUntil: 'load' });

      const input = page.getByTestId('chat-input');
      await expect(input).toBeVisible({ timeout: 15_000 });
      // Wait for initial greeting to be rendered.
      await expect(page.getByTestId('chat-message')).toHaveCount(1, {
        timeout: 10_000,
      });

      // Send 8 messages; after 5 the mock returns 429 → rate-limit copy appears.
      for (let i = 0; i < 8; i++) {
        // greeting(1) + each round-trip adds user + AI = 2 messages
        const expectedCount = 1 + (i + 1) * 2;
        await sendChatMessage(page, `Test message ${i}`);
        await expect(page.getByTestId('message-container')).toHaveAttribute(
          'data-message-count',
          String(expectedCount),
          { timeout: 20_000 }
        );
      }

      await expect(page.locator('body')).toContainText(
        /sign in|unlimited|limit|premium/i,
        { timeout: 15_000 }
      );
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  test.describe('Voter Process Guides', () => {
    test('should display all process guides', async ({ page }) => {
      await page.goto('/process', { waitUntil: 'domcontentloaded' });
      const cards = page
        .getByRole('main')
        .getByRole('link')
        .filter({ hasText: /Form|Station/i });
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to detailed guide', async ({ page }) => {
      await page.goto('/process', { waitUntil: 'domcontentloaded' });
      const firstGuideLink = page
        .getByRole('link', { name: /New Voter|Form 6/i })
        .first();
      await firstGuideLink.click();
      await expect(page).toHaveURL(/.*process\/.*/);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should show Live Data badge', async ({ page }) => {
      await page.goto('/process/voter-id-registration', {
        waitUntil: 'domcontentloaded',
      });
      await expect(page.locator('body')).toContainText(/live|external/i);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  test.describe('AI Assistant', () => {
    test('should display chat interface', async ({ page }) => {
      await page.goto('/assistant', { waitUntil: 'domcontentloaded' });
      await expect(
        page.getByPlaceholder(/Ask anything about/i)
      ).toBeVisible();
    });

    test('should send and receive messages', async ({ page }) => {
      await page.goto('/assistant', { waitUntil: 'load' });
      const input = page.getByTestId('chat-input');

      await expect(input).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId('chat-message')).toHaveCount(1, {
        timeout: 10_000,
      });

      await sendChatMessage(page, 'How do I register to vote?');

      // Input is cleared immediately after send.
      await expect(input).toHaveValue('', { timeout: 10_000 });

      // initial(1) + user(1) + assistant(1) = 3
      await expect(page.getByTestId('message-container')).toHaveAttribute(
        'data-message-count',
        '3',
        { timeout: 30_000 }
      );
    });

    test('should cite ECI sources in responses', async ({ page }) => {
      await page.goto('/assistant', { waitUntil: 'load' });
      const input = page.getByTestId('chat-input');

      await expect(input).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId('chat-message')).toHaveCount(1, {
        timeout: 10_000,
      });

      await sendChatMessage(page, 'What is the official electoral roll portal?');

      // The mocked body includes "ECI" — confirm it appears in the rendered page.
      await expect(page.locator('body')).toContainText(/eci|voters\.eci/i, {
        timeout: 30_000,
      });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  test.describe('Accessibility & Performance', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1')).toHaveCount(1);
      const h2Count = await page.locator('h2').count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test('should have alt text on images', async ({ page }) => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const images = page.locator('img');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        await expect(images.nth(i)).toHaveAttribute('alt');
      }
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('navigation')).toBeVisible();
      await expect(page.getByRole('main')).toBeVisible();
    });
  });
});
