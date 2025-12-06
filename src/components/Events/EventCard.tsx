'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Heart, Tag, Play, BadgeCheck, AlertTriangle } from 'lucide-react';
import { Event } from '../../types';
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

  const formatPrice = (price: number, showFromPrefix: boolean = false) => {
    if (price === 0) return 'GRATUIT';
    const formatted = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' })
      .format(price)
      .replace('XOF', 'F CFA');
    return showFromPrefix ? `Dès ${formatted}` : formatted;
  };

  const calculatePromoPrice = (price: number, discountPercent: number) => {
    return Math.round(price * (1 - discountPercent / 100));
  };

  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(event.date));

  const detailHref = event.slug ? `/events/${event.slug}` : `/events/${event.id}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(event.id);
  };

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onClick) {
      onClick(event);
    } else if (typeof window !== 'undefined') {
      window.location.href = detailHref;
    }
  };

  const isBlobOrData = (url?: string | null) =>
    !!url && (url.startsWith('blob:') || url.startsWith('data:'));

  const coverImage = (() => {
    if (event.imageUrl && !isBlobOrData(event.imageUrl)) return event.imageUrl;
    const first = Array.isArray(event.images) ? event.images.find((img) => !isBlobOrData(img)) : undefined;
    if (first) return first;
    return 'https://images.unsplash.com/photo-1459749411177-3a269496a607?q=80&w=1200&auto=format&fit=crop';
  })();

  const hasTicketTypes = event.ticketTypes && event.ticketTypes.length > 0;
  const ticketPrices = hasTicketTypes 
    ? event.ticketTypes!.map((t: { price: number }) => t.price) 
    : [event.price];
  const minPrice = Math.min(...ticketPrices);
  const maxPrice = Math.max(...ticketPrices);
  const hasFreeTickets = ticketPrices.some(p => p === 0);
  const hasPaidTickets = ticketPrices.some(p => p > 0);
  const minPaidPrice = hasPaidTickets 
    ? Math.min(...ticketPrices.filter(p => p > 0)) 
    : 0;
  
  const basePrice = (hasFreeTickets && hasPaidTickets) ? minPaidPrice : minPrice;
  const showFromPrefix = hasTicketTypes && (hasFreeTickets && hasPaidTickets || ticketPrices.length > 1 && minPrice !== maxPrice);
  
  const finalPrice = event.isPromo && event.discountPercent && basePrice > 0
    ? calculatePromoPrice(basePrice, event.discountPercent)
    : basePrice;

  const totalAvailableTickets = event.availableTickets;
  const hasAvailabilityData = typeof totalAvailableTickets === 'number' && isFinite(totalAvailableTickets);
  const isAlmostSoldOut = hasAvailabilityData && totalAvailableTickets > 0 && totalAvailableTickets < 100;
  const isSoldOut = hasAvailabilityData && totalAvailableTickets === 0;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={`group bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden transition-all duration-500 ease-out transform cursor-pointer h-96 flex flex-col justify-end p-5 relative
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        hover:bg-white/15 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gray-800 animate-pulse z-0 transition-opacity duration-500 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />
        
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
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${isHovered ? 'opacity-0' : (imageLoaded ? 'opacity-100' : 'opacity-0')} group-hover:scale-110`}
            />
            <div className={`absolute z-10 bottom-24 right-5 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
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
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
      </div>

      {/* Verified Badge - Top Right */}
      {event.isVerified && (
        <div className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md rounded-full p-1.5 border border-white/20 shadow-lg">
          <BadgeCheck className="w-5 h-5 text-blue-400" />
        </div>
      )}

      {/* Favorite Button - Top Right (if not verified) */}
      {!event.isVerified && (
        <div className="absolute top-4 right-4 z-20">
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
        </div>
      )}

      {/* Promo Badge - Top Left */}
      {event.isPromo && event.discountPercent && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <div className="flex items-center bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
            <Tag size={10} className="mr-1" fill="currentColor" />
            PROMO
          </div>
          <div className="bg-black/80 backdrop-blur-sm text-white text-xs font-black px-2 py-1.5 rounded-full border border-white/20">
            -{event.discountPercent}%
          </div>
        </div>
      )}

      {/* Availability Badge - Below Promo or Top Left */}
      {isSoldOut && (
        <div className={`absolute ${event.isPromo ? 'top-14' : 'top-4'} left-4 z-20`}>
          <div className="flex items-center bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide animate-pulse">
            <AlertTriangle size={10} className="mr-1" />
            ÉPUISÉ
          </div>
        </div>
      )}
      {isAlmostSoldOut && !isSoldOut && (
        <div className={`absolute ${event.isPromo ? 'top-14' : 'top-4'} left-4 z-20`}>
          <div className="flex items-center bg-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide animate-pulse">
            <AlertTriangle size={10} className="mr-1" />
            PRESQUE ÉPUISÉ
          </div>
        </div>
      )}

      {/* Content - Bottom Aligned */}
      <div className="relative z-10 transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
        <div className="flex justify-between items-start mb-2">
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white border border-white/10 shadow-sm">
            {event.category}
          </span>
          <div className="text-right bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
            {event.isPromo && event.discountPercent && basePrice > 0 ? (
              <>
                <span className="text-gray-400 text-sm line-through block">
                  {formatPrice(basePrice)}
                </span>
                <span className={`font-bold text-lg drop-shadow-md ${finalPrice === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                  {formatPrice(finalPrice, showFromPrefix)}
                </span>
              </>
            ) : (
              <span className={`font-bold text-lg drop-shadow-md ${basePrice === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                {formatPrice(basePrice, showFromPrefix)}
              </span>
            )}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-1 leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {formattedDate}
          <br/>
          <span className="text-gray-400 flex items-center gap-1 mt-1">
            <MapPin size={12} className="shrink-0" />
            {event.location}
          </span>
        </p>

        <button 
          onClick={handleClick}
          className="w-full py-3 rounded-2xl bg-white text-black font-bold text-sm hover:bg-orange-500 hover:text-white transition-all duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 shadow-xl"
        >
          Réserver sa place
        </button>
      </div>
    </div>
  );
};

export default EventCard;
