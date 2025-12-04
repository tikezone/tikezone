import { query } from './db';
import bcrypt from 'bcryptjs';

const EXPIRY_MINUTES = 15;

const hashToken = (token: string) => bcrypt.hash(token, 10);

export async function createResetToken(email: string, token: string) {
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
  const tokenHash = await hashToken(token);
  await query(
    `INSERT INTO password_resets (email, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [email.toLowerCase(), tokenHash, expiresAt.toISOString()]
  );
}

export async function findValidReset(email: string, token: string) {
  const res = await query(
    `SELECT id, token_hash, expires_at, used FROM password_resets WHERE email = $1 AND used = false ORDER BY created_at DESC LIMIT 1`,
    [email.toLowerCase()]
  );
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  const expired = new Date(row.expires_at).getTime() < Date.now();
  if (expired) return null;
  const match = await bcrypt.compare(token, row.token_hash);
  if (!match) return null;
  return row.id as string;
}

export async function markResetUsed(id: string) {
  await query(`UPDATE password_resets SET used = true WHERE id = $1`, [id]);
}
