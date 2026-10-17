import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pool } from './db.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '256kb' }));

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = configuredOrigins.length
  ? configuredOrigins
  : (isProduction ? [] : ['http://localhost:3000', 'http://localhost:5173']);

app.use(cors({
  origin(origin, callback) {
    // Requests without Origin are commonly health checks or server-to-server calls.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'sixseven-api',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/ready', async (_req, res) => {
  if (!pool) {
    return res.status(503).json({ service: 'sixseven-api', status: 'not_ready', reason: 'database_not_configured' });
  }

  try {
    await pool.query('SELECT 1');
    return res.status(200).json({ service: 'sixseven-api', status: 'ready', database: 'ok' });
  } catch {
    return res.status(503).json({ service: 'sixseven-api', status: 'not_ready', reason: 'database_unavailable' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use((err, _req, res, _next) => {
  if (err?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'payload_too_large' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'invalid_json' });
  }
  console.error('Unhandled API error');
  return res.status(500).json({ error: 'internal_server_error' });
});

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`SixSeven API listening on port ${port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}; shutting down SixSeven API`);
  server.close(async () => {
    if (pool) await pool.end();
    process.exit(0);
  });
}

process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
