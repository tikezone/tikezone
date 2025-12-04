import { query } from './db';
import { Event, TicketTier, CategoryId, DateFilter, PriceFilter } from '../types';
import { getPool } from './db';

const ITEMS_PER_PAGE = 12;

const toEvent = (row: any): Event => {
  const dateValue = row.date instanceof Date ? row.date.toISOString() : row.date;
  const ticketTypes: TicketTier[] = Array.isArray(row.ticket_types)
    ? row.ticket_types.filter(Boolean).map((t: any) => ({
        id: t.id,
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        description: t.description || '',
        style: (t.style as TicketTier['style']) || 'standard',
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

type EventFlags = {
  featured?: boolean;
  eventOfYear?: boolean;
  verified?: boolean;
};

export async function fetchEventsFromDb(
  page: number,
  category: CategoryId,
  search: string,
  dateFilter: DateFilter,
  priceFilter: PriceFilter,
  flags: EventFlags = {}
) {
  const offset = (page - 1) * ITEMS_PER_PAGE;
  const values: any[] = [];
  const where: string[] = [];

  if (category && category !== 'all') {
    values.push(category);
    where.push(`e.category = $${values.length}`);
  }

  if (search) {
    values.push(`%${search.toLowerCase()}%`);
    where.push(`(LOWER(e.title) LIKE $${values.length} OR LOWER(e.location) LIKE $${values.length})`);
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (dateFilter === 'today') {
    values.push(startOfToday.toISOString());
    values.push(new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000).toISOString());
    where.push(`e.date >= $${values.length - 1} AND e.date < $${values.length}`);
  } else if (dateFilter === 'tomorrow') {
    const tmr = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
    values.push(tmr.toISOString());
    values.push(new Date(tmr.getTime() + 24 * 60 * 60 * 1000).toISOString());
    where.push(`e.date >= $${values.length - 1} AND e.date < $${values.length}`);
  } else if (dateFilter === 'weekend') {
    // Friday to Sunday inclusive
    const day = startOfToday.getDay(); // 0 Sunday ... 6 Saturday
    const diffToFriday = (5 - day + 7) % 7;
    const friday = new Date(startOfToday.getTime() + diffToFriday * 24 * 60 * 60 * 1000);
    const monday = new Date(friday.getTime() + 3 * 24 * 60 * 60 * 1000);
    values.push(friday.toISOString());
    values.push(monday.toISOString());
    where.push(`e.date >= $${values.length - 1} AND e.date < $${values.length}`);
  }

  if (priceFilter && priceFilter !== 'all') {
    if (priceFilter === 'free') {
      where.push('e.price = 0');
    } else if (priceFilter === 'under-5000') {
      where.push('e.price > 0 AND e.price < 5000');
    } else if (priceFilter === 'under-10000') {
      where.push('e.price < 10000');
    } else if (priceFilter === 'premium') {
      where.push('e.price >= 20000');
    }
  }

  if (flags.featured) {
    where.push('e.is_featured = TRUE');
  }
  if (flags.eventOfYear) {
    where.push('e.is_event_of_year = TRUE');
  }
  if (flags.verified) {
    where.push('e.is_verified = TRUE');
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const dataQuery = `
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
    ${whereClause}
    GROUP BY e.id
    ORDER BY e.date ASC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `;

  const countQuery = `SELECT COUNT(*) FROM events e ${whereClause}`;

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, values),
    query<{ count: string }>(countQuery, values),
  ]);

  const totalItems = parseInt(countResult.rows[0]?.count || '0', 10);
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  return {
    data: dataResult.rows.map(toEvent),
    meta: {
      currentPage: page,
      totalPages,
      totalItems,
    },
  };
}

export async function createEventWithTickets(event: Event) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const slug = event.slug || slugify(event.title);

    const insertEvent = `
      INSERT INTO events (
        id, title, description, category, date, location, price, image_url, video_url,
        organizer, slug, is_popular, is_promo, discount_percent, is_trending, visibility, access_code, status,
        is_featured, is_event_of_year, is_verified, spot, dj_lineup, dress_code, water_security
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25
      )
      RETURNING id
    `;
    const eventId = event.id;
    await client.query(insertEvent, [
      eventId,
      event.title,
      event.description || null,
      event.category,
      event.date,
      event.location,
      event.price,
      event.imageUrl,
      event.videoUrl || null,
      event.organizer,
      slug || null,
      event.isPopular ?? false,
      event.isPromo ?? false,
      event.discountPercent || null,
      event.isTrending ?? false,
      event.visibility || 'public',
      event.accessCode || null,
      event.status || 'published',
      event.isFeatured ?? false,
      event.isEventOfYear ?? false,
      event.isVerified ?? false,
      event.spot || null,
      event.djLineup || null,
      event.dressCode || null,
      event.waterSecurity || null,
    ]);

    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const insertTicket = `
        INSERT INTO ticket_tiers (
          id, event_id, name, price, quantity, description, style, tag, promo_type, promo_value, promo_code, available
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
      `;
      for (const t of event.ticketTypes) {
        await client.query(insertTicket, [
          eventId,
          t.name,
          t.price,
          t.quantity,
          t.description || '',
          t.style || 'standard',
          t.tag || null,
          t.promoType || null,
          t.promoValue || null,
          t.promoCode || null,
          t.available ?? t.quantity,
        ]);
      }
    }

    await client.query('COMMIT');
    return eventId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  finally {
    client.release();
  }
}

const slugify = (input: string) =>
  input
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
