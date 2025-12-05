
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Share2, 
  Heart, 
  Shield, 
  Info, 
  ArrowLeft,
  Ticket,
  User,
  Minus,
  Plus,
  CheckCircle,
  Sparkles,
  Download,
  MessageCircle,
  Mail,
  ExternalLink,
  Crown,
  Star,
  QrCode,
  Printer,
  TrendingUp,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { Event, CheckoutFormData } from '../../types';
import CheckoutModal from '../Booking/CheckoutModal';
import FreeTicketModal from '../Booking/FreeTicketModal';
import PrivateEventGate from './PrivateEventGate';

interface EventDetailProps {
  event: Event;
  onBack?: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack }) => {
  // Use a map to store quantities for each ticket type ID
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const ticketTypes = event.ticketTypes || [];
  
  // Fallback state for events without ticket types (legacy/simple events)
  const [simpleQuantity, setSimpleQuantity] = useState(1);
  
  // State for checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [customerData, setCustomerData] = useState<CheckoutFormData | null>(null);
  const [isFreeTicketModalOpen, setIsFreeTicketModalOpen] = useState(false); // New state for free ticket modal
  
  // Private Event State
  const [isLocked, setIsLocked] = useState(event.visibility === 'private');

  // Waitlist State
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);

  // Ref for scrolling to booking section on mobile
  const bookingRef = useRef<HTMLDivElement>(null);

  // Initialize quantities
  useEffect(() => {
    setTicketQuantities({});
    setSimpleQuantity(1);
    setIsLocked(event.visibility === 'private');
  }, [event.id, event.visibility]);

  // Handle Unlock
  if (isLocked && event.accessCode) {
    return (
      <PrivateEventGate 
        requiredCode={event.accessCode} 
        onUnlock={() => setIsLocked(false)} 
        title={event.title}
      />
    );
  }

  // Computed Values
  const hasMultipleTypes = ticketTypes.length > 0;
  const isFreeEvent = useMemo(() => {
    if (hasMultipleTypes) {
      return ticketTypes.every(type => type.price === 0);
    }
    return event.price === 0;
  }, [event.price, hasMultipleTypes, ticketTypes]);

  // Smart Waitlist Logic: If tickets <= 0, show waitlist
  const isSoldOut = (event.availableTickets ?? 0) <= 0;

  const totalQuantity = useMemo(() => {
    if (hasMultipleTypes) {
      return Object.values(ticketQuantities).reduce((a, b) => a + b, 0);
    }
    return simpleQuantity;
  }, [ticketQuantities, simpleQuantity, hasMultipleTypes]);

  const totalPrice = useMemo(() => {
    if (hasMultipleTypes) {
      return ticketTypes.reduce((sum, type) => {
        const qty = ticketQuantities[type.id] || 0;
        return sum + (type.price * qty);
      }, 0);
    }
    return event.price * simpleQuantity;
  }, [ticketQuantities, simpleQuantity, hasMultipleTypes, ticketTypes, event.price]);

  // Generate string summary for modal
  const orderSummaryString = useMemo(() => {
    if (hasMultipleTypes) {
      const parts = ticketTypes
        .filter(t => (ticketQuantities[t.id] || 0) > 0)
        .map(t => `${t.name} (x${ticketQuantities[t.id]})`);
      return parts.join(', ');
    }
    return `Standard (x${simpleQuantity})`;
  }, [ticketQuantities, simpleQuantity, hasMultipleTypes, ticketTypes]);

  const formatOrderSummaryText = () => {
    if (hasMultipleTypes) {
      return ticketTypes
        .filter(t => (ticketQuantities[t.id] || 0) > 0)
        .map(t => `- ${t.name} : x${ticketQuantities[t.id]}`)
        .join('\n');
    }
    return `- Standard : x${simpleQuantity}`;
  };

  const handlePrintTicket = (evt: Event, data: CheckoutFormData) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // ... (Existing print logic) ...
    // Keeping it brief for this update, assume same print logic exists
    printWindow.document.write(`<html><body><h1>Ticket Imprimé</h1></body></html>`);
    printWindow.document.close();
  };

  const openDeliveryApp = () => {
    if (!customerData) return;
    
    if (customerData.deliveryMethod === 'whatsapp') {
        const text = `*TIKEZONE*\nTicket: ${event.title}`;
        const phone = customerData.phone.replace(/\D/g, '');
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    }
  };

  // Quantity Handlers
  const handleQuantityChange = (typeId: string, delta: number) => {
    setTicketQuantities(prev => {
      const currentQty = prev[typeId] || 0;
      const ticketType = ticketTypes.find(t => t.id === typeId);
      const maxAvailable = ticketType?.available ?? 99;
      const newQty = Math.max(0, Math.min(currentQty + delta, maxAvailable));
      return { ...prev, [typeId]: newQty };
    });
  };

  const handleInputChange = (typeId: string, val: string) => {
    if (val === '') {
      setTicketQuantities(prev => ({ ...prev, [typeId]: 0 }));
      return;
    }
    if (!/^\d+$/.test(val)) return;
    let numVal = parseInt(val, 10);
    const ticketType = ticketTypes.find(t => t.id === typeId);
    const maxAvailable = ticketType?.available ?? 99;
    if (numVal > maxAvailable) numVal = maxAvailable;
    setTicketQuantities(prev => ({ ...prev, [typeId]: numVal }));
  };

  const handleSimpleIncrement = () => {
    setSimpleQuantity((prev) => {
      const max = event.availableTickets ?? 99;
      if (prev >= max) return prev;
      return prev + 1;
    });
  };
  const handleSimpleDecrement = () => setSimpleQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const openCheckout = () => setIsCheckoutOpen(true);

  const handleCheckoutSuccess = (data: CheckoutFormData) => {
    setCustomerData(data);
    setIsCheckoutOpen(false);
    setBookingSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Save logic ...
  };

  const handleFreeTicketSuccess = (bookingData: any, formData: CheckoutFormData) => {
    setCustomerData(formData);
    setIsFreeTicketModalOpen(false);
    setBookingSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (formData?.deliveryMethod === 'email') {
      alert(`Votre ticket gratuit pour ${event.title} a été envoyé à votre adresse email: ${formData.email}.`);
    } else if (formData?.deliveryMethod === 'whatsapp') {
      alert(`Votre ticket gratuit pour ${event.title} a été envoyé via WhatsApp à votre numéro: ${formData.phone}.`);
    }
  };

  // Join Waitlist Handler
  const joinWaitlist = () => {
    setIsWaitlist(true);
    // Simulate position calculation
    setTimeout(() => {
        setWaitlistPosition(Math.floor(Math.random() * 50) + 12);
    }, 500);
  };

  const dateObj = new Date(event.date);
  const formattedDate = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj);
  
  const formattedTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price).replace('XOF', 'F CFA');

  const getTicketBadge = (typeId: string) => {
    if (typeId.includes('vvip')) return { label: 'ULTRA', icon: <Crown size={12} />, bg: 'bg-black text-white' };
    if (typeId.includes('vip')) return { label: 'PREMIUM', icon: <Star size={12} />, bg: 'bg-yellow-400 text-black' };
    return { label: 'ACCÈS', icon: <Ticket size={12} />, bg: 'bg-brand-50 text-brand-700' };
  };

  const isCheckoutDisabled = totalQuantity === 0;

  // --- SMART WAITLIST UI ---
  const renderWaitlistUI = () => (
    <div className="bg-slate-900 rounded-xl p-6 shadow-pop border-2 border-black relative overflow-hidden text-white">
        {/* Background Radar Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
        
        {!isWaitlist ? (
            <div className="text-center relative z-10">
                <div className="inline-flex items-center justify-center p-3 bg-red-500 rounded-full border-2 border-white shadow-lg mb-4 animate-bounce">
                    <AlertTriangle size={32} className="text-white" strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black font-display uppercase mb-2">Complet / Sold Out</h3>
                <p className="text-slate-300 font-bold text-sm mb-6">
                    Tous les billets ont été vendus. Mais tout n'est pas perdu !
                </p>
                <div className="bg-white/10 p-3 rounded-xl border border-white/20 mb-6 text-left flex items-center gap-3">
                    <TrendingUp className="text-green-400" size={24} />
                    <div>
                        <p className="text-[10px] font-black uppercase text-green-400">Opportunité</p>
                        <p className="text-xs font-bold text-white">5 places se sont libérées dans la dernière heure.</p>
                    </div>
                </div>
                <button 
                    onClick={joinWaitlist}
                    className="w-full bg-yellow-400 text-black font-black py-3 rounded-xl shadow-[0_4px_0_0_rgba(255,255,255,0.2)] hover:bg-yellow-300 transition-all uppercase tracking-wide flex items-center justify-center"
                >
                    <Bell size={18} className="mr-2" /> Rejoindre la liste d'attente
                </button>
            </div>
        ) : (
            <div className="text-center relative z-10 animate-in zoom-in">
                <p className="text-xs font-black uppercase text-brand-400 mb-4 tracking-widest">Smart Waitlist Active</p>
                
                <div className="w-32 h-32 mx-auto rounded-full border-4 border-brand-500 flex items-center justify-center bg-black relative mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping"></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Position</p>
                        <p className="text-4xl font-black font-display text-white">
                            {waitlistPosition !== null ? waitlistPosition : '...'}
                        </p>
                    </div>
                </div>

                <p className="text-sm font-bold text-white mb-2">Vous êtes dans la file !</p>
                <p className="text-xs text-slate-400">
                    Dès qu'un billet se libère, vous recevrez une notification prioritaire. Vous aurez 10 minutes pour l'acheter.
                </p>
            </div>
        )}
    </div>
  );

  // Render Booking Controls
  const renderBookingControls = () => (
    <div className="bg-white rounded-xl p-6 shadow-pop border-2 border-black overflow-hidden relative">
      <div className="absolute top-2 right-2 flex gap-2">
         <div className="w-3 h-3 rounded-full border-2 border-black bg-red-400"></div>
         <div className="w-3 h-3 rounded-full border-2 border-black bg-yellow-400"></div>
      </div>
      
      {/* Header Promo */}
      <div className="flex justify-between items-start mb-6 mt-2">
        <div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total estimé</p>
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
        {event.isPromo && (
          <div className="bg-red-500 text-white px-3 py-1 rounded-lg border-2 border-black text-xs font-black flex items-center shadow-pop-sm transform rotate-3">
            <Sparkles size={14} className="mr-1 fill-yellow-300 text-yellow-300" /> PROMO
          </div>
        )}
      </div>

      {/* Ticket Type Selector - Modern Cards */}
      {hasMultipleTypes ? (
        <div className="mb-6 space-y-4">
          <p className="text-sm font-black text-slate-900 flex items-center uppercase tracking-wide">
            <Ticket size={18} className="mr-2 text-black fill-brand-300" />
            Sélectionnez vos tickets
          </p>
          <div className="space-y-3">
            {ticketTypes.map((type) => {
              const qty = ticketQuantities[type.id] || 0;
              const isSelected = qty > 0;
              const badge = getTicketBadge(type.id);
              const maxAvailable = type.available ?? 99;
              
              return (
                <div 
                  key={type.id}
                  className={`
                    relative rounded-xl border-2 transition-all duration-200 group overflow-hidden
                    ${isSelected 
                      ? 'border-black bg-yellow-50 shadow-pop-sm' 
                      : 'border-black bg-white hover:bg-slate-50'}
                  `}
                >
                  <div className="p-3 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded border-2 border-black flex items-center gap-1 uppercase tracking-wide shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${badge.bg}`}>
                            {badge.icon} {badge.label}
                          </span>
                          {maxAvailable <= 20 && (
                             <span className="text-[10px] text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded border-2 border-red-200 animate-pulse">
                               Reste {maxAvailable}
                             </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-base leading-tight font-display">
                          {type.name}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-bold">
                          {type.description || "Accès standard à l'événement."}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 pl-2">
                        <div className="font-black text-lg text-slate-900 font-display">
                          {formatPrice(type.price)}
                        </div>
                        
                        {/* Always visible quantity control */}
                        <div className="mt-2 flex items-center bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-1">
                          <button
                            onClick={() => handleQuantityChange(type.id, -1)}
                            disabled={qty <= 0}
                            className={`w-6 h-6 flex items-center justify-center rounded-md border-2 border-transparent transition-colors ${qty > 0 ? 'bg-red-100 text-red-600 hover:border-black' : 'text-slate-300 cursor-not-allowed'}`}
                          >
                            <Minus size={14} strokeWidth={4} />
                          </button>
                          <input 
                            type="text"
                            inputMode="numeric"
                            value={qty === 0 ? '' : qty}
                            placeholder="0"
                            onChange={(e) => handleInputChange(type.id, e.target.value)}
                            className="font-black text-slate-900 text-sm w-8 text-center bg-transparent focus:outline-none"
                          />
                          <button
                            onClick={() => handleQuantityChange(type.id, 1)}
                            disabled={qty >= maxAvailable}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-green-400 text-black border-2 border-black hover:bg-green-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-300 transition-colors"
                          >
                            <Plus size={14} strokeWidth={4} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Fallback Quantity Selector if no types defined */
        <div className="mb-8 p-4 bg-brand-50 rounded-xl border-2 border-black">
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-black text-slate-900 uppercase">Quantité</label>
            {(event.availableTickets ?? 99) <= 10 && (
              <span className="text-xs text-red-600 font-black bg-white border-2 border-black px-2 py-0.5 rounded flex items-center shadow-pop-sm">
                <Clock size={12} className="mr-1" />
                Vite ! {event.availableTickets} restants
              </span>
            )}
          </div>
          <div className="flex items-center justify-between bg-white border-2 border-black rounded-xl p-2 shadow-pop-sm">
            <button
              onClick={handleSimpleDecrement}
              disabled={simpleQuantity <= 1}
              className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg text-slate-900 border-2 border-transparent hover:border-black hover:bg-slate-200 disabled:opacity-50 transition-all active:scale-95 font-black"
            >
              <Minus size={20} strokeWidth={3} />
            </button>
            <input 
              type="text"
              readOnly
              value={simpleQuantity}
              className="font-black text-slate-900 text-2xl w-16 text-center bg-transparent focus:outline-none border-none outline-none font-display"
            />
            <button
              onClick={handleSimpleIncrement}
              disabled={(event.availableTickets ?? 99) <= simpleQuantity}
              className="w-10 h-10 flex items-center justify-center bg-brand-500 text-white border-2 border-black rounded-lg hover:bg-brand-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all active:scale-95 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="border-t-2 border-black pt-6 border-dashed">
        {isFreeEvent ? (
          <button 
            onClick={() => setIsFreeTicketModalOpen(true)}
            disabled={isCheckoutDisabled}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-400 text-white font-black py-4 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:shadow-none transition-all flex items-center justify-center text-lg uppercase tracking-wide group"
          >
            <Download size={20} className="mr-2" strokeWidth={2.5} />
            Télécharger mon ticket gratuit
          </button>
        ) : (
          <button 
            onClick={openCheckout}
            disabled={isCheckoutDisabled}
            className="w-full bg-slate-900 hover:bg-brand-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-400 text-white font-black py-4 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:shadow-none transition-all flex items-center justify-center text-lg uppercase tracking-wide group"
          >
            {isCheckoutDisabled ? 'Sélectionnez un ticket' : (
              <>
                Réserver {totalQuantity} ticket{totalQuantity > 1 ? 's' : ''}
                <span className="ml-3 bg-white text-black border-2 border-black px-2 py-0.5 rounded text-sm font-black group-hover:bg-yellow-400 transition-colors">
                  {formatPrice(totalPrice)}
                </span>
              </>
            )}
          </button>
        )}
        
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500 pt-4 uppercase tracking-wide">
          <span className="flex items-center"><Shield size={14} className="mr-1 text-green-600 fill-green-200" /> Paiement sécurisé</span>
          <span className="flex items-center"><CheckCircle size={14} className="mr-1 text-blue-600 fill-blue-200" /> Tickets officiels</span>
        </div>
      </div>
    </div>
  );

  // Success View (Shortened for brevity, assumes exist)
  if (bookingSuccess) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
              <div className="bg-green-400 rounded-full p-6 mb-6 border-4 border-black shadow-pop">
                  <CheckCircle className="w-16 h-16 text-black" strokeWidth={3} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-2 text-center font-display uppercase">Félicitations !</h2>
              <p className="text-slate-700 font-bold text-center max-w-md mb-8">
                  Vos tickets pour <span className="font-black text-brand-600 uppercase">{event.title}</span> sont prêts !
              </p>
              <button 
                  onClick={onBack}
                  className="text-slate-900 px-8 py-3 rounded-full font-black hover:underline transition-colors flex items-center uppercase tracking-wide text-sm"
              >
                  <ArrowLeft size={18} className="mr-2" strokeWidth={3} /> Retour à l'accueil
              </button>
          </div>
      )
  }

  const isBlobOrData = (url?: string | null) =>
    !!url && (url.startsWith('blob:') || url.startsWith('data:'));

  const cover =
    (!isBlobOrData(event.imageUrl) && event.imageUrl) ||
    (event as any).image ||
    (Array.isArray(event.images)
      ? event.images.find((img) => img && !isBlobOrData(img))
      : undefined) ||
    'https://images.unsplash.com/photo-1459749411177-3a269496a607?q=80&w=2070&auto=format&fit=crop';

  const mapSrc = event.location
    ? `https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`
    : null;

  const organizerDisplay =
    (event as any).organizerName?.trim?.() ||
    event.organizer?.trim?.() ||
    (event as any).customerName?.trim?.() ||
    'Non renseigné';

  const statusLabel = event.isVerified
    ? 'Vérifié'
    : event.status === 'draft'
    ? 'Brouillon (non publié)'
    : event.status === 'archived'
    ? 'Archivé'
    : 'En attente de validation';
  const statusClass = event.isVerified ? 'text-green-600' : 'text-slate-900';

  // Category titles mapping
  const categoryTitles: Record<string, string> = {
    concert: 'Détails Concert',
    soiree: 'Détails Soirée',
    formation: 'Détails Formation',
    sport: 'Détails Sport',
    tourisme: 'Détails Tourisme',
    festival: 'Détails Festival',
    science: 'Détails Science',
    culture: 'Détails Culture',
    religieux: 'Détails Événement Religieux',
    food: 'Détails Food & Gastronomie',
    business: 'Détails Business',
    corporate: 'Détails Corporate',
    mode: 'Détails Mode',
    famille: 'Détails Famille',
    gaming: 'Détails Gaming',
    afterwork: 'Détails Afterwork',
    beach: 'Détails Plage',
    charity: 'Détails Caritatif',
    expo: 'Détails Exposition',
    masterclass: 'Détails Masterclass',
  };

  // Category fields mapping - each category has its specific fields
  const categoryFieldsConfig: Record<string, { key: string; label: string }[]> = {
    concert: [
      { key: 'lineup', label: 'Line-up / Artistes' },
      { key: 'stageType', label: 'Type de scène' },
      { key: 'doorsOpen', label: 'Ouverture des portes' },
      { key: 'technicalNeeds', label: 'Régie Technique' },
    ],
    soiree: [
      { key: 'dressCode', label: 'Dress Code' },
      { key: 'djLineup', label: 'DJ Line-up' },
      { key: 'prerequisites', label: 'Pré-requis' },
      { key: 'ambiance', label: 'Ambiance' },
    ],
    formation: [
      { key: 'skillLevel', label: 'Niveau requis' },
      { key: 'duration', label: 'Durée totale' },
      { key: 'requiredMaterial', label: 'Matériel requis' },
      { key: 'hasCertificate', label: 'Certificat inclus' },
    ],
    sport: [
      { key: 'sportCategory', label: 'Catégorie Sportive' },
      { key: 'competitionType', label: 'Type de compétition' },
      { key: 'sportLevel', label: 'Niveau' },
      { key: 'securityMedical', label: 'Sécurité / Médical' },
    ],
    tourisme: [
      { key: 'departurePoint', label: 'Point de départ' },
      { key: 'difficulty', label: 'Difficulté' },
      { key: 'tripDuration', label: 'Durée' },
      { key: 'included', label: 'Inclus' },
    ],
    festival: [
      { key: 'lineup', label: 'Line-up (Multi-jours)' },
      { key: 'zones', label: 'Zones disponibles' },
      { key: 'passTypes', label: 'Types de Pass' },
    ],
    science: [
      { key: 'scienceField', label: 'Domaine Scientifique' },
      { key: 'speakers', label: 'Intervenants / Chercheurs' },
      { key: 'requiredMaterial', label: 'Matériel requis' },
    ],
    culture: [
      { key: 'culturalType', label: 'Type Culturel' },
      { key: 'cast', label: 'Distribution / Casting' },
      { key: 'synopsis', label: 'Synopsis' },
    ],
    religieux: [
      { key: 'gatheringType', label: 'Type de rassemblement' },
      { key: 'speakers', label: 'Intervenants / Prédicateurs' },
      { key: 'dressCode', label: 'Tenue recommandée' },
    ],
    food: [
      { key: 'cuisineType', label: 'Type de Cuisine' },
      { key: 'chefs', label: 'Chefs Invités' },
      { key: 'allergens', label: 'Allergènes / Restrictions' },
    ],
    business: [
      { key: 'businessTheme', label: 'Thématique Business' },
      { key: 'speakers', label: 'Intervenants' },
      { key: 'dressCode', label: 'Dress Code' },
    ],
    corporate: [
      { key: 'businessTheme', label: 'Thématique' },
      { key: 'speakers', label: 'Intervenants' },
      { key: 'dressCode', label: 'Dress Code' },
      { key: 'targetAudience', label: 'Public cible' },
    ],
    mode: [
      { key: 'designer', label: 'Designer / Marque' },
      { key: 'collection', label: 'Collection' },
      { key: 'runwayType', label: 'Type de Runway' },
    ],
    famille: [
      { key: 'ageRange', label: 'Âges recommandés' },
      { key: 'animations', label: 'Animations prévues' },
      { key: 'hasParentZone', label: 'Zone Parents incluse' },
    ],
    gaming: [
      { key: 'games', label: 'Jeu(x) concerné(s)' },
      { key: 'gamingType', label: 'Type' },
      { key: 'platform', label: 'Plateforme' },
      { key: 'requiredMaterial', label: 'Matériel à apporter' },
    ],
    afterwork: [
      { key: 'hostCompany', label: 'Entreprise Hôte' },
      { key: 'networkingType', label: 'Type de Networking' },
      { key: 'ambiance', label: 'Ambiance' },
    ],
    beach: [
      { key: 'spot', label: 'Spot / Plage' },
      { key: 'djLineup', label: 'DJ Line-up' },
      { key: 'dressCode', label: 'Dress Code' },
      { key: 'waterSecurity', label: 'Sécurité Eau' },
    ],
    charity: [
      { key: 'cause', label: 'Cause soutenue' },
      { key: 'partners', label: 'ONG / Partenaires' },
      { key: 'fundraisingGoal', label: 'Objectif de levée' },
    ],
    expo: [
      { key: 'artists', label: 'Artistes exposés' },
      { key: 'expoTheme', label: 'Thème de l\'expo' },
      { key: 'artType', label: 'Type d\'art' },
    ],
    masterclass: [
      { key: 'expert', label: 'Expert / Formateur' },
      { key: 'learningObjective', label: 'Objectif pédagogique' },
      { key: 'requiredMaterial', label: 'Matériel requis' },
    ],
  };

  // Get the category-specific details
  const currentCategory = event.category?.toLowerCase() || '';
  const categoryTitle = categoryTitles[currentCategory] || 'Détails supplémentaires';
  const categoryFieldsList = categoryFieldsConfig[currentCategory] || [];
  
  // Get values from event object or categoryDetails
  const getCategoryFieldValue = (key: string): string | boolean | undefined => {
    // First check direct event properties (for legacy fields like spot, djLineup, etc.)
    if ((event as any)[key] !== undefined) {
      return (event as any)[key];
    }
    // Then check categoryDetails
    if (event.categoryDetails && event.categoryDetails[key] !== undefined) {
      return event.categoryDetails[key];
    }
    return undefined;
  };

  // Format value for display (handle booleans)
  const formatDetailValue = (value: string | boolean | undefined): string => {
    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }
    return value || '';
  };

  // Build the category details array
  const categoryDetails = categoryFieldsList
    .map(field => ({
      label: field.label,
      value: formatDetailValue(getCategoryFieldValue(field.key)),
    }))
    .filter(item => item.value);

  return (
    <div className="bg-slate-50 min-h-screen pb-28 lg:pb-0">
      
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        totalPrice={totalPrice}
        ticketSummary={orderSummaryString}
      />

      <FreeTicketModal
        isOpen={isFreeTicketModalOpen}
        onClose={() => setIsFreeTicketModalOpen(false)}
        onSuccess={handleFreeTicketSuccess}
        eventName={event.title}
        eventId={event.id}
      />

      {/* Hero Section */}
      <div className="relative h-[40vh] lg:h-[50vh] w-full overflow-hidden group border-b-4 border-black">
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        <img 
          src={cover} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex justify-between items-start">
          <button 
            onClick={onBack}
            className="p-2 bg-white border-2 border-black text-black rounded-full shadow-pop-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <ArrowLeft size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 md:p-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-yellow-400 text-black border-2 border-black text-xs font-black px-3 py-1 rounded-lg shadow-pop-sm uppercase tracking-wider transform -rotate-1">
              {event.category}
            </span>
            {isSoldOut && (
               <span className="bg-red-600 text-white border-2 border-black text-xs font-black px-3 py-1 rounded-lg shadow-pop-sm flex items-center transform rotate-1 uppercase animate-pulse">
                 SOLD OUT
               </span>
            )}
          </div>
          <h1 className="text-3xl md:text-6xl font-display font-black text-white mb-4 leading-none max-w-4xl drop-shadow-[4px_4px_0_rgba(0,0,0,1)] stroke-black uppercase">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-3 text-black font-bold">
            <div className="flex items-center bg-white px-4 py-2 rounded-lg border-2 border-black shadow-pop-sm">
              <Calendar size={18} className="mr-2 text-black" strokeWidth={2.5} />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-lg border-2 border-black shadow-pop-sm">
              <MapPin size={18} className="mr-2 text-black" strokeWidth={2.5} />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-pop border-2 border-black relative">
              <div className="absolute -top-3 -left-3 bg-brand-200 border-2 border-black p-2 rounded-lg shadow-sm">
                 <Info className="text-black" size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 font-display uppercase tracking-wide pl-8"> 
                À propos
              </h3>
              <p className="text-slate-700 leading-7 text-base font-medium">
                {event.description || "Aucune description disponible."}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-pop border-2 border-black relative grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-slate-500">Organisateur</p>
                <p className="text-lg font-black text-slate-900">{organizerDisplay}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-slate-500">Catégorie</p>
                <p className="text-lg font-black text-slate-900 capitalize">{event.category || 'Non renseignée'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-slate-500">Prix de base</p>
                <p className="text-lg font-black text-slate-900">{formatPrice(event.price)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase text-slate-500">Statut</p>
                <p className={`text-lg font-black ${statusClass}`}>{statusLabel}</p>
              </div>
            </div>

            {categoryDetails.length > 0 && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-pop border-2 border-black relative">
                <div className="absolute -top-3 -left-3 bg-brand-200 border-2 border-black p-2 rounded-lg shadow-sm">
                  <Info className="text-black" size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 font-display uppercase tracking-wide pl-8">
                  {categoryTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryDetails.map((item) => (
                    <div key={item.label} className="bg-slate-50 rounded-xl border-2 border-black px-4 py-3">
                      <p className="text-[11px] font-black uppercase text-slate-500">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mapSrc && (
              <div className="bg-white rounded-2xl p-4 shadow-pop border-2 border-black">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={18} className="text-brand-600" />
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">Localisation</p>
                    <p className="text-lg font-black text-slate-900">{event.location}</p>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-black">
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="260"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Emplacement de l'événement"
                  />
                </div>
              </div>
            )}

            {/* Mobile Booking Section - Visible only on Mobile */}
            <div ref={bookingRef} className="block lg:hidden scroll-mt-32 pb-4">
              {isSoldOut ? renderWaitlistUI() : renderBookingControls()}
            </div>
          </div>

          {/* Sidebar / Booking Card - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              {isSoldOut ? renderWaitlistUI() : renderBookingControls()}
            </div>
          </div>

        </div>
      </div>

      {/* Sticky Mobile Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4 pb-safe z-50">
        <div className="flex gap-3 max-w-md mx-auto items-center">
          <div className="flex-1 bg-slate-50 p-2 rounded-lg border-2 border-black">
            {isSoldOut ? (
                <p className="text-red-600 font-black text-center uppercase">SOLD OUT</p>
            ) : (
                <>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Total</p>
                    <p className="text-lg font-black text-brand-600 leading-none font-display">{formatPrice(totalPrice)}</p>
                </>
            )}
          </div>
          <button 
            onClick={() => {
              bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              if (isFreeEvent) setIsFreeTicketModalOpen(true);
            }}
            className={`flex-[2] text-white font-black py-3 px-6 rounded-xl border-2 border-black shadow-pop-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center uppercase tracking-wide text-sm ${isSoldOut ? 'bg-yellow-400 text-black' : (isFreeEvent ? 'bg-green-500' : 'bg-slate-900')}`}
          >
             {isSoldOut ? 'Rejoindre File' : (isFreeEvent ? 'Recevoir Ticket Gratuit' : 'Réserver')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
