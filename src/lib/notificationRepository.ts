import { query } from './db';

export type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export async function listNotifications(userId: string, limit = 20) {
  const res = await query<NotificationRow>(
    `SELECT id, user_id, title, body, type, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
}

export async function markAllRead(userId: string) {
  await query(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, [userId]);
}

export async function createNotification(userId: string, title: string, body: string, type: string = 'info') {
  const res = await query<NotificationRow>(
    `INSERT INTO notifications (user_id, title, body, type) VALUES ($1,$2,$3,$4) RETURNING id, user_id, title, body, type, is_read, created_at`,
    [userId, title, body, type]
  );
  return res.rows[0];
}
