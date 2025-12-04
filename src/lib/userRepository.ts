import { query } from './db';

export async function findUserByEmail(email: string) {
  const res = await query(
    `SELECT id, email, full_name, password_hash, role, email_verified, last_login_at, avatar_url FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );
  return res.rows[0] || null;
}

export async function createUser(fullName: string, email: string, passwordHash: string) {
  const res = await query(
    `INSERT INTO users (full_name, email, password_hash, email_verified, role, avatar_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, full_name, role, email_verified, avatar_url`,
    [fullName, email.toLowerCase(), passwordHash, false, 'customer', null]
  );
  return res.rows[0];
}

export async function setEmailVerified(email: string) {
  await query(`UPDATE users SET email_verified = true, updated_at = now() WHERE email = $1`, [email.toLowerCase()]);
}

export async function updatePassword(email: string, passwordHash: string) {
  await query(`UPDATE users SET password_hash = $1, updated_at = now() WHERE email = $2`, [passwordHash, email.toLowerCase()]);
}

export async function updateLastLogin(userId: string) {
  await query(`UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1`, [userId]);
}

export async function updateAvatarUrl(userId: string, avatarUrl: string) {
  await query(`UPDATE users SET avatar_url = $1, updated_at = now() WHERE id = $2`, [avatarUrl, userId]);
}

export async function upgradeToOrganizer(userId: string) {
  await query(`UPDATE users SET role = 'organizer', updated_at = now() WHERE id = $1`, [userId]);
}
