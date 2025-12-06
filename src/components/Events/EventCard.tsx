'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, Heart, Flame, Tag, Play, ArrowRight } from 'lucide-react';
import { Event } from '../../types';
import Tooltip from '../UI/Tooltip';
import { useFavorites } from '../../context/FavoritesContext';

interface EventCardProps {
  event: Event;
  onClick?: (event: Event) => void;
}

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
      className={`group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 ease-out transform flex flex-col h-full relative cursor-pointer shadow-glass
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        hover:scale-[1.02] hover:bg-white/10 hover:shadow-glass-lg active:scale-[0.98]`}
    >
      <div className="absolute top-4 right-4 z-20">
        <Tooltip content={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}>
          <button 
            className={`p-2.5 rounded-full backdrop-blur-xl transition-all duration-300 active:scale-90 ${
              isFav 
                ? 'bg-red-500 text-white border border-red-400' 
                : 'bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-500/50'
            }`}
            onClick={handleFavoriteClick}
          >
            <Heart size={16} className={`transition-colors ${isFav ? 'fill-current' : ''}`} strokeWidth={2} />
          </button>
        </Tooltip>
      </div>

      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gray-800 animate-pulse z-0 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />

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
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${isHovered ? 'opacity-0' : (imageLoaded ? 'opacity-100' : 'opacity-0')} group-hover:scale-110`}
            />
            <div className={`absolute z-10 bottom-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
               <Play size={12} className="text-white fill-white" />
            </div>
          </>
        ) : (
          <img
            src={coverImage}
            alt={event.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start z-10 pointer-events-none">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            {event.category}
          </div>

          {event.isPromo && event.discountPercent && (
            <div className="flex items-center bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              <Tag size={10} className="mr-1" fill="currentColor" />
              -{event.discountPercent}%
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center text-orange-400 font-medium text-xs">
            <Calendar size={12} className="mr-1.5" strokeWidth={2} />
            {formattedDate}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-2 leading-tight line-clamp-2 min-h-[3rem] group-hover:text-orange-400 transition-colors">
          {event.title}
          {event.isPopular && (
            <span className="inline-flex align-middle ml-2" title="Populaire">
              <Flame className="text-orange-500 fill-orange-500" size={16} />
            </span>
          )}
        </h3>

        <div className="flex items-center text-gray-400 text-sm mb-4">
          <MapPin size={14} className="mr-1.5 shrink-0 text-gray-500" strokeWidth={2} />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
              A partir de
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white">{formatPrice(event.price)}</span>
              {originalPrice && (
                <span className="text-xs text-red-400 font-medium line-through">
                  {originalPrice}
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-300">
            <ArrowRight size={16} className="text-white" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;