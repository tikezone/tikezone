import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tikezone.com';

async function loadEventBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/events/${slug}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEventBySlug(slug);
  
  if (!event) {
    return {
      title: 'Événement non trouvé - TIKEZONE',
    };
  }

  const eventUrl = `${SITE_URL}/${event.slug || slug}`;
  
  return {
    title: `${event.title} - TIKEZONE`,
    description: event.description || `Découvrez ${event.title} sur TIKEZONE`,
    openGraph: {
      title: event.title,
      description: event.description || `Découvrez ${event.title} sur TIKEZONE`,
      url: eventUrl,
      images: event.imageUrl ? [{ url: event.imageUrl }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description || `Découvrez ${event.title} sur TIKEZONE`,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

const reservedPaths = [
  'api',
  'events',
  'explore',
  'faq',
  'favorites',
  'forgot',
  'gift-cards',
  'how-it-works',
  'lab',
  'login',
  'my-events',
  'notifications',
  'organizer',
  'profile',
  'publish',
  'register',
  'reset',
  'scan',
  'terms',
  'verify-email',
  'contact',
];

export default async function EventSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  if (reservedPaths.includes(slug.toLowerCase())) {
    return notFound();
  }

  const event = await loadEventBySlug(slug);
  
  if (!event) {
    return notFound();
  }

  redirect(`/events/${event.slug || event.id}`);
}
