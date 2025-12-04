'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import {
  Calendar,
  MapPin,
  Edit3,
  Trash2,
  Power,
  Eye,
  Search,
  PlusCircle,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import DeleteConfirmationModal from '../../../components/UI/DeleteConfirmationModal';
import { deleteEvent, updateEvent } from '../../../services/eventService';
import { Event } from '../../../types';
import EventPreviewModal from '../../../components/Organizer/EventPreviewModal';
import Button from '../../../components/UI/Button';

interface EnhancedEvent extends Event {
  soldCount: number;
}

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<EnhancedEvent[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortOption, setSortOption] = useState<'date_new' | 'date_old' | 'sales_high' | 'sales_low'>('date_new');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/organizer/events', { cache: 'no-store', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        setLoadError('Non authentifié. Merci de vous reconnecter.');
        setEvents([]);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Impossible de charger vos evenements');
      setEvents(
        (data.events || []).map((evt: any) => {
          const totalTickets = evt.totalTickets ?? evt.availableTickets ?? 0;
          return {
            ...evt,
            totalTickets,
            availableTickets: totalTickets,
            soldCount: evt.soldCount ?? 0,
          };
        })
      );
    } catch (e) {
      console.error(e);
      if (!loadError) setLoadError('Impossible de charger vos evenements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const processedEvents = useMemo(() => {
    let result = [...events];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== 'all') {
      result = result.filter((e) => (e.status || 'published') === filterStatus);
    }

    const now = new Date();
    if (filterDate === 'upcoming') {
      result = result.filter((e) => new Date(e.date) >= now);
    } else if (filterDate === 'past') {
      result = result.filter((e) => new Date(e.date) < now);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'date_new':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_old':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'sales_high':
          return b.soldCount - a.soldCount;
        case 'sales_low':
          return a.soldCount - b.soldCount;
        default:
          return 0;
      }
    });

    return result;
  }, [events, searchQuery, filterStatus, filterDate, sortOption]);

  const toggleScan = async (evt: Event) => {
    const updatedEvents = events.map((e) => (e.id === evt.id ? { ...e, isTrending: !e.isTrending } : e));
    setEvents(updatedEvents);
    await updateEvent({ ...evt, isTrending: !evt.isTrending });
  };

  const handleDelete = async () => {
    if (deleteId) {
      const updatedEvents = events.filter((e) => e.id !== deleteId);
      setEvents(updatedEvents);
      await deleteEvent(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        <DeleteConfirmationModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          eventName={events.find((e) => e.id === deleteId)?.title || 'cet evenement'}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-display uppercase">Tableau de Bord</h1>
            <p className="text-slate-500 font-bold text-sm">Gerez vos publications.</p>
          </div>
          <Link href="/publish">
            <Button icon={<PlusCircle size={18} />} className="py-2.5 text-xs">
              Nouveau
            </Button>
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between">
          <div className="relative w-full xl:w-80">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-black outline-none font-bold text-sm bg-slate-50 focus:bg-white shadow-sm transition-all"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex flex-wrap gap-3 w-full xl:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border-2 border-slate-200 hover:border-black rounded-xl text-sm font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="all">Toutes dates</option>
                <option value="upcoming">A venir</option>
                <option value="past">Passes</option>
              </select>
            </div>

            <div className="relative group flex-1 sm:flex-none">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border-2 border-slate-200 hover:border-black rounded-xl text-sm font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="all">Tous status</option>
                <option value="published">Publie</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>

            <div className="relative group flex-1 sm:flex-none">
              <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 bg-white border-2 border-slate-200 hover:border-black rounded-xl text-sm font-bold text-slate-700 focus:outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="date_new">Plus recents</option>
                <option value="date_old">Plus anciens</option>
                <option value="sales_high">Meilleures ventes</option>
                <option value="sales_low">Moins vendus</option>
              </select>
            </div>
          </div>
        </div>

        {!loading && !loadError && (
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            {processedEvents.length} Resultat{processedEvents.length > 1 ? 's' : ''}
          </p>
        )}

        {loadError ? (
          <div className="text-center py-12 px-6 bg-white rounded-2xl border-2 border-red-200">
            <p className="text-red-700 font-black mb-2">Oups, les donnees ne sont pas disponibles.</p>
            <p className="text-sm text-red-600 mb-4">{loadError}</p>
            <Button variant="secondary" onClick={loadEvents}>
              Reessayer
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-500 font-bold animate-pulse">Chargement...</p>
          </div>
        ) : processedEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold mb-4">Aucun evenement ne correspond a votre recherche.</p>
            {filterStatus !== 'all' || searchQuery ? (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterDate('all');
                  setSearchQuery('');
                }}
                className="text-brand-600 font-bold underline"
              >
                Reinitialiser les filtres
              </button>
            ) : (
              <Link href="/publish">
                <Button variant="secondary">Lancer votre premier evenement</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {processedEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border-2 border-black shadow-pop p-4 flex flex-col lg:flex-row gap-6 items-start lg:items-center group hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 w-full lg:w-auto">
                  <div className="w-16 h-16 bg-slate-200 rounded-xl border-2 border-black overflow-hidden shrink-0 relative">
                    <img src={evt.imageUrl} alt={evt.title} className="w-full h-full object-cover" />
                    {evt.images && evt.images.length > 1 && (
                      <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] font-black px-1">
                        +{evt.images.length - 1}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black text-lg text-slate-900 leading-tight line-clamp-1">{evt.title}</h3>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase shrink-0 ${
                          evt.status === 'draft'
                            ? 'bg-slate-200 text-slate-600 border-slate-300'
                            : 'bg-green-200 text-green-800 border-green-300'
                        }`}
                      >
                        {evt.status === 'draft' ? 'Brouillon' : 'Publie'}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs font-bold text-slate-500">
                      <span className="flex items-center truncate">
                        <Calendar size={12} className="mr-1 shrink-0" /> {new Date(evt.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center truncate">
                        <MapPin size={12} className="mr-1 shrink-0" /> {evt.location}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-dashed border-slate-200 pt-4 lg:pt-0">
                  <div className="text-center px-4 border-r border-slate-200 hidden sm:block">
                    <p className="text-[10px] uppercase font-black text-slate-400">Ventes</p>
                    <p className="font-black text-slate-900">
                      {evt.soldCount}{' '}
                      <span className="text-slate-400 text-xs">
                        / {evt.totalTickets ?? evt.availableTickets ?? 0} (reste {Math.max((evt.totalTickets ?? evt.availableTickets ?? 0) - (evt.soldCount ?? 0), 0)})
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Scan</p>
                    <button
                      onClick={() => toggleScan(evt)}
                      className={`relative w-12 h-6 rounded-full border-2 border-black transition-colors duration-200 ${
                        evt.isTrending ? 'bg-green-400' : 'bg-slate-200'
                      }`}
                      title={evt.isTrending ? 'Scan Actif' : 'Scan Desactive'}
                      aria-label={evt.isTrending ? 'Desactiver le scan' : 'Activer le scan'}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white border-2 border-black transition-transform duration-200 flex items-center justify-center ${
                          evt.isTrending ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      >
                        <Power size={8} className={evt.isTrending ? 'text-green-600' : 'text-slate-400'} />
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/organizer/events/edit/${evt.id}`}>
                      <button
                        className="p-2 bg-white border-2 border-black rounded-lg hover:bg-yellow-100 transition-colors shadow-sm text-slate-900"
                        title="Modifier"
                        aria-label="Modifier l'evenement"
                      >
                        <Edit3 size={18} />
                      </button>
                    </Link>
                    <button
                      className="p-2 bg-white border-2 border-black rounded-lg hover:bg-blue-100 transition-colors shadow-sm text-slate-900"
                      title="Voir"
                      aria-label="Voir l'evenement"
                      onClick={() => setPreviewId(evt.id)}
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteId(evt.id)}
                      className="p-2 bg-white border-2 border-transparent hover:border-red-500 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                      title="Supprimer"
                      aria-label="Supprimer l'evenement"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {previewId && (
        <EventPreviewModal eventId={previewId} onClose={() => setPreviewId(null)} />
      )}
    </OrganizerLayout>
  );
}
