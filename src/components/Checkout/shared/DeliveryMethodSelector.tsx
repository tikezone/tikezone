'use client';

import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';

export type DeliveryMethod = 'email' | 'whatsapp';

interface DeliveryMethodSelectorProps {
  selected: DeliveryMethod;
  onSelect: (method: DeliveryMethod) => void;
}

const DeliveryMethodSelector: React.FC<DeliveryMethodSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-black text-slate-900 uppercase tracking-wide">
        Recevoir mon ticket par
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect('whatsapp')}
          className={`
            flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all shadow-sm active:scale-95
            ${selected === 'whatsapp' 
              ? 'border-black bg-green-100 shadow-pop-sm' 
              : 'border-slate-200 bg-white text-slate-400 hover:border-black'}
          `}
        >
          <MessageCircle 
            size={28} 
            className={`mb-2 ${selected === 'whatsapp' ? 'text-green-600 fill-green-200' : 'text-slate-300'}`} 
            strokeWidth={2.5} 
          />
          <span className={`text-sm font-black ${selected === 'whatsapp' ? 'text-green-800' : 'text-slate-400'}`}>
            WhatsApp
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('email')}
          className={`
            flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all shadow-sm active:scale-95
            ${selected === 'email' 
              ? 'border-black bg-blue-100 shadow-pop-sm' 
              : 'border-slate-200 bg-white text-slate-400 hover:border-black'}
          `}
        >
          <Mail 
            size={28} 
            className={`mb-2 ${selected === 'email' ? 'text-blue-600 fill-blue-200' : 'text-slate-300'}`} 
            strokeWidth={2.5} 
          />
          <span className={`text-sm font-black ${selected === 'email' ? 'text-blue-800' : 'text-slate-400'}`}>
            Email
          </span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;
