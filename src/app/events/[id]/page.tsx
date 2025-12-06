'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import EventDetail from '../../../components/Events/EventDetail';
import Footer from '../../../components/Layout/Footer';
import { Event } from '../../../types';

export default function PublicEventPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`, { cache: 'no-store' });
        if (res.status === 404) {
          setError(true);
          return;
        }
        if (!res.ok) throw new Error('Erreur chargement evenement');
        const data = await res.json();
        setEvent(data);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEvent();
    }
  }, [id]);

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      <EventDetail event={event} onBack={handleBack} />
      <Footer />
    </div>
  );
}
