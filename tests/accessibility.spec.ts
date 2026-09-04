import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('login page has no automatically detectable accessibility violations', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    await testInfo.attach('Axe WCAG 2 A and AA scan results', {
      body: JSON.stringify(
        {
          scannedUrl: accessibilityScanResults.url,
          violationsFound: accessibilityScanResults.violations.length,
          violations: accessibilityScanResults.violations,
        },
        null,
        2,
      ),
      contentType: 'application/json',
    });

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});