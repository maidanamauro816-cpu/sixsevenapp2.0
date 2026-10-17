import 'dotenv/config';
import { createApp } from './app.js';
import { pool } from './db.js';

const port = Number(process.env.PORT || 4000);
const app = createApp();

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
