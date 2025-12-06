'use client';

import React from 'react';
import { User, Phone, Mail } from 'lucide-react';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CustomerInfoFormProps {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
  requireEmail?: boolean;
  requirePhone?: boolean;
  variant?: 'light' | 'dark';
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  data,
  onChange,
  requireEmail = false,
  requirePhone = false,
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const labelClass = isDark ? 'text-sm font-bold text-gray-400' : 'text-sm font-bold text-slate-900';
  const inputClass = isDark 
    ? 'w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500/50 outline-none transition-all text-sm font-bold text-white placeholder-gray-600'
    : 'w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white';
  const inputClassNoIcon = isDark 
    ? 'w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-orange-500/50 outline-none transition-all text-sm font-bold text-white placeholder-gray-600'
    : 'w-full px-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white';
  const iconClass = isDark ? 'text-gray-600' : 'text-slate-400';
  const requiredClass = isDark ? 'text-orange-400' : 'text-red-500';
  const optionalClass = isDark ? 'text-gray-600 font-normal text-xs' : 'text-slate-400 font-normal text-xs';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>
            Prenom <span className={requiredClass}>*</span>
          </label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} size={18} strokeWidth={2.5} />
            <input
              required
              name="firstName"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={inputClass}
              placeholder="Jean"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>
            Nom <span className={requiredClass}>*</span>
          </label>
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={inputClassNoIcon}
            placeholder="Kouassi"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>
          Telephone {requirePhone && <span className={requiredClass}>*</span>}
        </label>
        <div className="relative">
          <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} size={18} strokeWidth={2.5} />
          <input
            required={requirePhone}
            type="tel"
            name="phone"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClass}
            placeholder="07 00 00 00 00"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>
          Email {requireEmail ? <span className={requiredClass}>*</span> : <span className={optionalClass}>(Optionnel)</span>}
        </label>
        <div className="relative">
          <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconClass}`} size={18} strokeWidth={2.5} />
          <input
            required={requireEmail}
            type="email"
            name="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClass}
            placeholder="jean@exemple.com"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;
