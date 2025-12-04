import { query } from './db';

const EXPIRY_MINUTES = 10;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export async function createEmailVerification(email: string, code: string) {
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
  await query(
    `INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3)`,
    [email.toLowerCase(), code, expiresAt.toISOString()]
  );
}

export async function countRecentEmailVerifications(email: string) {
  const res = await query<{ count: string }>(
    `SELECT COUNT(*) FROM email_verifications WHERE email = $1 AND created_at >= now() - interval '${RATE_LIMIT_WINDOW_MINUTES} minutes'`,
    [email.toLowerCase()]
  );
  return parseInt(res.rows[0]?.count || '0', 10);
}

export async function verifyEmailCode(email: string, code: string) {
  const res = await query(
    `SELECT id, expires_at, used FROM email_verifications WHERE email = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1`,
    [email.toLowerCase(), code]
  );
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  const expired = new Date(row.expires_at).getTime() < Date.now();
  if (expired || row.used) return null;
  await query(`UPDATE email_verifications SET used = true WHERE id = $1`, [row.id]);
  return row.id as string;
}
