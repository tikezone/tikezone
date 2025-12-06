'use client';

import React from 'react';
import { Search, CreditCard, QrCode, ArrowRight, Sparkles } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Je découvre',
      description: 'Parcours des centaines d\'événements près de chez toi. Concerts, festivals, soirées... il y en a pour tous les goûts !',
      icon: <Search size={32} strokeWidth={2.5} />,
      color: 'from-yellow-200 to-orange-200',
      iconBg: 'from-yellow-400 to-orange-400',
      character: '🔍',
    },
    {
      number: '02',
      title: 'Je réserve et je paie',
      description: 'Sélectionne tes places, paie en toute sécurité par Mobile Money ou carte bancaire. C\'est rapide et simple !',
      icon: <CreditCard size={32} strokeWidth={2.5} />,
      color: 'from-brand-200 to-pink-200',
      iconBg: 'from-brand-400 to-pink-400',
      character: '💳',
    },
    {
      number: '03',
      title: 'Je scanne et je profite',
      description: 'Reçois ton ticket avec QR code par email ou WhatsApp. À l\'entrée, un scan et c\'est parti pour la fête !',
      icon: <QrCode size={32} strokeWidth={2.5} />,
      color: 'from-green-200 to-emerald-200',
      iconBg: 'from-green-400 to-emerald-400',
      character: '🎉',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 border-b-4 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
            <Sparkles size={18} className="text-purple-500" />
            <span className="text-sm font-black uppercase tracking-wide">Simple comme bonjour</span>
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-lg text-slate-600 font-bold max-w-2xl mx-auto">
            En 3 étapes seulement, tu passes de la découverte à la fête. Zéro prise de tête !
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-2 bg-black/10 -translate-y-1/2 rounded-full" />
          <div className="hidden lg:block absolute top-1/2 left-[16%] right-[16%] h-1 border-t-4 border-dashed border-black/30 -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className={`bg-gradient-to-br ${step.color} border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300`}>
                  <div className="absolute -top-5 -left-3 w-14 h-14 bg-white border-4 border-black rounded-2xl flex items-center justify-center font-display font-black text-2xl shadow-[3px_3px_0_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                    {step.number}
                  </div>

                  <div className="text-5xl mb-6 pt-4 animate-bounce" style={{ animationDuration: `${2 + index * 0.3}s` }}>
                    {step.character}
                  </div>

                  <div className={`w-16 h-16 bg-gradient-to-br ${step.iconBg} border-3 border-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-[3px_3px_0_rgba(0,0,0,1)] group-hover:scale-110 transition-transform`}>
                    {step.icon}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-700 font-bold leading-relaxed">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border-3 border-black rounded-full items-center justify-center shadow-[2px_2px_0_rgba(0,0,0,1)]">
                    <ArrowRight size={16} strokeWidth={3} className="text-slate-900" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
