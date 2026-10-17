import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

test('GET /health reports the API process as alive', async () => {
  const response = await request(createApp()).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.service, 'sixseven-api');
  assert.equal(response.body.status, 'ok');
  assert.ok(Number.isNaN(Date.parse(response.body.timestamp)) === false);
});

test('GET /ready fails safely when PostgreSQL is not configured', async () => {
  if (process.env.DATABASE_URL) {
    // The test environment may provide a database; this case is covered by integration checks.
    return;
  }
  const response = await request(createApp()).get('/ready');
  assert.equal(response.status, 503);
  assert.equal(response.body.reason, 'database_not_configured');
});

test('unknown routes return a structured 404', async () => {
  const response = await request(createApp()).get('/route-that-does-not-exist');
  assert.equal(response.status, 404);
  assert.equal(response.body.error, 'not_found');
});

test('JSON bodies over the configured limit are rejected', async () => {
  const app = createApp();
  app.post('/test-body', (_req, res) => res.status(200).json({ ok: true }));
  const response = await request(app)
    .post('/test-body')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify({ value: 'x'.repeat(270 * 1024) }));
  assert.equal(response.status, 413);
  assert.equal(response.body.error, 'payload_too_large');
});

test('requests from disallowed origins are rejected', async () => {
  const previous = process.env.CORS_ORIGIN;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.CORS_ORIGIN = 'https://sixseven.example';
  process.env.NODE_ENV = 'production';
  try {
    const response = await request(createApp())
      .get('/health')
      .set('Origin', 'https://untrusted.example');
    assert.equal(response.status, 403);
    assert.equal(response.body.error, 'origin_not_allowed');
  } finally {
    if (previous === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = previous;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});
