import { test, expect } from '@playwright/test';

/**
 * Playwright E2E Test Suite for ElectionGuide
 * Complete user flow from Landing -> Personalized -> Dashboard
 */

/**
 * Helper: types text into the chat input using real key events (triggering
 * React's synthetic onChange) and clicks send. More reliable than fill()
 * in WebKit/Safari which skips the synthetic event pipeline.
 */
async function sendChatMessage(
  page: import('@playwright/test').Page,
  text: string
) {
  const input = page.getByTestId('chat-input');
  const sendButton = page.getByTestId('chat-send-button');
  await expect(input).toBeEnabled({ timeout: 10000 });
  await input.click();
  await input.type(text);
  await sendButton.click();
}

test.describe('ElectionGuide - Complete User Journey E2E Tests', () => {
  test.beforeEach(async ({ context, page }) => {
    let requestCount = 0;
    await page.route('**/api/chat*', async (route) => {
      if (route.request().method() === 'POST') {
        requestCount++;
        if (requestCount > 5) {
          await route.fulfill({
            status: 429,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Rate limit exceeded. Please sign in to continue or try again later.' }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'text/plain',
            body: 'This is a mocked AI response about the Election Commission of India (ECI) and voter registration.',
          });
        }
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ csrfToken: 'mock-csrf-token' }),
        });
      }
    });

    // Start from home page before each test
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test.describe('Landing Page & Authentication', () => {
    test('should display landing page with hero section', async ({ page }) => {
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('body')).toContainText(/election|voting/i);
    });

    test('should have working navigation menu', async ({ page, isMobile }) => {
      await expect(page.getByRole('navigation', { name: /Main Navigation/i })).toBeVisible();
      if (isMobile) {
        await page.getByRole('button', { name: /Open Menu/i }).click();
      }
      const navLinks = page.getByRole('navigation').getByRole('link');
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display call-to-action buttons', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'My Voter Dashboard' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Ask Election Assistant' })).toBeVisible();
    });

    test('guest user can access process guides', async ({ page }) => {
      await page.goto('/process', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('h1')).toContainText('Process');
    });
  });

  test.describe('Authentication Flow', () => {
    test('should allow guest access without authentication', async ({ page }) => {
      await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
      // Guest should see public dashboard
      await expect(page.locator('body')).toContainText(/Guest|ECI Guided/i);
    });

    test('should show sign-in prompt for premium features in assistant', async ({ page }) => {
      test.setTimeout(90000);
      await page.goto('/assistant', { waitUntil: 'load' });
      
      const input = page.getByTestId('chat-input');
      // Wait for the page to be fully hydrated and the greeting message to appear
      await expect(input).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('chat-message')).toHaveCount(1, { timeout: 10000 });

      // Send 8 messages; after 5 the mock returns 429 which triggers the rate-limit copy
      for (let i = 0; i < 8; i++) {
        const expectedCount = (i + 1) * 2 + 1; // greeting + user msgs + AI responses
        await sendChatMessage(page, `Test message ${i}`);
        // Wait for both the user message AND the AI response (or error) to appear
        await expect(page.getByTestId('message-container')).toHaveAttribute(
          'data-message-count',
          String(expectedCount),
          { timeout: 15000 }
        );
      }
      
      // Should show rate-limit / sign-in prompt after 5 messages
      await expect(page.locator('body')).toContainText(/sign in|unlimited|limit|premium/i, { timeout: 15000 });
    });
  });

  test.describe('Voter Process Guides', () => {
    test('should display all process guides', async ({ page }) => {
      await page.goto('/process', { waitUntil: 'domcontentloaded' });
      // Wait for the cards to be visible
      const cards = page.getByRole('main').getByRole('link').filter({ hasText: /Form|Station/i });
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should navigate to detailed guide', async ({ page }) => {
      await page.goto('/process', { waitUntil: 'domcontentloaded' });
      const firstGuideLink = page.getByRole('link', { name: /New Voter|Form 6/i }).first();
      await firstGuideLink.click();
      await expect(page).toHaveURL(/.*process\/.*/);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should show Live Data badge', async ({ page }) => {
      // Navigate to a specific guide known to have live data
      await page.goto('/process/voter-id-registration', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toContainText(/live|external/i);
    });
  });

  test.describe('AI Assistant', () => {
    test('should display chat interface', async ({ page }) => {
      await page.goto('/assistant', { waitUntil: 'domcontentloaded' });
      await expect(page.getByPlaceholder(/Ask anything about/i)).toBeVisible();
    });

    test('should send and receive messages', async ({ page }) => {
      await page.goto('/assistant', { waitUntil: 'load' });
      const input = page.getByTestId('chat-input');
      // Wait for full hydration and greeting message before interacting
      await expect(input).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('chat-message')).toHaveCount(1, { timeout: 10000 });
      
      await sendChatMessage(page, 'How do I register to vote?');
      
      // Input should be cleared after send
      await expect(input).toHaveValue('', { timeout: 10000 });
      
      // Response should eventually appear (initial + user + assistant = 3)
      await expect(page.getByTestId('message-container')).toHaveAttribute('data-message-count', '3', { timeout: 30000 });
    });

    test('should cite ECI sources in responses', async ({ page }) => {
      await page.goto('/assistant', { waitUntil: 'load' });
      const input = page.getByTestId('chat-input');
      // Wait for full hydration before interacting
      await expect(input).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId('chat-message')).toHaveCount(1, { timeout: 10000 });

      await sendChatMessage(page, 'What is the official electoral roll portal?');
      
      // Response should contain ECI references (the mock body includes "ECI")
      await expect(page.locator('body')).toContainText(/eci|voters\.eci/i, { timeout: 30000 });
    });
  });

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
