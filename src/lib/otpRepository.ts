import { query } from './db';

const EXPIRY_MINUTES = 5;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export async function cleanupExpiredOtp() {
  await query(`DELETE FROM otp_codes WHERE expires_at < now()`);
}

export async function countRecentOtp(email: string) {
  const res = await query<{ count: string }>(
    `SELECT COUNT(*) FROM otp_codes WHERE email = $1 AND created_at >= now() - interval '${RATE_LIMIT_WINDOW_MINUTES} minutes'`,
    [email.toLowerCase()]
  );
  return parseInt(res.rows[0]?.count || '0', 10);
}

export async function createOtp(email: string, code: string) {
  await cleanupExpiredOtp();
  const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);
  await query(
    `INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)`,
    [email.toLowerCase(), code, expiresAt.toISOString()]
  );
}

export async function verifyOtp(email: string, code: string) {
  await cleanupExpiredOtp();
  const res = await query(
    `SELECT id, expires_at FROM otp_codes WHERE email = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1`,
    [email.toLowerCase(), code]
  );
  if (res.rowCount === 0) return false;
  const otpId = res.rows[0].id;
  await query(`DELETE FROM otp_codes WHERE id = $1`, [otpId]);
  return true;
}
