'use client';

import React from 'react';
import { QrCode, Shield, MessageCircle, Lock, CheckCircle } from 'lucide-react';

const TrustSecurity: React.FC = () => {
  const trustPoints = [
    {
      title: 'Tickets QR code unique',
      description: 'Chaque ticket est sécurisé avec un QR code unique et infalsifiable.',
      icon: <QrCode size={28} strokeWidth={2.5} />,
      color: 'from-purple-200 to-indigo-200',
      iconBg: 'from-purple-500 to-indigo-500',
      emoji: '🎫',
    },
    {
      title: 'Paiements sécurisés',
      description: 'Mobile Money et cartes bancaires. Toutes tes transactions sont cryptées.',
      icon: <Shield size={28} strokeWidth={2.5} />,
      color: 'from-green-200 to-emerald-200',
      iconBg: 'from-green-500 to-emerald-500',
      emoji: '🔒',
    },
    {
      title: 'Support réactif',
      description: 'Notre équipe est là pour toi sur WhatsApp, email, et téléphone. 24/7.',
      icon: <MessageCircle size={28} strokeWidth={2.5} />,
      color: 'from-brand-200 to-pink-200',
      iconBg: 'from-brand-500 to-pink-500',
      emoji: '💬',
    },
    {
      title: 'Données protégées',
      description: 'Tes informations personnelles sont stockées de façon sécurisée et privée.',
      icon: <Lock size={28} strokeWidth={2.5} />,
      color: 'from-blue-200 to-cyan-200',
      iconBg: 'from-blue-500 to-cyan-500',
      emoji: '🛡️',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 border-b-4 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
            <CheckCircle size={18} className="text-green-500" />
            <span className="text-sm font-black uppercase tracking-wide">100% Fiable</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 mb-4">
            Une expérience fiable et sécurisée
          </h2>
          <p className="text-lg text-slate-600 font-bold max-w-2xl mx-auto">
            Ta tranquillité d'esprit est notre priorité. On prend soin de toi du début à la fin !
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((point, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${point.color} border-4 border-black rounded-3xl p-6 shadow-[5px_5px_0_rgba(0,0,0,1)] hover:shadow-[7px_7px_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300 group`}
            >
              <div className="text-4xl mb-4 group-hover:scale-125 transition-transform">{point.emoji}</div>
              
              <div className={`w-14 h-14 bg-gradient-to-br ${point.iconBg} border-3 border-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-[3px_3px_0_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform`}>
                {point.icon}
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2">{point.title}</h3>
              <p className="text-sm text-slate-700 font-bold leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-6">
          <div className="flex items-center gap-2 px-5 py-3 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)]">
            <span className="text-2xl">🇨🇮</span>
            <span className="font-black text-slate-900">Made in Côte d'Ivoire</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)]">
            <span className="text-2xl">⚡</span>
            <span className="font-black text-slate-900">Paiement instantané</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)]">
            <span className="text-2xl">✅</span>
            <span className="font-black text-slate-900">Tickets garantis</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSecurity;
