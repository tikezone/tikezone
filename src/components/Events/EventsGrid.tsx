'use client';

import { useEffect, useState } from 'react';
import EventCard from './EventCard';
import SkeletonEventCard from '../UI/SkeletonEventCard';
import Pagination from '../UI/Pagination';
import { Event, PaginationMeta, CategoryId, DateFilter, PriceFilter } from '../../types';
import { fetchEvents } from '../../services/eventService';
import { AlertCircle, Calendar, Tag, X } from 'lucide-react';

interface EventsGridProps {
  selectedCategory: CategoryId;
  searchQuery: string;
  onEventSelect: (event: Event) => void;
}

const EventsGrid: React.FC<EventsGridProps> = ({ selectedCategory, searchQuery, onEventSelect }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced Filter States
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, dateFilter, priceFilter]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchEvents(page, selectedCategory, searchQuery, dateFilter, priceFilter);
        setEvents(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error('Failed to fetch events', error);
        setEvents([]);
        setMeta(null);
        setError("Impossible de charger les évènements. Vérifie ta connexion ou réessaie.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [page, selectedCategory, searchQuery, dateFilter, priceFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setDateFilter('all');
    setPriceFilter('all');
  };

  const hasActiveFilters = dateFilter !== 'all' || priceFilter !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {selectedCategory === 'all'
                ? 'Événements à venir'
                : `Catégorie: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
            </h2>
          </div>
          {meta && (
            <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
              {meta.totalItems} résultats
            </span>
          )}
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={14} className="text-slate-500 group-hover:text-brand-600 transition-colors" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 hover:border-brand-300 rounded-full text-sm font-medium text-slate-700 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="tomorrow">Demain</option>
              <option value="weekend">Ce week-end</option>
            </select>
            {/* Custom arrow */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Price Filter */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag size={14} className="text-slate-500 group-hover:text-brand-600 transition-colors" />
            </div>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              className="appearance-none pl-9 pr-8 py-2 bg-white border border-slate-200 hover:border-brand-300 rounded-full text-sm font-medium text-slate-700 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
            >
              <option value="all">Tous les prix</option>
              <option value="free">Gratuit</option>
              <option value="under-5000">Moins de 5 000 F</option>
              <option value="under-10000">Moins de 10 000 F</option>
              <option value="premium">Premium (+20k)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-full transition-colors ml-auto sm:ml-0"
            >
              <X size={14} className="mr-1" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonEventCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="py-14 px-6 text-center bg-white rounded-3xl border-2 border-dashed border-red-200">
          <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full mb-4 border-2 border-red-200">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-red-700 mb-2">Oups, un souci de chargement</h3>
          <p className="text-red-600 font-medium mb-4">Impossible d’afficher les évènements pour le moment.</p>
          <button
            onClick={() => setPage(1)}
            className="text-sm font-black text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg border-2 border-black shadow-pop-sm"
          >
            Réessayer
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-4 shadow-sm">
            <AlertCircle className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Aucun événement trouvé</h3>
          <p className="text-slate-500 mt-2 max-w-xs mx-auto">
            Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
          </p>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="mt-6 text-brand-600 font-semibold hover:underline"
            >
              Réinitialiser tous les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} />
          ))}
        </div>
      )}

      {meta && <Pagination meta={meta} onPageChange={handlePageChange} />}
    </div>
  );
};

export default EventsGrid;
