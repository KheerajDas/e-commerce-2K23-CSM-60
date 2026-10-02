const request = require('supertest');
const app = require('../src/app');

test('health endpoint is available', async () => {
  const response = await request(app).get('/health');
  expect(response.statusCode).toBe(200);
  expect(response.body.status).toBe('ok');
});
