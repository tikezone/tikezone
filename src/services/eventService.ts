
import { Event, PaginationMeta, CategoryId, DateFilter, PriceFilter } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

const getApiUrl = (path: string) => `${API_BASE}${path}`;

type EventFlags = {
  featured?: boolean;
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
  const res = await fetch(getApiUrl('/api/events'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
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
