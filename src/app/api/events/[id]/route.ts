import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { deleteObjectsByUrl, signUrlIfR2 } from '../../../../lib/storage';
import { Event, TicketTier } from '../../../../types';

const toEvent = (row: any): Event => {
  const dateValue = row.date instanceof Date ? row.date.toISOString() : row.date;
  const ticketTypes: TicketTier[] = Array.isArray(row.ticket_types)
    ? row.ticket_types.filter(Boolean).map((t: any) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        description: t.description || '',
        style: t.style || 'standard',
        tag: t.tag || undefined,
        promoType: t.promo_type || undefined,
        promoValue: t.promo_value || undefined,
        promoCode: t.promo_code || undefined,
        available: t.available ?? t.quantity,
      }))
    : [];

  return {
    id: row.id,
    title: row.title,
    date: dateValue,
    location: row.location,
    price: row.price,
    imageUrl: row.image_url,
    images: row.images || [],
    videoUrl: row.video_url || undefined,
    category: row.category,
    organizer: row.organizer,
    slug: row.slug || undefined,
    description: row.description || undefined,
    isPopular: row.is_popular,
    isPromo: row.is_promo,
    discountPercent: row.discount_percent || undefined,
    isTrending: row.is_trending,
    isFeatured: row.is_featured,
    isEventOfYear: row.is_event_of_year,
    isVerified: row.is_verified,
    spot: row.spot || undefined,
    djLineup: row.dj_lineup || undefined,
    dressCode: row.dress_code || undefined,
    waterSecurity: row.water_security || undefined,
    categoryDetails: row.category_details || undefined,
    ticketTypes,
    availableTickets:
      ticketTypes.length > 0
        ? ticketTypes.reduce((acc, t) => acc + (t.available ?? t.quantity ?? 0), 0)
        : row.available_tickets || 0,
    visibility: row.visibility || 'public',
    accessCode: row.access_code || undefined,
    status: row.status || 'published',
  };
};

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const result = await query(
      `
      SELECT 
        e.*,
        COALESCE(json_agg(
          json_build_object(
            'id', t.id,
            'name', t.name,
            'price', t.price,
            'quantity', t.quantity,
            'description', t.description,
            'style', t.style,
            'tag', t.tag,
            'promo_type', t.promo_type,
            'promo_value', t.promo_value,
            'promo_code', t.promo_code,
            'available', t.available
          )
        ) FILTER (WHERE t.id IS NOT NULL), '[]') AS ticket_types
      FROM events e
      LEFT JOIN ticket_tiers t ON t.event_id = e.id
      WHERE e.id::text = $1 OR e.slug = $1
      GROUP BY e.id
      `,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const event = toEvent(result.rows[0]);
    await signEventAssets(event);
    return NextResponse.json(event);
  } catch (err) {
    console.error('API /events/:id GET failed', err);
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowed = [
      'title','description','category','date','location','price','imageUrl','videoUrl','organizer','slug',
      'isPopular','isPromo','discountPercent','isTrending','isFeatured','isEventOfYear','isVerified',
      'visibility','accessCode','status',
      'spot','djLineup','dressCode','waterSecurity','categoryDetails'
    ];
    for (const key of allowed) {
      if (key in body) {
        fields.push(`${mapField(key)} = $${idx++}`);
        values.push(body[key]);
      }
    }
    if (fields.length === 0) {
      return NextResponse.json({ error: 'No valid fields' }, { status: 400 });
    }
    values.push(id);
    const sql = `UPDATE events SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}`;
    await query(sql, values);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('API /events/:id PATCH failed', err);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const found = await query(
      `SELECT id, image_url, images, video_url FROM events WHERE id = $1 OR slug = $1`,
      [id]
    );
    if (found.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const eventRow = found.rows[0];
    const eventId = eventRow.id;

    const urls: string[] = [];
    if (eventRow.image_url) urls.push(eventRow.image_url);
    if (Array.isArray(eventRow.images)) urls.push(...eventRow.images);
    if (eventRow.video_url) urls.push(eventRow.video_url);

    await deleteObjectsByUrl(urls);

    await query(`DELETE FROM events WHERE id = $1`, [eventId]);
    // ON DELETE CASCADE will clean ticket_tiers, bookings, favorites, agent_event_access

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('API /events/:id DELETE failed', err);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}

const mapField = (key: string) => {
  switch (key) {
    case 'imageUrl': return 'image_url';
    case 'videoUrl': return 'video_url';
    case 'isPopular': return 'is_popular';
    case 'isPromo': return 'is_promo';
    case 'discountPercent': return 'discount_percent';
    case 'isTrending': return 'is_trending';
    case 'isFeatured': return 'is_featured';
    case 'isEventOfYear': return 'is_event_of_year';
    case 'isVerified': return 'is_verified';
    case 'djLineup': return 'dj_lineup';
    case 'waterSecurity': return 'water_security';
    case 'dressCode': return 'dress_code';
    case 'categoryDetails': return 'category_details';
    default: return key;
  }
};

async function signEventAssets(evt: Event) {
  try {
    const signed = await signUrlIfR2(evt.imageUrl);
    if (signed) evt.imageUrl = signed;
    if (Array.isArray(evt.images) && evt.images.length > 0) {
      const signedImages = await Promise.all(evt.images.map((img) => signUrlIfR2(img)));
      evt.images = signedImages.filter(Boolean) as string[];
    }
  } catch (err) {
    console.error('signEventAssets error', err);
  }
}
