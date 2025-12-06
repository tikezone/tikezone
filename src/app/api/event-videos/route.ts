import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT ev.id, ev.video_url, ev.thumbnail_url, ev.title, ev.banner_text, ev.priority
       FROM event_videos ev
       WHERE ev.active = true
       ORDER BY ev.priority ASC, ev.created_at DESC
       LIMIT 20`
    );
    return NextResponse.json({ videos: result.rows });
  } catch (error) {
    console.error('Error fetching event videos:', error);
    return NextResponse.json({ videos: [] });
  }
}
