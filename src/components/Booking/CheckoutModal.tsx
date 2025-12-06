
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
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div 
        className={`
          relative w-full bg-[#0a0a0a] border-t sm:border border-white/10 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 sm:translate-y-10'}
          h-[92dvh] rounded-t-3xl
          sm:h-auto sm:max-h-[85vh] sm:rounded-3xl sm:max-w-lg
        `}
      >
        
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-xl sticky top-0 z-10 shrink-0">
          <div className="flex items-center space-x-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-xl border border-white/10">
                <ArrowLeft size={18} strokeWidth={2.5} className="text-white" />
              </button>
            )}
            <h2 className="text-xl font-black text-white uppercase tracking-wide">
              {step === 1 ? 'Vos Infos' : 'Paiement'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-500/20 rounded-xl border border-white/10 transition-all"
          >
            <X size={20} strokeWidth={2.5} className="text-gray-400 hover:text-red-400" />
          </button>
        </div>

        <div className="flex w-full h-1.5 shrink-0 bg-white/5">
          <div className={`h-full w-1/2 transition-colors duration-300 ${step >= 1 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-white/10'}`}></div>
          <div className={`h-full w-1/2 transition-colors duration-300 ${step >= 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-white/10'}`}></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0a0a]">
          
          {step === 1 ? (
            <form id="info-form" onSubmit={handleSubmitInfo} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">Recevoir mon ticket par</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleDeliverySelect('whatsapp')}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-2xl border transition-all
                      ${formData.deliveryMethod === 'whatsapp' 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/20'}
                    `}
                  >
                    <MessageCircle size={28} className={`mb-2 ${formData.deliveryMethod === 'whatsapp' ? 'text-green-400' : 'text-gray-500'}`} strokeWidth={2} />
                    <span className={`text-sm font-bold ${formData.deliveryMethod === 'whatsapp' ? 'text-green-400' : 'text-gray-500'}`}>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeliverySelect('email')}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-2xl border transition-all
                      ${formData.deliveryMethod === 'email' 
                        ? 'border-blue-500/50 bg-blue-500/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/20'}
                    `}
                  >
                    <Mail size={28} className={`mb-2 ${formData.deliveryMethod === 'email' ? 'text-blue-400' : 'text-gray-500'}`} strokeWidth={2} />
                    <span className={`text-sm font-bold ${formData.deliveryMethod === 'email' ? 'text-blue-400' : 'text-gray-500'}`}>Email</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Prénom <span className="text-orange-400">*</span></label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                      <input
                        required
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500/50 outline-none transition-all text-sm font-bold text-white placeholder-gray-600"
                        placeholder="Jean"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400">Nom <span className="text-orange-400">*</span></label>
                    <input
                      required
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500/50 outline-none transition-all text-sm font-bold text-white placeholder-gray-600"
                      placeholder="Kouassi"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">
                    Téléphone {formData.deliveryMethod === 'whatsapp' && <span className="text-orange-400">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      required={formData.deliveryMethod === 'whatsapp'}
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500/50 outline-none transition-all text-sm font-bold text-white placeholder-gray-600"
                      placeholder="07 00 00 00 00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400">
                    Email {formData.deliveryMethod === 'email' ? <span className="text-orange-400">*</span> : <span className="text-gray-600 font-normal text-xs">(Optionnel)</span>}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                    <input
                      required={formData.deliveryMethod === 'email'}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500/50 outline-none transition-all text-sm font-bold text-white placeholder-gray-600"
                      placeholder="jean@exemple.com"
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
                
              <div className="bg-white/5 p-1.5 rounded-2xl flex border border-white/10">
                <button 
                    onClick={() => setPaymentMode('direct')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${paymentMode === 'direct' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' : 'text-gray-500 hover:text-white'}`}
                >
                    Paiement Direct
                </button>
                <button 
                    onClick={() => setPaymentMode('split')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${paymentMode === 'split' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' : 'text-gray-500 hover:text-white'}`}
                >
                    <Users size={16} className="mr-1.5" /> Split Pay
                </button>
              </div>

              {paymentMode === 'split' ? (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl text-center">
                        <p className="text-xs font-bold text-orange-400 uppercase mb-1">Total à partager</p>
                        <p className="text-2xl font-black text-white">{formatPrice(totalPrice)}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500 ml-1">Ajouter des amis</label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
                                placeholder="Nom ou Email..."
                                value={newParticipant}
                                onChange={(e) => setNewParticipant(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                            />
                            <button onClick={addParticipant} className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-white flex items-center justify-center text-sm font-black mr-3">V</div>
                                <span className="font-bold text-white">Vous</span>
                            </div>
                            <span className="font-black text-orange-400">{formatPrice(splitAmount)}</span>
                        </div>
                        {participants.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-white/10 rounded-full text-white flex items-center justify-center text-sm font-black mr-3">{p.charAt(0).toUpperCase()}</div>
                                    <span className="font-bold text-white">{p}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-black text-gray-400">{formatPrice(splitAmount)}</span>
                                    <button onClick={() => removeParticipant(idx)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-left-2">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Mode de paiement</p>
                    
                    {[
                    { id: 'wave', name: 'Wave', color: 'from-[#1dc4ff] to-[#0ea5e9]', iconBg: 'bg-[#1dc4ff]' },
                    { id: 'om', name: 'Orange Money', color: 'from-[#ff7900] to-[#ea580c]', iconBg: 'bg-[#ff7900]' },
                    { id: 'mtn', name: 'MTN Money', color: 'from-[#ffcc00] to-[#eab308]', iconBg: 'bg-[#ffcc00]' },
                    { id: 'card', name: 'Carte Bancaire', color: 'from-gray-600 to-gray-700', iconBg: 'bg-gray-700' }
                    ].map((method) => (
                    <div 
                        key={method.id}
                        onClick={() => handlePaymentSelect(method.id as any)}
                        className={`
                        relative flex items-center p-4 rounded-2xl border cursor-pointer transition-all
                        ${formData.paymentMethod === method.id 
                            ? 'border-orange-500/50 bg-orange-500/10' 
                            : 'border-white/10 bg-white/5 hover:border-white/20'}
                        `}
                    >
                        <div className={`w-12 h-12 ${method.iconBg} rounded-xl flex items-center justify-center text-white font-black text-xs mr-4 shrink-0`}>
                        {method.id === 'card' ? <CreditCard size={20} /> : method.name.substring(0, 2)}
                        </div>
                        <div className="flex-1">
                        <p className="font-bold text-white">{method.name}</p>
                        <p className="text-xs text-gray-500 font-medium">Sans frais cachés</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.paymentMethod === method.id ? 'border-orange-500 bg-orange-500' : 'border-white/20 bg-transparent'}`}>
                        {formData.paymentMethod === method.id && <Check size={14} strokeWidth={3} className="text-white" />}
                        </div>
                    </div>
                    ))}
                </div>
              )}

              <div className="border-t border-white/10 border-dashed pt-4 flex justify-between items-center bg-white/5 p-4 rounded-2xl mt-6">
                <span className="text-gray-500 font-bold uppercase text-xs">
                    {paymentMode === 'split' ? "Votre part" : "Total à payer"}
                </span>
                <span className="text-2xl font-black text-white">
                    {formatPrice(paymentMode === 'split' ? splitAmount : totalPrice)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-white/10 bg-[#0a0a0a] shrink-0 pb-safe">
          {step === 1 ? (
            <button
              type="submit"
              form="info-form"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center group uppercase tracking-wide text-sm"
            >
              Suivant
              <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center relative overflow-hidden uppercase tracking-wide text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Traitement...
                </>
              ) : (
                <>
                  <Smartphone className="mr-2" size={20} strokeWidth={2} />
                  {paymentMode === 'split' ? `Payer ma part (${formatPrice(splitAmount)})` : `Payer ${formatPrice(totalPrice)}`}
                </>
              )}
            </button>
          )}
          
          <div className="mt-3 text-center">
            <span className="text-[10px] text-gray-600 font-medium flex items-center justify-center uppercase">
              <Lock size={10} className="mr-1" /> Paiement Sécurisé SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
