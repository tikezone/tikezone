
'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useFavorites } from '../../context/FavoritesContext';
import { fetchEvents } from '../../services/eventService';
import { Event } from '../../types';
import EventCard from '../../components/Events/EventCard';
import { Heart, ArrowRight, Frown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from '../../lib/safe-navigation';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const result = await fetchEvents(1, 'all'); 
        const found = result.data.filter(evt => favorites.includes(evt.id));
        setFavoriteEvents(found);
      } catch (error) {
        console.error("Error loading favorites", error);
      } finally {
        setLoading(false);
      }
    };

    if (favorites.length > 0) {
      loadFavorites();
    } else {
      setFavoriteEvents([]);
      setLoading(false);
    }
  }, [favorites]);

  const handleEventSelect = (event: Event) => {
    const href = event.slug ? `/events/${event.slug}` : `/events/${event.id}`;
    window.location.href = href;
  };

  return (
    <MainLayout showAnnouncement={false}>
      <div className="min-h-screen bg-black relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          
          <div className="flex items-center mb-8">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl mr-4 shadow-lg shadow-orange-500/30">
                <Heart className="text-white fill-white" size={32} />
            </div>
            <div>
                <h1 className="text-4xl font-black text-white font-display uppercase">Mes Favoris</h1>
                <p className="text-gray-400 font-bold">{favorites.length} événement{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="h-80 bg-white/5 rounded-3xl animate-pulse border border-white/10"></div>
                ))}
             </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Frown size={48} className="text-gray-500" />
                </div>
                <h2 className="text-2xl font-black text-white mb-2">C'est vide ici !</h2>
                <p className="text-gray-400 font-bold max-w-sm mx-auto mb-8">
                    Vous n'avez pas encore ajouté d'événements à vos favoris. Explorez la sélection pour trouver votre bonheur.
                </p>
                <Link href="/explore">
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                        Découvrir les événements <ArrowRight size={18}/>
                    </button>
                </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favoriteEvents.map(evt => (
                    <EventCard 
                        key={evt.id} 
                        event={evt} 
                        onClick={handleEventSelect}
                    />
                ))}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
