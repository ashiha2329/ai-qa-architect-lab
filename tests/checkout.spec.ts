import { test, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
/* import { allure } from 'allure-playwright'; USE NEWER API*/
import { customers } from '../test-data/customers';
/* import { test, expect } from '@playwright/test'; */
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { users } from '../test-data/users';

test.describe('SauceDemo Checkout', () => {

  test('standard user can complete an order', async ({ page }) => {

    await allure.epic('E-Commerce');
    await allure.feature('Checkout');
    await allure.story('Complete Purchase');
    await allure.severity('critical');
    await allure.owner('QA Automation');
    await allure.tag('smoke');

    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();

    await loginPage.login(
      users.standard.username,
      users.standard.password
    );

    await productsPage.addBackpackToCart();

    await expect(page.locator('.shopping_cart_badge'))
      .toHaveText('1');

    await productsPage.openCart();

    await expect(page)
      .toHaveURL(/cart/);

    await cartPage.checkout();
/*
    await checkoutPage.enterCustomerInfo(
      'Test',
      'User',
      '08527'
    );
*/
    await checkoutPage.enterCustomerInfo(
  customers.validCustomer.firstName,
  customers.validCustomer.lastName,
  customers.validCustomer.postalCode
   );


    await checkoutPage.finishOrder();

    await expect(checkoutPage.completeHeader)
      .toHaveText('Thank you for your order!');
  //      .toHaveText('Order completed successfully!');
  });

});