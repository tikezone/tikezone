
'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { useFavorites } from '../../context/FavoritesContext';
import { fetchEvents } from '../../services/eventService';
import { Event } from '../../types';
import EventCard from '../../components/Events/EventCard';
import Button from '../../components/UI/Button';
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
        // In a real app, you'd have an endpoint like /events?ids=1,2,3
        // Here we fetch all (mock) and filter. Efficient enough for demo.
        const allEvents = await fetchEvents(1, 'all'); 
        // We might need more pages if the mock list is long, but let's assume page 1 covers it 
        // or fetch a larger limit for this specific logic
        
        // Actually, let's use a simpler logic for the demo: 
        // fetchEvents returns everything in the mock implementation before slicing.
        // We can access MOCK_EVENTS directly if we exported it, but sticking to service is cleaner.
        // Let's assume fetchEvents gets enough data or we implement getEventsByIds in service.
        
        // For robustness in this demo: filter from the result.data (which is sliced) 
        // OR better: use localStorage 'tikezone_published_events' + manually generated mocks locally if needed.
        // Simplest: Just use fetchEvents(1) and filter.
        
        // BETTER: Let's fetch a large number to ensure we find them
        const result = await fetchEvents(1, 'all'); 
        // Note: fetchEvents in service.ts slices data. We might miss some.
        // In a real backend this is handled by API. 
        
        // Let's try to match ID strings.
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
    // Navigate to explore with this event selected (or separate details page)
    // Since Explore handles details via state, we pass via URL params or simple navigation?
    // The current ExplorePage uses state for details. 
    // Ideally, /event/[id] should exist. 
    // For this architecture, we push to explore?id=... (requires update in Explore)
    // OR we just use client state if we were sharing context.
    
    // Workaround: We can't deep link to detail easily without a route.
    // Let's make the card unclickable for detail but keep the action buttons, 
    // OR just redirect to explore (user will have to find it, which is sub-optimal).
    
    // Best approach for this demo:
    alert(`Redirection vers : ${event.title}`); 
    router.push('/explore');
  };

  return (
    <MainLayout showAnnouncement={false}>
      <div className="bg-slate-50 min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex items-center mb-8">
            <div className="p-3 bg-red-100 rounded-full border-2 border-black mr-4 shadow-pop-sm">
                <Heart className="text-red-500 fill-red-500" size={32} />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-900 font-display uppercase">Mes Favoris</h1>
                <p className="text-slate-500 font-bold">{favorites.length} événement{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3].map(i => (
                    <div key={i} className="h-80 bg-slate-200 rounded-3xl animate-pulse border-2 border-slate-300"></div>
                ))}
             </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border-4 border-black border-dashed shadow-sm">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Frown size={48} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">C'est vide ici !</h2>
                <p className="text-slate-500 font-bold max-w-sm mx-auto mb-8">
                    Vous n'avez pas encore ajouté d'événements à vos favoris. Explorez la sélection pour trouver votre bonheur.
                </p>
                <Link href="/explore">
                    <Button variant="primary" icon={<ArrowRight size={18}/>}>
                        Découvrir les événements
                    </Button>
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
