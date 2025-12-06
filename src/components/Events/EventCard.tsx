'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, Heart, Flame, Tag, Play, ArrowRight, Star, Sparkles } from 'lucide-react';
import { Event } from '../../types';
import Tooltip from '../UI/Tooltip';
import { useFavorites } from '../../context/FavoritesContext';

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

const cardGradients = [
  'from-brand-50 to-pink-50',
  'from-yellow-50 to-orange-50',
  'from-cyan-50 to-blue-50',
  'from-green-50 to-emerald-50',
  'from-purple-50 to-indigo-50',
];

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(event.id);
  
  const isMounted = useRef(true);
  const gradientIndex = typeof event.id === 'number' ? event.id % cardGradients.length : 0;
  const cardGradient = cardGradients[gradientIndex];

  useEffect(() => {
    isMounted.current = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && isMounted.current) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      isMounted.current = false;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let playPromise: Promise<void> | undefined;
    
    if (isHovered && event.videoUrl && !videoError && videoRef.current) {
      const timer = setTimeout(() => {
        if (videoRef.current) {
          playPromise = videoRef.current.play();
          playPromise?.catch(() => {});
        }
      }, 300);
      return () => clearTimeout(timer);
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, event.videoUrl, videoError]);

  const dateObj = new Date(event.date);
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' })
      .format(price)
      .replace('XOF', 'F CFA');

  const originalPrice =
    event.isPromo && event.discountPercent
      ? formatPrice(event.price + event.price * (event.discountPercent / 100))
      : null;

  const detailHref = event.slug ? `/events/${event.slug}` : `/events/${event.id}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(event.id);
  };

  const isBlobOrData = (url?: string | null) =>
    !!url && (url.startsWith('blob:') || url.startsWith('data:'));

  const coverImage = (() => {
    if (event.imageUrl && !isBlobOrData(event.imageUrl)) return event.imageUrl;
    const first = Array.isArray(event.images) ? event.images.find((img) => !isBlobOrData(img)) : undefined;
    if (first) return first;
    return 'https://images.unsplash.com/photo-1459749411177-3a269496a607?q=80&w=1200&auto=format&fit=crop';
  })();

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (onClick) {
          onClick(event);
        } else if (typeof window !== 'undefined') {
          window.location.href = detailHref;
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (onClick) {
            onClick(event);
          } else if (typeof window !== 'undefined') {
            window.location.href = detailHref;
          }
        }
      }}
      role="button"
      tabIndex={0}
      className={`group bg-gradient-to-br ${cardGradient} rounded-3xl overflow-hidden border-4 border-black transition-all duration-300 ease-out transform flex flex-col h-full relative cursor-pointer
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        hover:-translate-y-2 shadow-[5px_5px_0_rgba(0,0,0,1)] hover:shadow-[7px_7px_0_rgba(0,0,0,1)] active:shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0`}
    >
      <div className="absolute top-3 right-3 z-20">
        <Tooltip content={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}>
          <button 
            className={`p-2.5 rounded-xl border-3 border-black transition-all transform active:scale-90 shadow-[3px_3px_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] ${
              isFav 
                ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white' 
                : 'bg-white text-slate-900 hover:bg-pink-100 hover:text-red-500'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart size={18} className={`transition-colors ${isFav ? 'fill-current' : ''}`} strokeWidth={2.5} />
          </button>
        </Tooltip>
      </div>

      <div className="relative h-52 overflow-hidden bg-slate-100 border-b-4 border-black">
        <div className={`absolute inset-0 bg-slate-200 animate-pulse z-0 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />

        {event.videoUrl && !videoError ? (
          <>
            <video
              ref={videoRef}
              src={event.videoUrl}
              loop
              muted
              playsInline
              onError={() => setVideoError(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
            <img
              src={coverImage}
              alt={event.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : (imageLoaded ? 'opacity-100' : 'opacity-0')}`}
            />
            <div className={`absolute z-10 bottom-3 right-3 bg-white border-3 border-black p-2 rounded-xl shadow-[2px_2px_0_rgba(0,0,0,1)] transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
               <Play size={14} className="text-black fill-black" />
            </div>
          </>
        ) : (
          <img
            src={coverImage}
            alt={event.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-in-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-300 to-orange-300 text-black text-xs font-black px-3 py-1.5 rounded-xl border-3 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase tracking-wider transform -rotate-2">
            {event.category}
          </div>

          {event.isPromo && event.discountPercent && (
            <div className="flex items-center bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black px-3 py-1.5 rounded-xl border-3 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] transform rotate-1">
              <Tag size={12} className="mr-1" fill="currentColor" />
              -{event.discountPercent}%
            </div>
          )}

          {event.isPopular && (
            <div className="flex items-center bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs font-black px-3 py-1.5 rounded-xl border-3 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
              <Flame size={12} className="mr-1 fill-current" />
              Tendance
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col relative bg-white">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center text-slate-900 font-bold text-xs bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
            <Calendar size={14} className="mr-1.5 text-blue-600" strokeWidth={2.5} />
            {formattedDate}
          </div>
        </div>

        <h3 className="font-display text-xl font-black text-slate-900 mb-2 leading-tight line-clamp-2 min-h-[3.5rem] group-hover:text-brand-600 transition-colors">
          {event.title}
        </h3>

        <div className="flex items-center text-slate-600 text-sm mb-4 font-bold">
          <MapPin size={16} className="mr-1.5 shrink-0 text-brand-500" strokeWidth={2.5} />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="mt-auto pt-4 border-t-3 border-dashed border-slate-200 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wide">
              À partir de
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">{formatPrice(event.price)}</span>
              {originalPrice && (
                <span className="text-xs text-red-400 font-bold line-through decoration-2">
                  {originalPrice}
                </span>
              )}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white border-3 border-black flex items-center justify-center shadow-[3px_3px_0_rgba(0,0,0,1)] group-hover:shadow-[4px_4px_0_rgba(0,0,0,1)] group-hover:scale-110 transition-all">
            <ArrowRight size={20} strokeWidth={3} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
