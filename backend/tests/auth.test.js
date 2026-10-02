const request = require('supertest');
const app = require('../src/app');

test('protected admin route rejects missing authentication', async () => {
  const response = await request(app).get('/api/v1/admin/products');
  expect(response.statusCode).toBe(401);
  expect(response.body.error.code).toBe('UNAUTHENTICATED');
});

test('unknown route returns consistent error shape', async () => {
  const response = await request(app).get('/does-not-exist');
  expect(response.statusCode).toBe(404);
  expect(response.body.error.code).toBe('NOT_FOUND');
});
