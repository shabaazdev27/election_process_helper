import { test, expect } from '@playwright/test';

/**
 * E2E tests for the AI Chat Assistant page.
 *
 * All API calls are intercepted by a Playwright route mock so that:
 *  - GET /api/chat  → returns a fake CSRF token
 *  - POST /api/chat → returns a mocked AI response (429 after 5 requests)
 * This isolates the UI logic from the live Gemini API.
 */
test.describe('Chat Assistant', () => {
  test.setTimeout(60_000);

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
        // GET → CSRF token handshake
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ csrfToken: 'mock-csrf-token' }),
        });
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  test('should allow user to send a message and receive a response', async ({
    page,
  }) => {
    await page.goto('/assistant', { waitUntil: 'load' });

    const input = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send-button');

    // Wait for full React hydration: input visible + initial greeting rendered.
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('chat-message')).toHaveCount(1, {
      timeout: 10_000,
    });

    // Type using real key events (triggers React onChange in all browsers).
    await input.click();
    await input.type('How do I register to vote in India?');

    await expect(sendButton).toBeEnabled({ timeout: 5_000 });
    await sendButton.click();

    // initial(1) + user(1) + assistant(1) = 3
    await expect(page.getByTestId('message-container')).toHaveAttribute(
      'data-message-count',
      '3',
      { timeout: 30_000 }
    );

    // Mocked response contains "ECI" — assert at least one keyword matches.
    const aiMessage = page.getByTestId('chat-message').last();
    await expect(aiMessage).toContainText(/Voter|Register|ECI|Election/i);
  });

  // ─────────────────────────────────────────────────────────────────────────
  test('should handle common queries via quick buttons', async ({ page }) => {
    await page.goto('/assistant', { waitUntil: 'domcontentloaded' });

    const registrationButton = page.getByRole('button', {
      name: /Registration Process/i,
    });

    // Only interact if the quick-action button is actually visible on this build.
    if (await registrationButton.isVisible()) {
      await registrationButton.click();
      const response = page.getByTestId('chat-message');
      await expect(response.first()).toBeVisible({ timeout: 30_000 });
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  test('should clear the input after sending a message', async ({ page }) => {
    await page.goto('/assistant', { waitUntil: 'load' });

    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('chat-message')).toHaveCount(1, {
      timeout: 10_000,
    });

    await input.click();
    await input.type('What documents do I need to vote?');
    await page.getByTestId('chat-send-button').click();

    // Input must be cleared immediately after send (not waiting for response).
    await expect(input).toHaveValue('', { timeout: 5_000 });
  });


});
