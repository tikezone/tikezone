import React, { useState, useEffect } from 'react';
import { X, Mail, MessageCircle, Download, Check, Loader2, User, Phone } from 'lucide-react';
import { CheckoutFormData } from '../../types';

interface FreeTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingData: any, formData: CheckoutFormData) => void;
  eventName: string;
  eventId: string;
}

const FreeTicketModal: React.FC<FreeTicketModalProps> = ({ isOpen, onClose, onSuccess, eventName, eventId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'none', // Placeholder, not actually used for free tickets
    deliveryMethod: 'email', 
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeliverySelect = (method: CheckoutFormData['deliveryMethod']) => {
    setFormData((prev) => ({ ...prev, deliveryMethod: method }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.deliveryMethod === 'email' && !formData.email) {
      alert("L'email est obligatoire pour la réception par Email.");
      setIsLoading(false);
      return;
    }
    if (formData.deliveryMethod === 'whatsapp' && !formData.phone) {
      alert("Le téléphone est obligatoire pour la réception par WhatsApp.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/tickets/generate-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, eventId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get free ticket');
      }
      const data = await res.json();
      onSuccess(data, formData);

    } catch (error) {
      console.error('Error getting free ticket:', error);
      alert(`Une erreur est survenue lors de la récupération de votre ticket: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={`
          relative w-full bg-white border-t-4 sm:border-4 border-black shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 sm:translate-y-10'}
          
          /* Mobile: Bottom Sheet style */
          h-[92dvh] rounded-t-3xl
          
          /* Desktop: Centered Modal style */
          sm:h-auto sm:max-h-[85vh] sm:rounded-3xl sm:max-w-lg sm:shadow-pop-lg
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-black flex justify-between items-center bg-green-300 sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-black text-black font-display uppercase tracking-wide">
            Votre Ticket Gratuit
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white border-2 border-black shadow-pop-sm active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <form id="free-ticket-form" onSubmit={handleSubmit} className="space-y-6">
            <p className="text-slate-700 font-bold">
              Remplissez le formulaire ci-dessous pour recevoir votre ticket gratuit pour l'événement <span className="font-black">{eventName}</span>.
            </p>

            {/* Delivery Method Selection */}
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-900 uppercase tracking-wide">Recevoir mon ticket par</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleDeliverySelect('whatsapp')}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all shadow-sm active:scale-95
                    ${formData.deliveryMethod === 'whatsapp' 
                      ? 'border-black bg-green-100 shadow-pop-sm' 
                      : 'border-slate-200 bg-white text-slate-400 hover:border-black'}
                  `}
                >
                  <MessageCircle size={28} className={`mb-2 ${formData.deliveryMethod === 'whatsapp' ? 'text-green-600 fill-green-200' : 'text-slate-300'}`} strokeWidth={2.5} />
                  <span className={`text-sm font-black ${formData.deliveryMethod === 'whatsapp' ? 'text-green-800' : 'text-slate-400'}`}>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeliverySelect('email')}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all shadow-sm active:scale-95
                    ${formData.deliveryMethod === 'email' 
                      ? 'border-black bg-blue-100 shadow-pop-sm' 
                      : 'border-slate-200 bg-white text-slate-400 hover:border-black'}
                  `}
                >
                  <Mail size={28} className={`mb-2 ${formData.deliveryMethod === 'email' ? 'text-blue-600 fill-blue-200' : 'text-slate-300'}`} strokeWidth={2.5} />
                  <span className={`text-sm font-black ${formData.deliveryMethod === 'email' ? 'text-blue-800' : 'text-slate-400'}`}>Email</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-900">Prénom <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                      <input
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
                        placeholder="Jean"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-900">Nom <span className="text-red-500">*</span></label>
                    <input
                      required
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
                      placeholder="Kouassi"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-900">
                    Téléphone {formData.deliveryMethod === 'whatsapp' && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                    <input
                      required={formData.deliveryMethod === 'whatsapp'}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
                      placeholder="07 00 00 00 00"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-900">
                    Email {formData.deliveryMethod === 'email' ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal text-xs">(Optionnel)</span>}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                    <input
                      required={formData.deliveryMethod === 'email'}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
                      placeholder="jean@exemple.com"
                    />
                  </div>
                </div>
              </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t-2 border-black bg-white shrink-0 pb-safe">
          <button
            type="submit"
            form="free-ticket-form"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-400 text-white font-black py-4 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] disabled:shadow-none transition-all flex items-center justify-center group uppercase tracking-widest text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={24} />
                Traitement...
              </>
            ) : (
              <>
                <Download size={20} className="mr-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                Recevoir mon ticket
              </>
            )}
          </button>
          
          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold flex items-center justify-center uppercase">
              <Check size={10} className="mr-1" /> Gratuit et Instantané
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTicketModal;