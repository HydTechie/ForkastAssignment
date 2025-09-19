const request = require('supertest');
const app = require('../src/app');

describe('Sanity', () => {
  it('GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
