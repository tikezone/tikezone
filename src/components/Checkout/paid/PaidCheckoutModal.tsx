'use client';

import React, { useState, useEffect } from 'react';
import { X, Lock, Smartphone, ChevronRight, Loader2, ArrowLeft, Users } from 'lucide-react';
import { CustomerInfoForm, DeliveryMethodSelector, CustomerInfo, DeliveryMethod } from '../shared';
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector';
import SplitPaySection from './SplitPaySection';
import { CheckoutFormData } from '../../../types';

interface PaidCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CheckoutFormData) => void;
  totalPrice: number;
  ticketSummary: string;
  eventName?: string;
}

const PaidCheckoutModal: React.FC<PaidCheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  totalPrice, 
  ticketSummary,
  eventName 
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [paymentMode, setPaymentMode] = useState<'direct' | 'split'>('direct');
  const [participants, setParticipants] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('whatsapp');

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setStep(1);
      setPaymentMode('direct');
      setParticipants([]);
      setAcceptTerms(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
      .format(price)
      .replace('XOF', 'F');

  const splitAmount = totalPrice / (participants.length + 1);

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.firstName || !customerInfo.lastName) return;
    if (deliveryMethod === 'email' && !customerInfo.email) {
      alert("L'email est obligatoire pour la reception par Email.");
      return;
    }
    if (deliveryMethod === 'whatsapp' && !customerInfo.phone) {
      alert("Le telephone est obligatoire pour la reception par WhatsApp.");
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = () => {
    if (!acceptTerms) {
      alert("Veuillez accepter les conditions generales de vente.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const formData: CheckoutFormData = {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        paymentMethod,
        deliveryMethod,
      };
      onSuccess(formData);
    }, 2000);
  };

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
            <form id="paid-info-form" onSubmit={handleSubmitInfo} className="space-y-6">
              {eventName && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 mb-4">
                  <p className="text-sm font-bold text-orange-400">
                    {ticketSummary}
                  </p>
                </div>
              )}

              <DeliveryMethodSelector
                selected={deliveryMethod}
                onSelect={setDeliveryMethod}
                variant="dark"
              />

              <CustomerInfoForm
                data={customerInfo}
                onChange={setCustomerInfo}
                requireEmail={deliveryMethod === 'email'}
                requirePhone={deliveryMethod === 'whatsapp'}
                variant="dark"
              />
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
                <SplitPaySection
                  totalPrice={totalPrice}
                  participants={participants}
                  onParticipantsChange={setParticipants}
                  formatPrice={formatPrice}
                />
              ) : (
                <PaymentMethodSelector
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              )}

              <div className="border-t border-white/10 border-dashed pt-4 flex justify-between items-center bg-white/5 p-4 rounded-2xl mt-6">
                <span className="text-gray-500 font-bold uppercase text-xs">
                  {paymentMode === 'split' ? "Votre part" : "Total a payer"}
                </span>
                <span className="text-2xl font-black text-white">
                  {formatPrice(paymentMode === 'split' ? splitAmount : totalPrice)}
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-white/30 accent-orange-500"
                  />
                  <span className="text-sm text-gray-400">
                    J'accepte les{' '}
                    <a href="/cgv" target="_blank" className="font-bold text-orange-400 underline hover:text-orange-300">
                      Conditions Generales de Vente
                    </a>{' '}
                    et la{' '}
                    <a href="/privacy" target="_blank" className="font-bold text-orange-400 underline hover:text-orange-300">
                      Politique de Confidentialite
                    </a>
                    .
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 border-t border-white/10 bg-[#0a0a0a] shrink-0 pb-safe">
          {step === 1 ? (
            <button
              type="submit"
              form="paid-info-form"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center group uppercase tracking-wide text-sm"
            >
              Suivant
              <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isLoading || !acceptTerms}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 disabled:from-gray-600 disabled:to-gray-700 disabled:shadow-none disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center relative overflow-hidden uppercase tracking-wide text-sm"
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
              <Lock size={10} className="mr-1" /> Paiement Securise SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaidCheckoutModal;
