import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const internalHeader = req.headers.get('x-internal-request');
  if (internalHeader !== 'true') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const subdomain = searchParams.get('sub');

  if (!subdomain) {
    return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 });
  }

  try {
    const result = await query(
      `SELECT slug, id FROM events WHERE custom_subdomain = $1 LIMIT 1`,
      [subdomain.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const event = result.rows[0];
    return NextResponse.json({ 
      slug: event.slug || event.id,
      id: event.id 
    });
  } catch (err) {
    console.error('Subdomain lookup error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
