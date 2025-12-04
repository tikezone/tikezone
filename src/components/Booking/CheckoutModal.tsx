
import React, { useState, useEffect } from 'react';
import { X, Lock, CreditCard, Smartphone, Check, ChevronRight, Loader2, ArrowLeft, Mail, Phone, User, MessageCircle, Users, Plus, Trash2 } from 'lucide-react';
import { CheckoutFormData } from '../../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CheckoutFormData) => void;
  totalPrice: number;
  ticketSummary: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, totalPrice, ticketSummary }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Split Pay State
  const [paymentMode, setPaymentMode] = useState<'direct' | 'split'>('direct');
  const [participants, setParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'wave',
    deliveryMethod: 'whatsapp',
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setStep(1);
      setPaymentMode('direct');
      setParticipants([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSelect = (method: CheckoutFormData['paymentMethod']) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleDeliverySelect = (method: CheckoutFormData['deliveryMethod']) => {
    setFormData((prev) => ({ ...prev, deliveryMethod: method }));
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
      .format(price)
      .replace('XOF', 'F');

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;
    if (formData.deliveryMethod === 'email' && !formData.email) {
      alert("L'email est obligatoire pour la réception par Email.");
      return;
    }
    if (formData.deliveryMethod === 'whatsapp' && !formData.phone) {
      alert("Le téléphone est obligatoire pour la réception par WhatsApp.");
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess(formData);
    }, 2000);
  };

  // Split Pay Logic
  const addParticipant = () => {
    if (newParticipant.trim()) {
        setParticipants([...participants, newParticipant]);
        setNewParticipant('');
    }
  };

  const removeParticipant = (idx: number) => {
    const newP = [...participants];
    newP.splice(idx, 1);
    setParticipants(newP);
  };

  const splitAmount = totalPrice / (participants.length + 1);

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
        <div className="px-6 py-4 border-b-2 border-black flex justify-between items-center bg-yellow-300 sticky top-0 z-10 shrink-0">
          <div className="flex items-center space-x-2">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="mr-2 text-black hover:bg-black/10 transition-colors p-1.5 rounded-lg border-2 border-black bg-white shadow-pop-sm active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
                <ArrowLeft size={18} strokeWidth={3} />
              </button>
            )}
            <h2 className="text-xl font-black text-black font-display uppercase tracking-wide">
              {step === 1 ? 'Vos Infos' : 'Paiement'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white border-2 border-black shadow-pop-sm active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="flex w-full h-2 shrink-0 border-b-2 border-black">
          <div className={`h-full w-1/2 transition-colors duration-300 border-r-2 border-black ${step >= 1 ? 'bg-brand-500' : 'bg-slate-200'}`}></div>
          <div className={`h-full w-1/2 transition-colors duration-300 ${step >= 2 ? 'bg-brand-500' : 'bg-slate-200'}`}></div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          
          {step === 1 ? (
            <form id="info-form" onSubmit={handleSubmitInfo} className="space-y-6">
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
          ) : (
            <div className="space-y-6">
                
              {/* Payment Mode Toggle */}
              <div className="bg-slate-100 p-1 rounded-xl flex border-2 border-slate-200">
                <button 
                    onClick={() => setPaymentMode('direct')}
                    className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${paymentMode === 'direct' ? 'bg-white text-black shadow-sm border-2 border-black' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    Paiement Direct
                </button>
                <button 
                    onClick={() => setPaymentMode('split')}
                    className={`flex-1 py-2 rounded-lg text-sm font-black transition-all flex items-center justify-center ${paymentMode === 'split' ? 'bg-white text-brand-600 shadow-sm border-2 border-black' : 'text-slate-500 hover:text-slate-800'}`}
                >
                    <Users size={16} className="mr-1" /> Split Pay
                </button>
              </div>

              {paymentMode === 'split' ? (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                    <div className="bg-brand-50 p-4 rounded-xl border-2 border-brand-200 text-center">
                        <p className="text-xs font-bold text-brand-800 uppercase mb-1">Total à partager</p>
                        <p className="text-2xl font-black text-slate-900 font-display">{formatPrice(totalPrice)}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase ml-1">Ajouter des amis</label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 px-4 py-2 rounded-xl border-2 border-black text-sm font-bold outline-none focus:shadow-pop-sm"
                                placeholder="Nom ou Email..."
                                value={newParticipant}
                                onChange={(e) => setNewParticipant(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                            />
                            <button onClick={addParticipant} className="bg-slate-900 text-white p-2 rounded-xl border-2 border-black hover:bg-brand-600 transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-slate-900 rounded-full text-white flex items-center justify-center text-xs font-black mr-3">V</div>
                                <span className="font-bold text-sm">Vous</span>
                            </div>
                            <span className="font-black text-brand-600">{formatPrice(splitAmount)}</span>
                        </div>
                        {participants.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-xl border-2 border-black shadow-sm">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-yellow-400 rounded-full text-black flex items-center justify-center text-xs font-black mr-3 border border-black">{p.charAt(0).toUpperCase()}</div>
                                    <span className="font-bold text-sm">{p}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-slate-900">{formatPrice(splitAmount)}</span>
                                    <button onClick={() => removeParticipant(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-left-2">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">Mode de paiement</p>
                    
                    {/* Mobile Money Options */}
                    {[
                    { id: 'wave', name: 'Wave', color: 'bg-[#1dc4ff]', border: 'border-[#1dc4ff]', light: 'bg-blue-50' },
                    { id: 'om', name: 'Orange Money', color: 'bg-[#ff7900]', border: 'border-[#ff7900]', light: 'bg-orange-50' },
                    { id: 'mtn', name: 'MTN Money', color: 'bg-[#ffcc00]', border: 'border-[#ffcc00]', light: 'bg-yellow-50' },
                    { id: 'card', name: 'Carte Bancaire', color: 'bg-slate-800', border: 'border-slate-800', light: 'bg-slate-50' }
                    ].map((method) => (
                    <div 
                        key={method.id}
                        onClick={() => handlePaymentSelect(method.id as any)}
                        className={`
                        relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all active:scale-98
                        ${formData.paymentMethod === method.id 
                            ? 'border-black shadow-pop-sm bg-white' 
                            : 'border-slate-200 hover:border-black bg-slate-50'}
                        `}
                    >
                        <div className={`w-12 h-12 ${method.color} rounded-lg flex items-center justify-center text-white font-black text-xs mr-4 shrink-0 border-2 border-black shadow-sm`}>
                        {method.id === 'card' ? <CreditCard size={20} /> : method.name.substring(0, 2)}
                        </div>
                        <div className="flex-1">
                        <p className="font-bold text-slate-900">{method.name}</p>
                        <p className="text-xs text-slate-500 font-bold">Sans frais cachés</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center ${formData.paymentMethod === method.id ? 'bg-green-400' : 'bg-white'}`}>
                        {formData.paymentMethod === method.id && <Check size={14} strokeWidth={4} className="text-black" />}
                        </div>
                    </div>
                    ))}
                </div>
              )}

              {/* Total Row */}
              <div className="border-t-2 border-black border-dashed pt-4 flex justify-between items-center bg-yellow-50 p-4 rounded-xl mt-6">
                <span className="text-slate-700 font-bold uppercase text-xs">
                    {paymentMode === 'split' ? "Votre part" : "Total à payer"}
                </span>
                <span className="text-2xl font-black text-slate-900 font-display">
                    {formatPrice(paymentMode === 'split' ? splitAmount : totalPrice)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t-2 border-black bg-white shrink-0 pb-safe">
          {step === 1 ? (
            <button
              type="submit"
              form="info-form"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center group uppercase tracking-widest text-sm"
            >
              Suivant
              <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed disabled:border-slate-400 text-white font-black py-4 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center relative overflow-hidden uppercase tracking-widest text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Traitement...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2" size={20} strokeWidth={2.5} />
                  {paymentMode === 'split' ? `Payer ma part (${formatPrice(splitAmount)})` : `Payer ${formatPrice(totalPrice)}`}
                </>
              )}
            </button>
          )}
          
          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 font-bold flex items-center justify-center uppercase">
              <Lock size={10} className="mr-1" /> Paiement Sécurisé SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
