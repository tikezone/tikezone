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
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({
  data,
  onChange,
  requireEmail = false,
  requirePhone = false,
}) => {
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-900">
            Prenom <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
            <input
              required
              name="firstName"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
              placeholder="Jean"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-900">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
            placeholder="Kouassi"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-900">
          Telephone {requirePhone && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
          <input
            required={requirePhone}
            type="tel"
            name="phone"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
            placeholder="07 00 00 00 00"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-900">
          Email {requireEmail ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal text-xs">(Optionnel)</span>}
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
          <input
            required={requireEmail}
            type="email"
            name="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black focus:shadow-pop-sm outline-none transition-all text-sm font-bold bg-slate-50 focus:bg-white"
            placeholder="jean@exemple.com"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;
