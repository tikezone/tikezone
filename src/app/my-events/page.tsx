
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Ticket, ArrowRight, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { fetchEvents } from '../../services/eventService';
import { Event } from '../../types';

import MainLayout from '../../components/Layout/MainLayout';
import Button from '../../components/UI/Button';
import TicketCard from '../../components/Booking/TicketCard';
import DeleteConfirmationModal from '../../components/UI/DeleteConfirmationModal';
import TransferModal from '../../components/Booking/TransferModal';
import EventCard from '../../components/Events/EventCard';

export default function MyEventsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past'>('upcoming');
  const { isAuthenticated } = useAuth();

  // Recommendations state
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal States
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
        // Logic: Sending a ticket removes it from the current user's list
        // In a real backend, this would update the ownerID of the ticket
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
    
    // Use origin + explore as a generic link since we don't have deep linking IDs in this demo router
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
      // Fallback: Copy to clipboard
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

  // Filter Logic
  const filteredBookings = bookings.filter(booking => {
    const eventDate = new Date(booking.eventDate);
    const now = new Date();
    if (activeFilter === 'upcoming') return eventDate >= now;
    return eventDate < now;
  });

  if (!isAuthenticated) {
    return (
      <MainLayout showAnnouncement={false}>
        <div className="flex-grow flex items-center justify-center p-4 min-h-[60vh]">
            <div className="text-center max-w-md w-full bg-white p-8 rounded-3xl border-2 border-black shadow-pop">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                    <User size={32} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Connectez-vous</h2>
                <p className="text-slate-600 mb-6 font-medium">Vous devez être connecté pour voir vos billets.</p>
                <Link href="/login" className="block w-full">
                    <Button fullWidth>Se connecter</Button>
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

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h1 className="text-4xl font-black text-slate-900 font-display">
                Mes Tickets
                <span className="ml-3 text-lg bg-yellow-300 text-black px-3 py-1 rounded-full border-2 border-black align-middle shadow-sm">
                    {bookings.length}
                </span>
            </h1>
            
            {/* Filters */}
            <div className="flex bg-white p-1.5 rounded-xl border-2 border-black shadow-pop-sm">
               <button 
                 onClick={() => setActiveFilter('upcoming')}
                 className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${activeFilter === 'upcoming' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
               >
                 À venir
               </button>
               <button 
                 onClick={() => setActiveFilter('past')}
                 className={`px-4 py-2 rounded-lg text-sm font-black transition-all ${activeFilter === 'past' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
               >
                 Passés
               </button>
            </div>
          </div>

          {loadError ? (
            <div className="bg-white rounded-3xl border-2 border-red-200 p-6 text-center">
              <p className="text-red-700 font-bold mb-3">Oups, vos billets n'ont pas pu être chargés.</p>
              <p className="text-sm text-red-600 mb-4">{loadError}</p>
              <Button variant="secondary" onClick={loadBookings} icon={<ArrowRight size={16} />}>
                Réessayer
              </Button>
            </div>
          ) : loading ? (
             <div className="space-y-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-48 bg-slate-200 rounded-3xl animate-pulse border-2 border-slate-300"></div>
                ))}
             </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-black border-dashed p-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-slate-200">
                    <Ticket size={40} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {activeFilter === 'upcoming' ? "Aucun événement à venir" : "Aucun événement passé"}
                </h3>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">C'est le moment de découvrir de nouvelles expériences !</p>
                <Link href="/explore">
                    <Button icon={<ArrowRight size={18} />} variant="secondary">Explorer les événements</Button>
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

          {/* Related Events Section */}
          {(relatedEvents.length > 0 || relatedError) && (
            <div className="mt-20 border-t-2 border-black pt-10 border-dashed">
                <div className="flex items-center mb-6">
                    <Sparkles className="w-6 h-6 text-brand-500 mr-2" fill="currentColor" />
                    <h2 className="text-2xl font-black text-slate-900 font-display">Ça pourrait vous plaire</h2>
                </div>
                
                {relatedError ? (
                  <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 text-amber-700 font-bold text-sm">
                    {relatedError}
                  </div>
                ) : loadingRecommendations ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-40 rounded-2xl bg-slate-100 border-2 border-slate-200 animate-pulse"></div>
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
