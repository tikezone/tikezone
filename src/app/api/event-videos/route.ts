import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT ev.id, ev.video_url, ev.thumbnail_url, ev.title as video_title,
              e.id as event_id, e.title, e.slug, e.date, e.location, e.category
       FROM event_videos ev
       JOIN events e ON ev.event_id = e.id
       WHERE ev.active = true AND e.status = 'published' AND e.date >= NOW()
       ORDER BY ev.priority ASC, e.date ASC
       LIMIT 6`
    );
    return NextResponse.json({ videos: result.rows });
  } catch (error) {
    console.error('Error fetching event videos:', error);
    return NextResponse.json({ videos: [] });
  }
}
