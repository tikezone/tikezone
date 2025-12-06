'use client';

import React from 'react';
import { Ticket, QrCode, Calendar, Heart, Bell, Smartphone, Wifi, WifiOff } from 'lucide-react';

const MobileExperience: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-brand-50 via-pink-50 to-orange-50 border-b-4 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-black rounded-full shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6">
              <Smartphone size={18} className="text-brand-500" />
              <span className="text-sm font-black uppercase tracking-wide">Expérience mobile</span>
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 mb-6">
              Garde tous tes tickets dans{' '}
              <span className="relative inline-block">
                <span className="relative z-10">ta poche</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-brand-300 -skew-x-3 -z-10" />
              </span>
            </h2>

            <p className="text-lg text-slate-700 font-bold mb-8 leading-relaxed">
              Accède à tes tickets n'importe où, même hors connexion. Plus besoin d'imprimer quoi que ce soit !
            </p>

            <div className="space-y-4">
              {[
                { icon: <Ticket size={20} />, text: 'Tous tes tickets au même endroit', color: 'bg-brand-100' },
                { icon: <QrCode size={20} />, text: 'QR code disponible hors ligne', color: 'bg-purple-100' },
                { icon: <Bell size={20} />, text: 'Rappels avant l\'événement', color: 'bg-yellow-100' },
                { icon: <Heart size={20} />, text: 'Sauvegarde tes favoris', color: 'bg-pink-100' },
              ].map((item, index) => (
                <div key={index} className={`flex items-center gap-4 px-5 py-4 ${item.color} border-3 border-black rounded-xl shadow-[3px_3px_0_rgba(0,0,0,1)]`}>
                  <div className="w-10 h-10 bg-white border-2 border-black rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-bold text-slate-900">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative bg-white border-4 border-black rounded-[2.5rem] p-4 shadow-[8px_8px_0_rgba(0,0,0,1)] w-72 sm:w-80 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="w-20 h-1.5 bg-black rounded-full mx-auto mb-4" />
              
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-brand-100 to-pink-100 border-3 border-black rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase text-brand-600">Mes Tickets</span>
                    <span className="text-xs font-bold text-slate-500">3 actifs</span>
                  </div>
                  <div className="space-y-2">
                    {['Concert Fally', 'Festival Abi', 'Soirée VIP'].map((name, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white border-2 border-black rounded-xl p-2">
                        <div className={`w-10 h-10 rounded-lg border-2 border-black flex items-center justify-center text-lg ${['bg-yellow-200', 'bg-green-200', 'bg-purple-200'][i]}`}>
                          {['🎤', '🎪', '🎉'][i]}
                        </div>
                        <div className="flex-grow">
                          <div className="text-xs font-black text-slate-900">{name}</div>
                          <div className="text-[10px] font-bold text-slate-500">x1 place</div>
                        </div>
                        <QrCode size={16} className="text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-3 border-black rounded-2xl p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs font-black uppercase text-brand-400">Ton ticket</div>
                      <div className="text-sm font-black">Concert Fally</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-green-400">
                      <WifiOff size={12} />
                      Hors ligne OK
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 flex items-center justify-center">
                    <div className="w-20 h-20 bg-slate-100 border-2 border-black rounded-lg flex items-center justify-center">
                      <QrCode size={48} className="text-slate-900" />
                    </div>
                  </div>
                  <div className="mt-3 text-center text-xs font-bold text-slate-400">
                    #TZ-2024-FALLY-001
                  </div>
                </div>

                <div className="flex gap-2">
                  {[
                    { icon: <Calendar size={18} />, label: 'Agenda', active: false },
                    { icon: <Ticket size={18} />, label: 'Tickets', active: true },
                    { icon: <Heart size={18} />, label: 'Favoris', active: false },
                  ].map((tab, i) => (
                    <div key={i} className={`flex-1 flex flex-col items-center py-2 rounded-xl border-2 ${tab.active ? 'bg-brand-500 text-white border-black' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                      {tab.icon}
                      <span className="text-[10px] font-black mt-1">{tab.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -top-4 -left-4 lg:-left-8 bg-gradient-to-br from-yellow-200 to-orange-200 border-4 border-black rounded-2xl p-3 shadow-[4px_4px_0_rgba(0,0,0,1)] transform -rotate-12">
              <div className="flex items-center gap-2">
                <Wifi size={20} className="text-green-600" />
                <span className="text-xs font-black">Hors ligne</span>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 lg:-right-8 bg-gradient-to-br from-green-200 to-emerald-200 border-4 border-black rounded-2xl p-3 shadow-[4px_4px_0_rgba(0,0,0,1)] transform rotate-12">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-brand-600" />
                <span className="text-xs font-black">Rappels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileExperience;
