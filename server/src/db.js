import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

// Do not create a pool until a real connection string has been configured.
export const pool = connectionString
  ? new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
  : null;

if (pool) {
  pool.on('error', () => {
    // Avoid logging connection details or credentials.
    console.error('Unexpected idle PostgreSQL client error');
  });
}
