import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../test-data/users';

test.describe('SauceDemo Authentication', () => {

  test('standard user can successfully login', async ({ page }) => {

    const loginPage = new LoginPage(page);

    await loginPage.goto();

    await loginPage.login(
      users.standard.username,
      users.standard.password
    );

    await expect(page).toHaveURL(/inventory/);

    await expect(page.locator('.title'))
      .toHaveText('Products');
  });

});

test('locked out user cannot login', async ({ page }) => {

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    users.lockedOut.username,
    users.lockedOut.password
  );

  await expect(
    page.locator('[data-test="error"]')
  ).toContainText('locked out');
});