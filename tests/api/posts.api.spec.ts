import { test, expect } from '@playwright/test';

test.describe('JSONPlaceholder Posts API', () => {
  test('GET /posts/1 returns the expected post', async ({
    request,
  }, testInfo) => {
    const response = await request.get(
      'https://jsonplaceholder.typicode.com/posts/1',
    );

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const responseBody = await response.json();

    await testInfo.attach('GET posts 1 response', {
      body: JSON.stringify(responseBody, null, 2),
      contentType: 'application/json',
    });

    expect(responseBody).toMatchObject({
      id: 1,
      userId: 1,
    });

    expect(responseBody.title).toEqual(expect.any(String));
    expect(responseBody.body).toEqual(expect.any(String));
    expect(responseBody.title.length).toBeGreaterThan(0);
    expect(responseBody.body.length).toBeGreaterThan(0);
  });
});