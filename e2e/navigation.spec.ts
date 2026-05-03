import { test, expect } from '@playwright/test';

/**
 * Helper: waits for the page to be interactive, then opens the mobile menu
 * if it is not already open, and clicks the nav link identified by `testId`.
 *
 * WHY the extra waitForLoadState?
 * After a Next.js client-side navigation the Navbar re-mounts and React
 * re-attaches synthetic event listeners during hydration.  If we click the
 * burger button before that hydration completes the `onClick` never fires and
 * `data-state` stays "closed".  Waiting for 'load' (or at least for the
 * button to become enabled) ensures the handler is live before we click.
 */
async function mobileNavClick(
  page: import('@playwright/test').Page,
  testId: string
) {
  const menuButton = page.getByTestId('mobile-menu-button');

  // Wait for the button to be present AND enabled — this means React has
  // finished hydrating and the onClick handler is attached.
  await expect(menuButton).toBeVisible({ timeout: 10_000 });
  await expect(menuButton).toBeEnabled({ timeout: 10_000 });

  // Close the menu first if it is already open from a previous interaction.
  const state = await menuButton.getAttribute('data-state');
  if (state === 'open') {
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('data-state', 'closed', { timeout: 5_000 });
  }

  // Open the menu and wait for the animated panel to settle.
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('data-state', 'open', { timeout: 5_000 });

  // Wait for the target link to appear inside the now-open panel.
  const link = page.getByTestId(testId);
  await expect(link).toBeVisible({ timeout: 5_000 });
  await link.click();
}

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page, isMobile }) => {
    await page.goto('/', { waitUntil: 'load' });
    await expect(page).toHaveTitle(/ElectionGuide/);

    // ── AI Assistant ───────────────────────────────────────────────────────
    if (isMobile) {
      await mobileNavClick(page, 'mobile-nav-link-ai-assistant');
    } else {
      await page.getByTestId('nav-link-ai-assistant').click();
    }
    await expect(page).toHaveURL(/.*assistant/);
    // Wait for the new page to be fully interactive before the next nav click.
    await page.waitForLoadState('domcontentloaded');

    // ── Timeline ───────────────────────────────────────────────────────────
    if (isMobile) {
      await mobileNavClick(page, 'mobile-nav-link-timeline');
    } else {
      await page.getByTestId('nav-link-timeline').click();
    }
    await expect(page).toHaveURL(/.*timeline/);
    await page.waitForLoadState('domcontentloaded');

    // ── Quiz ───────────────────────────────────────────────────────────────
    if (isMobile) {
      await mobileNavClick(page, 'mobile-nav-link-quiz');
    } else {
      await page.getByTestId('nav-link-quiz').click();
    }
    await expect(page).toHaveURL(/.*quiz/);
    await page.waitForLoadState('domcontentloaded');

    // ── Dashboard ──────────────────────────────────────────────────────────
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
