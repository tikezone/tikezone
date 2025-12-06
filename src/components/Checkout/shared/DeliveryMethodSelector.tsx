'use client';

import React from 'react';
import { Mail, MessageCircle } from 'lucide-react';

export type DeliveryMethod = 'email' | 'whatsapp';

interface DeliveryMethodSelectorProps {
  selected: DeliveryMethod;
  onSelect: (method: DeliveryMethod) => void;
  variant?: 'light' | 'dark';
}

const DeliveryMethodSelector: React.FC<DeliveryMethodSelectorProps> = ({ selected, onSelect, variant = 'light' }) => {
  const isDark = variant === 'dark';

  return (
    <div className="space-y-3">
      <label className={`text-sm font-black uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-slate-900'}`}>
        Recevoir mon ticket par
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onSelect('whatsapp')}
          className={`
            flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95
            ${isDark 
              ? selected === 'whatsapp'
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
              : selected === 'whatsapp' 
                ? 'border-black bg-green-100 shadow-pop-sm' 
                : 'border-slate-200 bg-white text-slate-400 hover:border-black shadow-sm'
            }
          `}
        >
          <MessageCircle 
            size={28} 
            className={`mb-2 ${
              isDark
                ? selected === 'whatsapp' ? 'text-green-400' : 'text-gray-500'
                : selected === 'whatsapp' ? 'text-green-600 fill-green-200' : 'text-slate-300'
            }`} 
            strokeWidth={2.5} 
          />
          <span className={`text-sm font-black ${
            isDark
              ? selected === 'whatsapp' ? 'text-green-400' : 'text-gray-500'
              : selected === 'whatsapp' ? 'text-green-800' : 'text-slate-400'
          }`}>
            WhatsApp
          </span>
        </button>
        <button
          type="button"
          onClick={() => onSelect('email')}
          className={`
            flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all active:scale-95
            ${isDark 
              ? selected === 'email'
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
              : selected === 'email' 
                ? 'border-black bg-blue-100 shadow-pop-sm' 
                : 'border-slate-200 bg-white text-slate-400 hover:border-black shadow-sm'
            }
          `}
        >
          <Mail 
            size={28} 
            className={`mb-2 ${
              isDark
                ? selected === 'email' ? 'text-blue-400' : 'text-gray-500'
                : selected === 'email' ? 'text-blue-600 fill-blue-200' : 'text-slate-300'
            }`} 
            strokeWidth={2.5} 
          />
          <span className={`text-sm font-black ${
            isDark
              ? selected === 'email' ? 'text-blue-400' : 'text-gray-500'
              : selected === 'email' ? 'text-blue-800' : 'text-slate-400'
          }`}>
            Email
          </span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryMethodSelector;
