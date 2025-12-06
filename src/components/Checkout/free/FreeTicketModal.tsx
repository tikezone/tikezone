'use client';

import React, { useState } from 'react';
import { Download, Check, Loader2 } from 'lucide-react';
import { ModalWrapper, CustomerInfoForm, DeliveryMethodSelector, CustomerInfo, DeliveryMethod } from '../shared';
import { CheckoutFormData } from '../../../types';

interface FreeTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (bookingData: any, formData: CheckoutFormData) => void;
  eventName: string;
  eventId: string;
  ticketTierId?: string;
  ticketName?: string;
  quantity?: number;
}

const FreeTicketModal: React.FC<FreeTicketModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  eventName, 
  eventId,
  ticketTierId,
  ticketName,
  quantity = 1,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('email');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      alert("Veuillez accepter les conditions generales de vente.");
      return;
    }

    if (deliveryMethod === 'email' && !customerInfo.email) {
      alert("L'email est obligatoire pour la reception par Email.");
      return;
    }
    if (deliveryMethod === 'whatsapp' && !customerInfo.phone) {
      alert("Le telephone est obligatoire pour la reception par WhatsApp.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/tickets/generate-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          deliveryMethod,
          ticketTierId,
          ticketName,
          quantity,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to get free ticket');
      }
      
      const data = await res.json();
      
      const formData: CheckoutFormData = {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        paymentMethod: 'none',
        deliveryMethod,
      };
      
      onSuccess(data, formData);
    } catch (error) {
      console.error('Error getting free ticket:', error);
      alert(`Une erreur est survenue: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <>
      <button
        type="submit"
        form="free-ticket-form"
        disabled={isLoading || !acceptTerms}
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
          <Check size={10} className="mr-1" /> Gratuit et Instantane
        </span>
      </div>
    </>
  );

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Votre Ticket Gratuit"
      headerColor="bg-green-300"
      footer={footer}
    >
      <form id="free-ticket-form" onSubmit={handleSubmit} className="space-y-6">
        <p className="text-slate-700 font-bold">
          Remplissez le formulaire ci-dessous pour recevoir votre ticket gratuit pour{' '}
          <span className="font-black">{eventName}</span>.
        </p>

        {ticketName && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3">
            <p className="text-sm font-bold text-green-800">
              Ticket: <span className="font-black">{ticketName}</span>
              {quantity > 1 && <span className="ml-2">x{quantity}</span>}
            </p>
          </div>
        )}

        <DeliveryMethodSelector
          selected={deliveryMethod}
          onSelect={setDeliveryMethod}
        />

        <CustomerInfoForm
          data={customerInfo}
          onChange={setCustomerInfo}
          requireEmail={deliveryMethod === 'email'}
          requirePhone={deliveryMethod === 'whatsapp'}
        />

        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-2 border-black accent-green-500"
            />
            <span className="text-sm text-slate-700">
              J'accepte les{' '}
              <a href="/cgv" target="_blank" className="font-bold text-green-600 underline hover:text-green-800">
                Conditions Generales de Vente
              </a>{' '}
              et la{' '}
              <a href="/privacy" target="_blank" className="font-bold text-green-600 underline hover:text-green-800">
                Politique de Confidentialite
              </a>
              .
            </span>
          </label>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default FreeTicketModal;
