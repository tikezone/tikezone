import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { verifySession } from '../../../../lib/session';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const result = await query(
      `SELECT ev.*, e.title as event_title 
       FROM event_videos ev
       LEFT JOIN events e ON ev.event_id = e.id
       ORDER BY ev.priority ASC, ev.created_at DESC`
    );
    
    const events = await query(
      `SELECT id, title FROM events WHERE status = 'published' ORDER BY date DESC LIMIT 50`
    );
    
    return NextResponse.json({ 
      videos: result.rows,
      events: events.rows
    });
  } catch (error) {
    console.error('Error fetching event videos:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const { video_url, thumbnail_url, title, banner_text, active, priority } = await req.json();
    if (!video_url) {
      return NextResponse.json({ error: 'URL video requise' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO event_videos (video_url, thumbnail_url, title, banner_text, active, priority) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [video_url, thumbnail_url || null, title || null, banner_text || null, active !== false, priority || 0]
    );
    return NextResponse.json({ video: result.rows[0] });
  } catch (error) {
    console.error('Error creating event video:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const { id, video_url, thumbnail_url, title, banner_text, active, priority } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const result = await query(
      `UPDATE event_videos SET 
       video_url = COALESCE($2, video_url),
       thumbnail_url = COALESCE($3, thumbnail_url),
       title = COALESCE($4, title),
       banner_text = $5,
       active = COALESCE($6, active), 
       priority = COALESCE($7, priority), 
       updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, video_url, thumbnail_url, title, banner_text, active, priority]
    );
    return NextResponse.json({ video: result.rows[0] });
  } catch (error) {
    console.error('Error updating event video:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  const session = verifySession(token);
  if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Acces refuse' }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    await query(`DELETE FROM event_videos WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event video:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
