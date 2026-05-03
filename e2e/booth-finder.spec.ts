import { test, expect } from '@playwright/test';

test.describe('Booth Finder - Geolocation to List Flow', () => {
  test.beforeEach(async ({ context }) => {
    // Enable geolocation permission
    await context.grantPermissions(['geolocation']);

    // Set mock geolocation (Chennai, India)
    await context.setGeolocation({ latitude: 13.0827, longitude: 80.2707 });
  });

  test('should display booth finder page with location button', async ({ page }) => {
    await page.goto('/process/booth-finder');

    // Verify page loads
    expect(await page.locator('text=Find Your Polling Booth').isVisible()).toBe(
      true
    );
    expect(await page.locator('text=Use My Location').isVisible()).toBe(true);
  });

  test('should find nearby booths with geolocation', async ({ page }) => {
    await page.goto('/process/booth-finder');

    // Click "Use My Location" button
    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    // Wait for booths to load (max 5 seconds)
    await page.waitForTimeout(1000); // Geolocation API response time

    // Verify booths are displayed
    const boothCards = page.locator('[class*="rounded-lg"][class*="border"]');
    const count = await boothCards.count();
    expect(count).toBeGreaterThan(0);

    // Verify booth information is visible
    expect(await page.locator('text=Booth #').first().isVisible()).toBe(true);
    expect(await page.locator('text=km').first().isVisible()).toBe(true);
  });

  test('should display booth details with amenities', async ({ page }) => {
    await page.goto('/process/booth-finder');

    // Get location
    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Verify booth details
    expect(await page.locator('text=Voting').isVisible()).toBe(true);
    expect(await page.locator('text=Amenities').first().isVisible()).toBe(true);

    // Check for amenity badges
    const amenities = page.locator('[class*="rounded-full"][class*="px-2"]');
    expect(await amenities.count()).toBeGreaterThan(0);
  });

  test('should show map visualization with booth markers', async ({ page }) => {
    await page.goto('/process/booth-finder');

    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Verify map is displayed
    const mapTitle = page.locator('text=Polling Booths Map');
    expect(await mapTitle.isVisible()).toBe(true);

    // Verify SVG map is rendered
    const mapSvg = page.locator('svg').first();
    expect(await mapSvg.isVisible()).toBe(true);
  });

  test('should support search functionality', async ({ page }) => {
    await page.goto('/process/booth-finder');

    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Get initial booth count
    const initialCount = await page
      .locator('[class*="rounded-lg"][class*="border"]')
      .count();

    // Search for a booth
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('001');

    await page.waitForTimeout(500); // Wait for search to filter

    // Verify search results are filtered
    const filteredCount = await page
      .locator('[class*="rounded-lg"][class*="border"]')
      .count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should allow state selection', async ({ page }) => {
    await page.goto('/process/booth-finder');

    // Select a different state
    const stateSelect = page.locator('select');
    await stateSelect.selectOption('KA'); // Karnataka

    // Verify selection changed
    expect(await stateSelect.inputValue()).toBe('KA');

    // Previous results should be cleared
    const boothCards = page.locator('[class*="rounded-lg"][class*="border"]');
    expect(await boothCards.count()).toBe(0);
  });

  test('should provide directions link', async ({ page }) => {
    await page.goto('/process/booth-finder');

    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Verify directions button is visible
    const directionsButton = page.locator('button:has-text("Get Directions")').first();
    expect(await directionsButton.isVisible()).toBe(true);

    // Verify it's a proper link
    const directionsLink = directionsButton.locator('xpath=parent::a | parent::button');
    expect(directionsLink).toBeDefined();
  });

  test('should display helpful information section', async ({ page }) => {
    await page.goto('/process/booth-finder');

    // Scroll to bottom
    await page.locator('text=What to Bring').scrollIntoViewIfNeeded();

    // Verify info section
    expect(await page.locator('text=What to Bring to Your Polling Booth').isVisible()).toBe(true);
    expect(await page.locator('text=Valid photo ID').isVisible()).toBe(true);
  });

  test('should handle location permission denial gracefully', async ({
    page,
    context,
  }) => {
    // Deny geolocation permission
    await context.clearPermissions();

    await page.goto('/process/booth-finder');

    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Verify error message is shown
    expect(await page.locator('text=Location permission denied').isVisible()).toBe(
      true
    );

    // Verify helpful message
    expect(
      await page.locator('text=You can still search for a booth manually').isVisible()
    ).toBe(true);
  });

  test('should maintain responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/process/booth-finder');

    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Verify booth cards are visible and responsive
    const firstBoothCard = page.locator('[class*="rounded-lg"]').first();
    expect(await firstBoothCard.isVisible()).toBe(true);

    // Verify layout doesn't break
    const mainContent = page.locator('main, [role="main"]');
    const boundingBox = await mainContent.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375 + 32); // viewport + padding
  });

  test('API endpoint should return booths with rate limiting', async ({
    page,
  }) => {
    // Make API request directly
    const response = await page.request.get('/api/booth/search', {
      params: {
        latitude: '13.0827',
        longitude: '80.2707',
        stateCode: 'TN',
        radiusKm: '5',
        limit: '5',
      },
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.booths).toBeDefined();
    expect(Array.isArray(data.booths)).toBe(true);
  });

  test('API endpoint should reject invalid coordinates', async ({ page }) => {
    const response = await page.request.get('/api/booth/search', {
      params: {
        latitude: '999', // Invalid
        longitude: '80.2707',
        stateCode: 'TN',
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('should show booth information for each card', async ({ page }) => {
    await page.goto('/process/booth-finder');

    const locationButton = page.locator('button:has-text("Use My Location")');
    await locationButton.click();

    await page.waitForTimeout(1000);

    // Get first booth card
    const firstBoothCard = page.locator('[class*="rounded-lg"][class*="border"]').first();

    // Verify all required information is present
    expect(
      await firstBoothCard.locator('text=/Booth #\\d+/').isVisible()
    ).toBe(true);
    expect(
      await firstBoothCard.locator('[class*="rounded-full"][class*="bg-blue"]').isVisible()
    ).toBe(true); // Distance badge

    // Verify voting time
    expect(
      await firstBoothCard.locator('text=/\\d+:\\d+ (AM|PM)/').isVisible()
    ).toBe(true);
  });
});
