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
        if (!cancelled) setError("Impossible de charger les événements à la une.");
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
          className={`h-[220px] md:h-[260px] bg-slate-100 border-2 border-slate-200 rounded-3xl animate-pulse ${i === 1 ? 'md:col-span-2 md:row-span-2 h-[300px] md:h-[500px]' : ''}`}
        />
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center">
      <p className="font-black text-slate-700 text-lg">Aucun événement en vedette pour le moment.</p>
      <p className="text-slate-500 font-medium text-sm mt-2">Dès que la base de données sera connectée, les temps forts apparaîtront ici.</p>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
      {hero && (
        <div className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden h-[300px] md:h-[500px] shadow-sm hover:shadow-2xl transition-all duration-500">
          <img
            src={imageFor(hero)}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-90" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                {hero.category}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded flex items-center border border-white/10">
                <Calendar size={10} className="mr-1" /> {formatDate(hero.date)}
              </span>
            </div>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight">{hero.title}</h3>
            <p className="text-slate-200 text-sm md:text-base line-clamp-2 max-w-md mb-5 opacity-90 flex items-center">
              <MapPin size={14} className="mr-2" />
              {hero.location}
            </p>
            {onSelect ? (
              <button
                onClick={() => onSelect(hero)}
                className="inline-flex items-center bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-brand-50 transition-colors shadow-lg border-2 border-black"
              >
                Voir le détail <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : getEventHref(hero) ? (
              <Link href={getEventHref(hero)!} className="inline-flex items-center bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-brand-50 transition-colors shadow-lg">
                Voir le détail <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            ) : null}
          </div>
        </div>
      )}

      {others.map((evt, idx) => {
        const href = getEventHref(evt);
        const wrapperClasses = `relative group rounded-3xl overflow-hidden h-[220px] md:h-auto cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 ${
          idx === 0 ? 'md:row-span-2' : ''
        }`;
        const content = (
          <>
            <img
              src={imageFor(evt)}
              alt={evt.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/80" />
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20 group-hover:bg-brand-600 group-hover:border-brand-600 transition-colors duration-300">
              <ArrowRight className="text-white w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div className="absolute bottom-0 left-0 p-5 w-full">
              <span className="text-brand-200 text-xs font-bold uppercase tracking-wider mb-2 block">{evt.category}</span>
              <h3 className="text-2xl font-bold text-white mb-1 leading-tight line-clamp-2">{evt.title}</h3>
              <p className="text-slate-200 text-xs font-medium flex items-center">
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
    <div className="py-8 lg:py-12">
      {error && (
        <div className="mb-4 bg-amber-50 border-2 border-amber-300 text-amber-800 font-bold text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? renderSkeletons() : events.length === 0 ? renderEmpty() : renderCards()}
    </div>
  );
};

export default BentoGrid;
