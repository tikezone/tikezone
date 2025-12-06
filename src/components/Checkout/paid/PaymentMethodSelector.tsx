'use client';

import React from 'react';
import { CreditCard, Check } from 'lucide-react';

export type PaymentMethod = 'wave' | 'om' | 'mtn' | 'card';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods = [
  { id: 'wave' as const, name: 'Wave', color: 'from-[#1dc4ff] to-[#0ea5e9]', iconBg: 'bg-[#1dc4ff]' },
  { id: 'om' as const, name: 'Orange Money', color: 'from-[#ff7900] to-[#ea580c]', iconBg: 'bg-[#ff7900]' },
  { id: 'mtn' as const, name: 'MTN Money', color: 'from-[#ffcc00] to-[#eab308]', iconBg: 'bg-[#ffcc00]' },
  { id: 'card' as const, name: 'Carte Bancaire', color: 'from-gray-600 to-gray-700', iconBg: 'bg-gray-700' }
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-3 animate-in slide-in-from-left-2">
      <p className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Mode de paiement</p>
      
      {paymentMethods.map((method) => (
        <div 
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={`
            relative flex items-center p-4 rounded-2xl border cursor-pointer transition-all
            ${selected === method.id 
              ? 'border-orange-500/50 bg-orange-500/10' 
              : 'border-white/10 bg-white/5 hover:border-white/20'}
          `}
        >
          <div className={`w-12 h-12 ${method.iconBg} rounded-xl flex items-center justify-center text-white font-black text-xs mr-4 shrink-0`}>
            {method.id === 'card' ? <CreditCard size={20} /> : method.name.substring(0, 2)}
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">{method.name}</p>
            <p className="text-xs text-gray-500 font-medium">Sans frais caches</p>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected === method.id ? 'border-orange-500 bg-orange-500' : 'border-white/20 bg-transparent'}`}>
            {selected === method.id && <Check size={14} strokeWidth={3} className="text-white" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;
