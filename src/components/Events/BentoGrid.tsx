'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar, MapPin, Play } from 'lucide-react';
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
          className={`bg-slate-800/50 border border-white/5 rounded-3xl animate-pulse ${i === 1 ? 'md:col-span-2 md:row-span-2 h-[400px] md:h-[520px]' : 'h-[200px] md:h-auto'}`}
        />
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
      <p className="font-bold text-white/70 text-lg">Aucun evenement en vedette pour le moment.</p>
      <p className="text-white/40 text-sm mt-2">Des temps forts apparaitront ici bientot.</p>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
      {hero && (
        <div className="md:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden h-[400px] md:h-[520px] cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10"></div>
          <img
            src={imageFor(hero)}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center px-3 py-1.5 bg-brand-500 rounded-full text-white text-xs font-bold uppercase tracking-wider">
                {hero.category}
              </span>
              <span className="inline-flex items-center px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-bold">
                <Calendar className="w-3 h-3 mr-1.5" /> {formatDate(hero.date)}
              </span>
            </div>
            
            <h3 className="text-2xl md:text-4xl font-display font-black text-white mb-3 leading-tight group-hover:text-brand-300 transition-colors">
              {hero.title}
            </h3>
            
            <div className="flex items-center text-white/70 text-sm mb-6">
              <MapPin className="w-4 h-4 mr-2" />
              {hero.location}
            </div>
            
            {onSelect ? (
              <button
                onClick={() => onSelect(hero)}
                className="inline-flex items-center self-start px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-brand-50 transition-all duration-300 group/btn"
              >
                Voir le detail
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            ) : getEventHref(hero) ? (
              <Link href={getEventHref(hero)!} className="inline-flex items-center self-start px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-brand-50 transition-all duration-300 group/btn">
                Voir le detail
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            ) : null}
          </div>

          <div className="absolute top-4 right-4 z-20 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-brand-500 group-hover:border-brand-500 transition-all duration-300">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      )}

      {others.map((evt, idx) => {
        const href = getEventHref(evt);
        const wrapperClasses = `relative group rounded-3xl overflow-hidden cursor-pointer ${
          idx === 0 ? 'md:row-span-2 h-[200px] md:h-auto' : 'h-[200px] md:h-auto'
        }`;
        const content = (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10"></div>
            <img
              src={imageFor(evt)}
              alt={evt.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:bg-brand-500 group-hover:border-brand-500 transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-5">
              <span className="text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">{evt.category}</span>
              <h3 className="text-lg md:text-xl font-display font-black text-white leading-tight line-clamp-2 group-hover:text-brand-300 transition-colors mb-2">
                {evt.title}
              </h3>
              <p className="text-white/50 text-xs flex items-center">
                <Calendar className="w-3 h-3 mr-1.5" /> {formatDate(evt.date)}
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
    <div className="py-4">
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm rounded-2xl px-4 py-3 backdrop-blur-sm">
          {error}
        </div>
      )}

      {loading ? renderSkeletons() : events.length === 0 ? renderEmpty() : renderCards()}
    </div>
  );
};

export default BentoGrid;
