import { Pool, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    const ssl =
      process.env.DATABASE_SSL === 'disable' ? false : { rejectUnauthorized: false };

    pool = new Pool({
      connectionString,
      ssl,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = any>(text: string, params: any[] = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(text, params);
    return result;
  } finally {
    client.release();
  }
}
