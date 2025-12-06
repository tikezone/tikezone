import { NextRequest, NextResponse } from 'next/server';
import { fetchEventsFromDb, createEventWithTickets } from '../../../lib/eventsRepository';
import { Event } from '../../../types';
import { verifySession } from '../../../lib/session';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const category = (searchParams.get('category') || 'all') as any;
  const search = searchParams.get('search') || '';
  const dateFilter = (searchParams.get('dateFilter') || 'all') as any;
  const priceFilter = (searchParams.get('priceFilter') || 'all') as any;
  const flags = {
    featured: searchParams.get('featured') === 'true',
    trending: searchParams.get('trending') === 'true',
    eventOfYear: searchParams.get('eventOfYear') === 'true',
    verified: searchParams.get('verified') === 'true',
  };

  try {
    const result = await fetchEventsFromDb(page, category, search, dateFilter, priceFilter, flags);
    return NextResponse.json(result);
  } catch (err) {
    console.error('API /events GET failed', err);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Event;
    if (!body.title || !body.date || !body.location || !body.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get user ID from session to link event to organizer
    let userId: string | undefined;
    try {
      const token = req.cookies.get('auth_token')?.value;
      const session = verifySession(token);
      if (session?.sub) {
        userId = session.sub;
      }
    } catch {
      // Session verification failed, continue without userId
    }
    
    await createEventWithTickets(body, userId);
    return NextResponse.json({ id: body.id }, { status: 201 });
  } catch (err) {
    const pgCode = (err as any)?.code;
    const msg = (err as Error)?.message;
    console.error('API /events POST failed', err);
    if (msg === 'INVALID_DATE') {
      return NextResponse.json({ error: 'Date invalide. Utilise jj/mm/aaaa et heure (HH:MM).' }, { status: 400 });
    }
    if (pgCode === '23505') {
      return NextResponse.json({ error: 'Ce slug existe déjà. Choisis un lien unique.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
