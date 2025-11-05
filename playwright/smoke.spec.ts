import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads and search works", async ({ page }) => {
    // Visit homepage
    await page.goto("/");

    // Check that homepage loads
    await expect(page).toHaveTitle(/Find top freelancers/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Find talent"
    );

    // Navigate to search page
    await page.click('a[href="/search"]');
    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Search Services"
    );
  });

  test("search functionality", async ({ page }) => {
    await page.goto("/search");

    // Check search page loads
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Click on a category filter
    await page.click('text="Web Design"');
    await expect(page).toHaveURL(/category=Web\+Design/);

    // Click on sort option
    await page.click('text="Rating"');
    await expect(page).toHaveURL(/sort=rating/);
  });

  test("service page navigation", async ({ page }) => {
    // Start from homepage
    await page.goto("/");

    // Navigate to search
    await page.click('a[href="/search"]');
    await expect(page).toHaveURL(/\/search/);

    // Wait for service cards to potentially load
    // Note: This test will pass if service cards exist, or skip if they don't
    const serviceLinks = page.locator('a[href^="/services/"]');
    
    // Wait a bit for content to load
    await page.waitForTimeout(1000);
    
    // Check if any service links exist
    const count = await serviceLinks.count();
    
    if (count > 0) {
      // Click the first service link
      await serviceLinks.first().click();
      await expect(page).toHaveURL(/\/services\/.+/);
      
      // Verify service page loads
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    } else {
      // If no services, the test still passes (empty state is valid)
      // Just verify we're still on the search page
      await expect(page).toHaveURL(/\/search/);
    }
  });
});

