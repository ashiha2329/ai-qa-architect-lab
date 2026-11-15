import { expect, test } from '@playwright/test';
import { shopifyStore } from '../test-data/shopify-store';

test.use({
  baseURL: shopifyStore.baseURL,
  trace: 'off',
  video: 'off',
});

test(`${shopifyStore.name} carries ${shopifyStore.expectedProductName} into checkout`, async ({ page }) => {
  const password = process.env.SHOPIFY_STOREFRONT_PASSWORD;
  test.skip(!password, 'Set SHOPIFY_STOREFRONT_PASSWORD to run this test.');

 await page.goto(shopifyStore.productPath);

  const passwordField = page.locator('input[type="password"]');
  if (new URL(page.url()).pathname === '/password') {
    //await passwordField.fill(password!);
    await passwordField.evaluate((element, value) => {
      const input = element as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, password!);

    await passwordField.press('Enter');
    await expect(page).not.toHaveURL(/\/password(?:[/?#]|$)/);
    await page.goto(shopifyStore.productPath);
  }

  await page.getByRole('button', { name: /^add to cart$/i }).click();

  // Wait for Shopify to save the item before opening the full cart page.
  await expect.poll(async () => {
    const response = await page.request.get('/cart.js');
    return response.ok() ? (await response.json()).item_count : -1;
  }).toBe(1);

  // await page.goto('/cart');
  // await page.pause();
  // await page.getByRole('button', { name: /^checkout$/i }).click();
  await page.getByRole('button', { name: 'Check out' }).click();
  await expect(page).toHaveURL(/\/checkouts\//);
  await expect(
    page.getByText(shopifyStore.expectedProductName, { exact: true }).first()
  ).toBeVisible();
});