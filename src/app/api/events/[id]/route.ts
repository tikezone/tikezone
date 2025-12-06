import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { deleteObjectsByUrl, signUrlIfR2 } from '../../../../lib/storage';
import { Event, TicketTier } from '../../../../types';

const toEvent = (row: any): Event => {
  const dateValue = row.date instanceof Date ? row.date.toISOString() : row.date;
  const dateObj = row.date instanceof Date ? row.date : new Date(row.date);
  const timeValue = !isNaN(dateObj.getTime()) 
    ? dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Abidjan' })
    : undefined;
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
    time: timeValue,
    location: row.location,
    price: row.price,
    imageUrl: row.image_url,
    images: row.images || [],
    videoUrl: row.video_url || undefined,
    category: row.category,
    organizer: row.organizer,
    organizerName: row.org_company_name || row.org_full_name || row.organizer || undefined,
    organizerPhone: row.org_phone || undefined,
    organizerWebsite: row.org_website || undefined,
    organizerFacebook: row.org_facebook || undefined,
    organizerInstagram: row.org_instagram || undefined,
    organizerTiktok: row.org_tiktok || undefined,
    organizerLogo: row.org_logo_url || undefined,
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
    customSubdomain: row.custom_subdomain || undefined,
  };
};

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const result = await query(
      `
      SELECT 
        e.*,
        u.full_name AS org_full_name,
        op.company_name AS org_company_name,
        op.phone AS org_phone,
        op.website AS org_website,
        op.facebook AS org_facebook,
        op.instagram AS org_instagram,
        op.tiktok AS org_tiktok,
        op.logo_url AS org_logo_url,
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
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN organizer_profiles op ON op.user_id = e.user_id
      LEFT JOIN ticket_tiers t ON t.event_id = e.id
      WHERE e.id::text = $1 OR e.slug = $1
      GROUP BY e.id, u.full_name, op.company_name, op.phone, op.website, op.facebook, op.instagram, op.tiktok, op.logo_url
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
      'visibility','accessCode','status','customSubdomain',
      'spot','djLineup','dressCode','waterSecurity','categoryDetails'
    ];
    for (const key of allowed) {
      if (key in body) {
        fields.push(`${mapField(key)} = $${idx++}`);
        values.push(body[key]);
      }
    }
    
    if (fields.length > 0) {
      values.push(id);
      const sql = `UPDATE events SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx}`;
      await query(sql, values);
    }

    if (body.ticketTypes && Array.isArray(body.ticketTypes)) {
      const existingTickets = await query(
        `SELECT id, quantity, available FROM ticket_tiers WHERE event_id = $1`,
        [id]
      );
      const existingMap = new Map<string, { quantity: number; available: number }>();
      for (const row of existingTickets.rows) {
        existingMap.set(row.id, { quantity: row.quantity, available: row.available });
      }
      
      const isValidUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
      const incomingIds = new Set(
        body.ticketTypes.filter((t: any) => t.id && isValidUuid(t.id)).map((t: any) => t.id)
      );

      const deletionErrors: string[] = [];
      for (const existingId of existingMap.keys()) {
        if (!incomingIds.has(existingId)) {
          const hasBookings = await query(
            `SELECT 1 FROM bookings WHERE ticket_tier_id = $1 LIMIT 1`,
            [existingId]
          );
          if (hasBookings.rows.length > 0) {
            const ticketName = await query(
              `SELECT name FROM ticket_tiers WHERE id = $1`,
              [existingId]
            );
            deletionErrors.push(ticketName.rows[0]?.name || existingId);
          } else {
            await query(`DELETE FROM ticket_tiers WHERE id = $1`, [existingId]);
          }
        }
      }
      
      if (deletionErrors.length > 0) {
        return NextResponse.json({ 
          error: `Impossible de supprimer les tickets avec des réservations: ${deletionErrors.join(', ')}` 
        }, { status: 400 });
      }

      for (const ticket of body.ticketTypes) {
        const hasValidUuid = ticket.id && isValidUuid(ticket.id);
        const isExisting = hasValidUuid && existingMap.has(ticket.id);
        
        if (typeof ticket.quantity === 'number' && ticket.quantity < 0) {
          return NextResponse.json({ 
            error: `La quantité de "${ticket.name || 'Ticket'}" ne peut pas être négative` 
          }, { status: 400 });
        }
        
        if (!isExisting) {
          const quantity = typeof ticket.quantity === 'number' ? ticket.quantity : 100;
          const rawAvailable = typeof ticket.available === 'number' ? ticket.available : null;
          const available = rawAvailable !== null ? rawAvailable : quantity;
          
          if (available < 0) {
            return NextResponse.json({ 
              error: `La disponibilité de "${ticket.name || 'Nouveau ticket'}" ne peut pas être négative` 
            }, { status: 400 });
          }
          if (available > quantity) {
            return NextResponse.json({ 
              error: `La disponibilité de "${ticket.name || 'Nouveau ticket'}" ne peut pas dépasser la quantité` 
            }, { status: 400 });
          }
          
          const ticketUuid = hasValidUuid ? ticket.id : null;
          
          await query(
            `INSERT INTO ticket_tiers (
              id, event_id, name, price, quantity, description, style, tag, 
              promo_type, promo_value, promo_code, available
            ) VALUES (
              COALESCE($12::uuid, gen_random_uuid()), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            )`,
            [
              id,
              ticket.name || 'Ticket',
              ticket.price ?? 0,
              quantity,
              ticket.description || '',
              ticket.style || 'standard',
              ticket.tag || null,
              ticket.promoType || null,
              ticket.promoValue || null,
              ticket.promoCode || null,
              available,
              ticketUuid,
            ]
          );
        } else {
          const oldData = existingMap.get(ticket.id)!;
          const newQuantity = typeof ticket.quantity === 'number' ? ticket.quantity : oldData.quantity;
          const sold = oldData.quantity - oldData.available;
          
          if (newQuantity < sold) {
            return NextResponse.json({ 
              error: `Impossible de réduire la quantité de "${ticket.name}" en-dessous de ${sold} (déjà vendus)` 
            }, { status: 400 });
          }
          
          let newAvailable: number;
          const rawAvailable = typeof ticket.available === 'number' ? ticket.available : null;
          
          if (rawAvailable !== null) {
            if (rawAvailable < 0) {
              return NextResponse.json({ 
                error: `La disponibilité de "${ticket.name}" ne peut pas être négative` 
              }, { status: 400 });
            }
            if (rawAvailable > newQuantity) {
              return NextResponse.json({ 
                error: `La disponibilité de "${ticket.name}" ne peut pas dépasser la quantité` 
              }, { status: 400 });
            }
            const impliedSold = newQuantity - rawAvailable;
            if (impliedSold < sold) {
              return NextResponse.json({ 
                error: `La disponibilité de "${ticket.name}" implique moins de ${sold} tickets vendus, ce qui est incorrect` 
              }, { status: 400 });
            }
            newAvailable = rawAvailable;
          } else if (typeof ticket.quantity === 'number' && ticket.quantity !== oldData.quantity) {
            newAvailable = newQuantity - sold;
          } else {
            newAvailable = oldData.available;
          }
          
          await query(
            `UPDATE ticket_tiers SET 
              name = $2, price = $3, quantity = $4, available = $5, description = $6, 
              style = $7, tag = $8, promo_type = $9, promo_value = $10, promo_code = $11
            WHERE id = $1`,
            [
              ticket.id,
              ticket.name || 'Ticket',
              ticket.price ?? 0,
              newQuantity,
              newAvailable,
              ticket.description || '',
              ticket.style || 'standard',
              ticket.tag || null,
              ticket.promoType || null,
              ticket.promoValue || null,
              ticket.promoCode || null,
            ]
          );
        }
      }
    }

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
    case 'customSubdomain': return 'custom_subdomain';
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
