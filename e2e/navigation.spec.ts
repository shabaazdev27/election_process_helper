import { test, expect } from '@playwright/test';

/**
 * Helper: opens the mobile menu if it is not already open, then clicks
 * the nav link identified by `testId`.  Using `data-state` on the burger
 * button lets us avoid the toggle-loop that plagued earlier retry approaches.
 */
async function mobileNavClick(page: import('@playwright/test').Page, testId: string) {
  const menuButton = page.getByTestId('mobile-menu-button');

  // Close the menu first if it happens to be open from a previous interaction.
  const state = await menuButton.getAttribute('data-state');
  if (state === 'open') {
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('data-state', 'closed', { timeout: 3000 });
  }

  // Open the menu and wait for the animated link to be visible.
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('data-state', 'open', { timeout: 3000 });
  
  const link = page.getByTestId(testId);
  await expect(link).toBeVisible({ timeout: 5000 });
  await link.click();
}

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page, isMobile }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/ElectionGuide/);

    // Check AI Assistant
    if (isMobile) {
      await mobileNavClick(page, 'mobile-nav-link-ai-assistant');
    } else {
      await page.getByTestId('nav-link-ai-assistant').click();
    }
    await expect(page).toHaveURL(/.*assistant/);

    // Check Timeline
    if (isMobile) {
      await mobileNavClick(page, 'mobile-nav-link-timeline');
    } else {
      await page.getByTestId('nav-link-timeline').click();
    }
    await expect(page).toHaveURL(/.*timeline/);

    // Check Quiz
    if (isMobile) {
      await mobileNavClick(page, 'mobile-nav-link-quiz');
    } else {
      await page.getByTestId('nav-link-quiz').click();
    }
    await expect(page).toHaveURL(/.*quiz/);

    // Check Dashboard
    if (isMobile) {
      await mobileNavClick(page, 'mobile-nav-link-dashboard');
    } else {
      await page.getByTestId('nav-link-dashboard').click();
    }
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show correct footer links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const footer = page.locator('footer').first();
    await expect(footer).toContainText('ElectionGuide India');
    await expect(footer).toContainText('Official Sources');
  });
});
