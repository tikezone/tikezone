'use client';

import React from 'react';
import { Link } from '../../lib/safe-navigation';
import { Upload, Wallet, Smartphone, ArrowRight, TrendingUp, Users, Ticket, CheckCircle } from 'lucide-react';

const ForOrganizers: React.FC = () => {
  const features = [
    {
      title: 'Publie ton événement',
      description: 'Crée ta page en quelques minutes. Ajoute tes visuels, tes tarifs et c\'est parti !',
      icon: <Upload size={28} strokeWidth={2.5} />,
      color: 'from-blue-200 to-cyan-200',
      iconBg: 'from-blue-500 to-cyan-500',
      character: '📝',
    },
    {
      title: 'Encaisse en ligne',
      description: 'Reçois les paiements directement sur ton compte. Mobile Money ou carte, c\'est toi qui décides.',
      icon: <Wallet size={28} strokeWidth={2.5} />,
      color: 'from-green-200 to-emerald-200',
      iconBg: 'from-green-500 to-emerald-500',
      character: '💰',
    },
    {
      title: 'Scanne les tickets',
      description: 'Notre app te permet de valider les entrées en un flash. Fini les files d\'attente !',
      icon: <Smartphone size={28} strokeWidth={2.5} />,
      color: 'from-purple-200 to-pink-200',
      iconBg: 'from-purple-500 to-pink-500',
      character: '📱',
    },
  ];

  const stats = [
    { value: '+50K', label: 'Tickets vendus', icon: <Ticket size={20} /> },
    { value: '98%', label: 'Taux de scan', icon: <CheckCircle size={20} /> },
    { value: '+200', label: 'Organisateurs', icon: <Users size={20} /> },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b-4 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-orange-500 text-white border-3 border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6">
              <TrendingUp size={18} />
              <span className="text-sm font-black uppercase tracking-wide">Pour les organisateurs</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white mb-6">
              Organise, vends et scanne avec{' '}
              <span className="bg-gradient-to-r from-brand-400 to-orange-400 bg-clip-text text-transparent">Tikezone</span>
            </h2>

            <p className="text-lg text-slate-300 font-bold mb-8 leading-relaxed">
              Tout ce qu'il te faut pour gérer ton événement comme un pro. De la création à l'entrée, on s'occupe de tout !
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl backdrop-blur-sm">
                  <div className="text-brand-400">{stat.icon}</div>
                  <div>
                    <div className="text-xl font-black text-white">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/publish"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand-500 to-orange-500 text-white border-4 border-black rounded-2xl text-lg font-black uppercase tracking-wide shadow-[6px_6px_0_rgba(0,0,0,1)] hover:shadow-[8px_8px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
            >
              Ouvrir mon compte gratuitement
              <ArrowRight size={22} strokeWidth={3} />
            </Link>
          </div>

          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.color} border-4 border-black rounded-2xl p-5 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300 flex items-start gap-5`}
                style={{ transform: `rotate(${index % 2 === 0 ? 1 : -1}deg)` }}
              >
                <div className="text-4xl flex-shrink-0">{feature.character}</div>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 bg-gradient-to-br ${feature.iconBg} border-2 border-black rounded-xl flex items-center justify-center text-white shadow-[2px_2px_0_rgba(0,0,0,1)]`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{feature.title}</h3>
                  </div>
                  <p className="text-slate-700 font-bold">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForOrganizers;
