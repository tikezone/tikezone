'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Link } from '../../lib/safe-navigation';
import { Event } from '../../types';
import { fetchEvents } from '../../services/eventService';

type Props = {
  onSelect?: (event: Event) => void;
};

const BentoGrid: React.FC<Props> = ({ onSelect }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchEvents(1, 'all', '', 'all', 'all', { featured: true, verified: true });
        if (!cancelled) {
          setEvents(res.data.slice(0, 4));
        }
      } catch (e) {
        if (!cancelled) setError("Impossible de charger les evenements a la une.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const imageFor = (evt: Event) =>
    evt.imageUrl || (evt as any).image || (Array.isArray(evt.images) ? evt.images[0] : undefined) || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop';

  const hero = events[0];
  const others = events.slice(1, 4);

  const getEventHref = (evt: Event) => {
    if (evt.slug) return `/events/${evt.slug}`;
    if (evt.id !== undefined && evt.id !== null) return `/events/${String(evt.id)}`;
    return null;
  };
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`h-[220px] md:h-[260px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl animate-pulse ${i === 1 ? 'md:col-span-2 md:row-span-2 h-[300px] md:h-[500px]' : ''}`}
        />
      ))}
    </div>
  );

  const renderEmpty = () => null;

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
      {hero && (
        <div className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden h-[300px] md:h-[520px] shadow-glass hover:shadow-glass-lg hover:scale-[1.01] transition-all duration-500 cursor-pointer active:scale-[0.99]">
          <img
            src={imageFor(hero)}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {hero.category}
              </span>
              <span className="bg-white/10 backdrop-blur-xl text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center border border-white/20">
                <Calendar size={12} className="mr-1.5" /> {formatDate(hero.date)}
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">{hero.title}</h3>
            <p className="text-gray-300 text-sm md:text-base flex items-center mb-6">
              <MapPin size={14} className="mr-2 text-gray-400" />
              {hero.location}
            </p>
            {onSelect ? (
              <button
                onClick={() => onSelect(hero)}
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-glow"
              >
                Voir le detail <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : getEventHref(hero) ? (
              <Link href={getEventHref(hero)!} className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all duration-300 shadow-glow">
                Voir le detail <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            ) : null}
          </div>
        </div>
      )}

      {others.map((evt, idx) => {
        const href = getEventHref(evt);
        const wrapperClasses = `relative group rounded-3xl overflow-hidden h-[220px] md:h-auto cursor-pointer shadow-glass hover:shadow-glass-lg hover:scale-[1.02] transition-all duration-500 active:scale-[0.98] ${
          idx === 0 ? 'md:row-span-2' : ''
        }`;
        const content = (
          <>
            <img
              src={imageFor(evt)}
              alt={evt.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl rounded-full p-2.5 border border-white/20 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300">
              <ArrowRight className="text-white w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div className="absolute bottom-0 left-0 p-5 w-full">
              <span className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 block">{evt.category}</span>
              <h3 className="text-xl font-bold text-white mb-1 leading-tight line-clamp-2">{evt.title}</h3>
              <p className="text-gray-400 text-xs font-medium flex items-center">
                <Calendar size={12} className="mr-2" /> {formatDate(evt.date)} · {evt.location}
              </p>
            </div>
          </>
        );

        if (onSelect) {
          return (
            <button key={evt.id ?? idx} onClick={() => onSelect(evt)} className={wrapperClasses} type="button">
              {content}
            </button>
          );
        }

        return href ? (
          <Link key={evt.id ?? idx} href={href} className={wrapperClasses}>
            {content}
          </Link>
        ) : (
          <div key={evt.id ?? idx} className={wrapperClasses}>
            {content}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="py-8">
      {error && (
        <div className="mb-6 bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 font-medium text-sm rounded-2xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? renderSkeletons() : events.length === 0 ? renderEmpty() : renderCards()}
    </div>
  );
};

export default BentoGrid;