'use client';

import { useEffect, useState } from 'react';
import EventCard from './EventCard';
import SkeletonEventCard from '../UI/SkeletonEventCard';
import Pagination from '../UI/Pagination';
import { Event, PaginationMeta, CategoryId, DateFilter, PriceFilter } from '../../types';
import { fetchEvents } from '../../services/eventService';
import { AlertCircle, Calendar, Tag, X, ChevronDown } from 'lucide-react';

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
        setError("Impossible de charger les evenements. Verifie ta connexion ou reessaie.");
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
    <div className="py-4">
      
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              {selectedCategory === 'all'
                ? 'Evenements a venir'
                : `Categorie: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
            </h2>
          </div>
          {meta && (
            <span className="text-sm text-gray-400 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full self-start sm:self-auto">
              {meta.totalItems} resultats
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Calendar size={14} className="text-gray-500 group-hover:text-orange-500 transition-colors" />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="appearance-none pl-10 pr-10 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-500/50 rounded-full text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-gray-900">Toutes les dates</option>
              <option value="today" className="bg-gray-900">Aujourd'hui</option>
              <option value="tomorrow" className="bg-gray-900">Demain</option>
              <option value="weekend" className="bg-gray-900">Ce week-end</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={14} className="text-gray-500" />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Tag size={14} className="text-gray-500 group-hover:text-orange-500 transition-colors" />
            </div>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              className="appearance-none pl-10 pr-10 py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-500/50 rounded-full text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all cursor-pointer"
            >
              <option value="all" className="bg-gray-900">Tous les prix</option>
              <option value="free" className="bg-gray-900">Gratuit</option>
              <option value="under-5000" className="bg-gray-900">Moins de 5 000 F</option>
              <option value="under-10000" className="bg-gray-900">Moins de 10 000 F</option>
              <option value="premium" className="bg-gray-900">Premium (+20k)</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown size={14} className="text-gray-500" />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center text-xs font-medium text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 backdrop-blur-xl border border-white/10 hover:border-red-500/30 px-4 py-2.5 rounded-full transition-all duration-300 ml-auto sm:ml-0"
            >
              <X size={14} className="mr-1.5" />
              Effacer
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonEventCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="py-14 px-6 text-center bg-white/5 backdrop-blur-xl border border-red-500/20 rounded-3xl">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Oups, un souci de chargement</h3>
          <p className="text-gray-400 font-medium mb-6">Impossible d'afficher les evenements pour le moment.</p>
          <button
            onClick={() => setPage(1)}
            className="text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:scale-105 active:scale-95 px-6 py-3 rounded-full transition-all duration-300 shadow-glow"
          >
            Reessayer
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Aucun evenement trouve</h3>
          <p className="text-gray-400 mt-2 max-w-xs mx-auto">
            Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
          </p>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="mt-6 text-orange-400 font-medium hover:text-orange-300 transition-colors"
            >
              Reinitialiser tous les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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