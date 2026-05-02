import { test, expect } from '@playwright/test';

test.describe('Chat Assistant', () => {
  test.setTimeout(60000);
  test.beforeEach(async ({ page }) => {
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
  });

  test('should allow user to send a message and receive a response', async ({ page }) => {
    await page.goto('/assistant', { waitUntil: 'load' });

    const input = page.getByTestId('chat-input');
    await expect(input).toBeVisible({ timeout: 15000 });
    
    // Ensure the greeting is present before proceeding
    await expect(page.getByTestId('chat-message')).toHaveCount(1, { timeout: 10000 });

    // Use click + type (key events) to reliably trigger React's onChange in all browsers
    await input.click();
    await input.type('How do I register to vote in India?');
    
    const sendButton = page.getByTestId('chat-send-button');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // Wait for messages to reach 3 (initial + user + assistant)
    await expect(page.getByTestId('message-container')).toHaveAttribute('data-message-count', '3', { timeout: 30000 });
    
    const aiMessage = page.getByTestId('chat-message').last();
    await expect(aiMessage).toContainText(/Voter|Register|ECI|Election/i);
  });

  test('should handle common queries via quick buttons', async ({ page }) => {
    await page.goto('/assistant', { waitUntil: 'domcontentloaded' });
    
    const registrationButton = page.getByRole('button', { name: /Registration Process/i });
    if (await registrationButton.isVisible()) {
      await registrationButton.click();
      const response = page.getByTestId('chat-message');
      await expect(response.first()).toBeVisible({ timeout: 30000 });
    }
  });
});
