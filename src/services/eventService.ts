
import { Event, PaginationMeta, CategoryId, DateFilter, PriceFilter } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

const getApiUrl = (path: string) => `${API_BASE}${path}`;

const isLocalImage = (url?: string | null) => !!url && (url.startsWith('blob:') || url.startsWith('data:'));

const normalizeDateTime = (date: string, time?: string) => {
  if (!date) throw new Error('Date manquante');
  const trimmed = date.trim();
  if (trimmed.includes('T')) {
    const dtIso = new Date(trimmed);
    if (!Number.isNaN(dtIso.getTime())) return dtIso.toISOString();
  }
  const tMatch = (time || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  const hh = tMatch ? tMatch[1].padStart(2, '0') : '00';
  const minute = tMatch ? tMatch[2] : '00';
  const hhmm = `${hh}:${minute}`;

  const fr = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  let candidate = trimmed;
  if (fr) {
    const [, dd, month, yyyy] = fr;
    candidate = `${yyyy}-${month.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  const isoCandidate = time ? `${candidate}T${hhmm}:00` : candidate;
  const dt = new Date(isoCandidate);
  if (Number.isNaN(dt.getTime())) throw new Error('Date invalide (format jj/mm/aaaa)');
  return dt.toISOString();
};

const uploadImageIfNeeded = async (image?: string | null) => {
  if (!image) return null;
  if (!isLocalImage(image)) return image;

  const blob = await fetch(image).then(r => r.blob());
  const ext = (blob.type && blob.type.split('/').pop()) || 'bin';
  const file = new File([blob], `event-${Date.now()}.${ext}`, { type: blob.type || 'application/octet-stream' });
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(getApiUrl('/api/events/upload'), {
    method: 'POST',
    body: form,
    credentials: 'include',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || 'Upload image failed');
  }
  return body.url || body.path || null;
};

const prepareEventPayload = async (event: Event) => {
  const uploadCache = new Map<string, string | null>();
  const uploadOnce = async (img?: string | null) => {
    if (!img) return null;
    if (uploadCache.has(img)) return uploadCache.get(img) || null;
    const uploaded = await uploadImageIfNeeded(img);
    uploadCache.set(img, uploaded);
    return uploaded;
  };

  const images = event.images || [];
  const uploadedImages: string[] = [];
  for (const img of images) {
    const final = await uploadOnce(img);
    if (final) uploadedImages.push(final);
  }

  const coverSource = event.imageUrl || images[0] || null;
  const cover = await uploadOnce(coverSource);

  return {
    ...event,
    date: normalizeDateTime(event.date, (event as any).time),
    imageUrl: cover || uploadedImages[0] || event.imageUrl,
    images: uploadedImages,
  };
};

type EventFlags = {
  featured?: boolean;
  trending?: boolean;
  eventOfYear?: boolean;
  verified?: boolean;
};

const mockFetchEvents = async (
  page: number,
  category: CategoryId,
  searchQuery: string,
  dateFilter: DateFilter,
  priceFilter: PriceFilter,
  _flags?: EventFlags
): Promise<{ data: Event[]; meta: PaginationMeta }> => {
  // fallback to empty when mocks disabled
  return { data: [], meta: { currentPage: 1, totalPages: 1, totalItems: 0 } };
};

export const fetchEvents = async (
  page: number = 1,
  category: CategoryId = 'all',
  searchQuery: string = '',
  dateFilter: DateFilter = 'all',
  priceFilter: PriceFilter = 'all',
  flags?: EventFlags
): Promise<{ data: Event[]; meta: PaginationMeta }> => {
  if (useMocks) {
    return mockFetchEvents(page, category, searchQuery, dateFilter, priceFilter, flags);
  }
  const params = new URLSearchParams({
    page: page.toString(),
    category,
    search: searchQuery,
    dateFilter,
    priceFilter,
  });
  if (flags?.featured) params.set('featured', 'true');
  if (flags?.trending) params.set('trending', 'true');
  if (flags?.eventOfYear) params.set('eventOfYear', 'true');
  if (flags?.verified) params.set('verified', 'true');
  const res = await fetch(getApiUrl(`/api/events?${params.toString()}`), { cache: 'no-store', credentials: 'include' });
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status}`);
  }
  return res.json();
};

export const getEventById = async (id: string): Promise<Event | null> => {
  if (useMocks) return null;
  const res = await fetch(getApiUrl(`/api/events/${id}`), { cache: 'no-store', credentials: 'include' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch event');
  return res.json();
};

export const createEvent = async (event: Event): Promise<void> => {
  if (useMocks) return;
  const payload = await prepareEventPayload(event);
  const res = await fetch(getApiUrl('/api/events'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to create event');
  }
};

export const updateEvent = async (updatedEvent: Event): Promise<void> => {
  if (useMocks) return;
  const res = await fetch(getApiUrl(`/api/events/${updatedEvent.id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedEvent),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to update event');
};

export const deleteEvent = async (id: string): Promise<void> => {
  if (useMocks) return;
  const res = await fetch(getApiUrl(`/api/events/${id}`), { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to delete event');
};
