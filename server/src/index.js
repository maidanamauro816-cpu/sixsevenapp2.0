import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT || 4000);
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(helmet());

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

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use((err, _req, res, _next) => {
  if (err?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: 'origin_not_allowed' });
  }
  console.error('Unhandled API error');
  return res.status(500).json({ error: 'internal_server_error' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`SixSeven API listening on port ${port}`);
});
