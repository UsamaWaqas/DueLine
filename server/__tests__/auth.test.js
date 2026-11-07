const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const { createApp } = require('../src/app');

let mongod;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('auth + sync', () => {
  const email = 'test@example.com';
  const password = 'password123';
  let token;

  test('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  test('rejects duplicate registration', async () => {
    const res = await request(app).post('/api/auth/register').send({ email, password });
    expect(res.status).toBe(409);
  });

  test('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    token = res.body.token;
  });

  test('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('PUT then GET /api/sync round-trips the payload (last-write-wins)', async () => {
    const payload = { subscriptions: [{ id: '1', name: 'Netflix' }], settings: { monthlyBudget: 50 } };
    const putRes = await request(app)
      .put('/api/sync')
      .set('Authorization', `Bearer ${token}`)
      .send({ payload });
    expect(putRes.status).toBe(200);

    const getRes = await request(app).get('/api/sync').set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.payload).toEqual(payload);

    const secondPayload = { subscriptions: [], settings: { monthlyBudget: 75 } };
    await request(app).put('/api/sync').set('Authorization', `Bearer ${token}`).send({ payload: secondPayload });
    const getRes2 = await request(app).get('/api/sync').set('Authorization', `Bearer ${token}`);
    expect(getRes2.body.payload).toEqual(secondPayload);
  });

  test('rejects /api/sync without a token', async () => {
    const res = await request(app).get('/api/sync');
    expect(res.status).toBe(401);
  });
});
