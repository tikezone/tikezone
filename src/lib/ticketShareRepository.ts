import { query } from './db';

const SHARE_LIMIT = 3;
const WINDOW_MINUTES = 60;

export type BookingWithEvent = {
  id: string;
  event_id: string;
  title: string;
  date: string;
  location: string;
  ticket_tier_name?: string;
  user_id: string;
};

export async function rateLimitExceeded(userId: string) {
  const res = await query<{ count: string }>(
    `SELECT COUNT(*) FROM ticket_shares WHERE user_id = $1 AND created_at >= now() - interval '${WINDOW_MINUTES} minutes'`,
    [userId]
  );
  const count = parseInt(res.rows[0]?.count || '0', 10);
  return count >= SHARE_LIMIT;
}

export async function getBookingForUser(bookingId: string, userId: string): Promise<BookingWithEvent | null> {
  const res = await query(
    `
      SELECT 
        b.id,
        b.event_id,
        b.user_id,
        e.title,
        e.date,
        e.location,
        tt.name as ticket_tier_name
      FROM bookings b
      JOIN events e ON e.id = b.event_id
      LEFT JOIN ticket_tiers tt ON tt.id = b.ticket_tier_id
      WHERE b.id = $1 AND b.user_id = $2
      LIMIT 1
    `,
    [bookingId, userId]
  );
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    event_id: row.event_id,
    title: row.title,
    date: row.date instanceof Date ? row.date.toISOString() : row.date,
    location: row.location,
    ticket_tier_name: row.ticket_tier_name || undefined,
    user_id: row.user_id,
  };
}

export async function recordShare(bookingId: string, userId: string, toEmail: string, message?: string) {
  await query(
    `INSERT INTO ticket_shares (booking_id, user_id, to_email, message) VALUES ($1, $2, $3, $4)`,
    [bookingId, userId, toEmail.toLowerCase(), message || null]
  );
}
