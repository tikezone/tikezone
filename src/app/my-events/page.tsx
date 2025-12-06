
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Ticket, ArrowRight, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchEvents } from '../../services/eventService';
import { Event } from '../../types';

import MainLayout from '../../components/Layout/MainLayout';
import TicketCard from '../../components/Booking/TicketCard';
import DeleteConfirmationModal from '../../components/UI/DeleteConfirmationModal';
import TransferModal from '../../components/Booking/TransferModal';
import EventCard from '../../components/Events/EventCard';

export default function MyEventsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming');
  const { isAuthenticated } = useAuth();

  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [ticketToDelete, setTicketToDelete] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [ticketToTransfer, setTicketToTransfer] = useState<any>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const loadBookings = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    const timer = setTimeout(() => {
      try {
        const data = localStorage.getItem('tikezone_bookings');
        if (data) {
          setBookings(JSON.parse(data));
        } else {
          setBookings([]);
        }
      } catch (e) {
        console.error("Erreur de chargement des tickets", e);
        setLoadError("Impossible de charger vos billets pour le moment.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = loadBookings();
    return cleanup;
  }, [loadBookings]);

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoadingRecommendations(true);
      setRelatedError(null);
      try {
        const res = await fetchEvents(1, 'all');
        setRelatedEvents(res.data.slice(0, 3));
      } catch (e) {
        console.error("Erreur de chargement des recommandations", e);
        setRelatedError("Recommandations indisponibles pour l'instant.");
      } finally {
        setLoadingRecommendations(false);
      }
    };
    loadRecommendations();
  }, []);

  const handleDeleteClick = (booking: any) => {
    setTicketToDelete(booking);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (ticketToDelete) {
      const updatedBookings = bookings.filter(b => b.id !== ticketToDelete.id);
      setBookings(updatedBookings);
      localStorage.setItem('tikezone_bookings', JSON.stringify(updatedBookings));
      setIsDeleteModalOpen(false);
      setTicketToDelete(null);
    }
  };

  const handleTransferClick = (booking: any) => {
    setTicketToTransfer(booking);
    setIsTransferModalOpen(true);
  };

  const confirmTransfer = (method: string, recipient: string) => {
    if (ticketToTransfer) {
        const updatedBookings = bookings.filter(b => b.id !== ticketToTransfer.id);
        setBookings(updatedBookings);
        localStorage.setItem('tikezone_bookings', JSON.stringify(updatedBookings));
        setIsTransferModalOpen(false);
        setTicketToTransfer(null);
    }
  };

  const handleShare = async (booking: any) => {
    const eventDate = new Date(booking.eventDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/explore` : '';
    const shareTitle = `Je participe à : ${booking.eventTitle}`;
    const shareText = `📅 ${eventDate}\n📍 ${booking.eventLocation}\n\nRejoins-moi sur Tikezone !`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      try {
        const fullMessage = `${shareTitle}\n${shareText}\n${shareUrl}`;
        await navigator.clipboard.writeText(fullMessage);
        alert('Infos de l\'événement copiées dans le presse-papier !');
      } catch (err) {
        console.error('Clipboard failed', err);
        alert('Impossible de partager cet événement.');
      }
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const eventDate = new Date(booking.eventDate);
    const now = new Date();
    if (activeFilter === 'upcoming') return eventDate >= now;
    return eventDate < now;
  });

  if (!isAuthenticated) {
    return (
      <MainLayout showAnnouncement={false}>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
          <div className="relative z-10 text-center max-w-md w-full bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 font-display">Connectez-vous</h2>
              <p className="text-gray-400 mb-6 font-medium">Vous devez être connecté pour voir vos billets.</p>
              <Link href="/login" className="block w-full">
                  <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                    Se connecter
                  </button>
              </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showAnnouncement={false}>
      
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        eventName={ticketToDelete?.eventTitle || 'cet événement'}
      />

      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onConfirm={confirmTransfer}
        ticketTitle={ticketToTransfer?.eventTitle}
      />

      <div className="min-h-screen bg-black relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-4xl font-black text-white font-display">
                Mes Tickets
                <span className="ml-3 text-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full align-middle shadow-lg shadow-orange-500/30">
                    {bookings.length}
                </span>
            </h1>
            
            <div className="flex bg-white/10 backdrop-blur-xl p-1.5 rounded-xl border border-white/10">
               <button 
                 onClick={() => setActiveFilter('upcoming')}
                 className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${activeFilter === 'upcoming' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
               >
                 À venir
               </button>
               <button 
                 onClick={() => setActiveFilter('past')}
                 className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${activeFilter === 'past' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
               >
                 Passés
               </button>
            </div>
          </div>

          {loadError ? (
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-red-500/30 p-6 text-center">
              <p className="text-red-400 font-bold mb-3">Oups, vos billets n'ont pas pu être chargés.</p>
              <p className="text-sm text-red-400/70 mb-4">{loadError}</p>
              <button onClick={loadBookings} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-all border border-white/10">
                <ArrowRight size={16} /> Réessayer
              </button>
            </div>
          ) : loading ? (
             <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse border border-white/10"></div>
                ))}
             </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Ticket size={40} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                    {activeFilter === 'upcoming' ? "Aucun événement à venir" : "Aucun événement passé"}
                </h3>
                <p className="text-gray-400 mb-8 max-w-xs mx-auto">C'est le moment de découvrir de nouvelles expériences !</p>
                <Link href="/explore">
                    <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                      Explorer les événements <ArrowRight size={18} />
                    </button>
                </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <TicketCard 
                    key={booking.id} 
                    booking={booking} 
                    onDelete={handleDeleteClick}
                    onShare={handleShare}
                    onTransfer={handleTransferClick}
                />
              ))}
            </div>
          )}

          {(relatedEvents.length > 0 || relatedError) && (
            <div className="mt-20 border-t border-white/10 pt-10">
                <div className="flex items-center mb-6">
                    <Sparkles className="w-6 h-6 text-orange-500 mr-2" fill="currentColor" />
                    <h2 className="text-2xl font-black text-white font-display">Ça pourrait vous plaire</h2>
                </div>
                
                {relatedError ? (
                  <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-4 text-amber-400 font-bold text-sm">
                    {relatedError}
                  </div>
                ) : loadingRecommendations ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {relatedEvents.map(evt => (
                          <div key={evt.id} className="scale-90 origin-top-left sm:scale-100">
                              <EventCard event={evt} />
                          </div>
                      ))}
                  </div>
                )}
            </div>
          )}

        </div>
      </div>
    </MainLayout>
  );
}
