
'use client';

import React from 'react';
import { Smartphone, CheckCircle, Apple, PlayCircle } from 'lucide-react';

const DownloadAppSection: React.FC = () => {
  return (
    <section className="bg-slate-50 py-16 lg:py-24 overflow-hidden border-t-2 border-slate-200 relative">
      {/* Background Dots */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 lg:p-0 border-4 border-black shadow-pop-lg relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="lg:pl-16 lg:py-16 text-center lg:text-left">
              <div className="inline-block px-3 py-1 bg-yellow-400 border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider mb-4 shadow-pop-sm transform -rotate-2">
                Disponible maintenant
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-6 leading-tight">
                Emportez <span className="text-brand-500">Tikezone</span> <br/> partout avec vous
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                Téléchargez notre application mobile pour accéder à vos billets hors ligne, recevoir des alertes exclusives et payer en un clic.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center lg:justify-start text-white font-bold">
                  <div className="bg-brand-500 border-2 border-black p-1 rounded-full mr-3 text-white shadow-sm">
                    <CheckCircle size={16} strokeWidth={3} />
                  </div>
                  <span>Billets disponibles hors connexion</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start text-white font-bold">
                  <div className="bg-brand-500 border-2 border-black p-1 rounded-full mr-3 text-white shadow-sm">
                    <CheckCircle size={16} strokeWidth={3} />
                  </div>
                  <span>Notifications de rappel d'événement</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start text-white font-bold">
                  <div className="bg-brand-500 border-2 border-black p-1 rounded-full mr-3 text-white shadow-sm">
                    <CheckCircle size={16} strokeWidth={3} />
                  </div>
                  <span>Offres exclusives mobile</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button className="flex items-center bg-white text-slate-900 px-5 py-3 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all w-full sm:w-auto justify-center group">
                  <Apple className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-black text-slate-500 leading-none">Télécharger sur</div>
                    <div className="text-base font-black leading-none mt-0.5 font-display">App Store</div>
                  </div>
                </button>
                <button className="flex items-center bg-transparent text-white px-5 py-3 rounded-xl border-2 border-white hover:bg-white hover:text-slate-900 hover:border-black shadow-none hover:shadow-pop transition-all w-full sm:w-auto justify-center group">
                  <PlayCircle className="w-8 h-8 mr-3 group-hover:scale-110 transition-transform" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-black opacity-80 leading-none group-hover:text-slate-500 group-hover:opacity-100">DISPONIBLE SUR</div>
                    <div className="text-base font-black leading-none mt-0.5 font-display">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end lg:pr-12 h-64 md:h-80 lg:h-auto">
              {/* Phone Mockup Representation */}
              <div className="relative w-64 md:w-72 aspect-[9/19] bg-slate-900 rounded-[2.5rem] border-4 border-black shadow-pop-lg transform lg:translate-y-12 lg:rotate-6 hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative border-4 border-slate-900">
                  {/* Fake App UI */}
                  <div className="h-full bg-slate-50 flex flex-col">
                    <div className="bg-brand-500 h-32 p-4 pt-10 text-white relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full"></div>
                      <div className="w-8 h-8 bg-white border-2 border-black rounded-full mb-3 shadow-sm"></div>
                      <div className="h-4 w-32 bg-black/10 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-black/10 rounded"></div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="h-24 bg-white rounded-xl border-2 border-black shadow-pop-sm mb-2"></div>
                      <div className="h-24 bg-white rounded-xl border-2 border-slate-200 mb-2"></div>
                      <div className="h-24 bg-white rounded-xl border-2 border-slate-200"></div>
                    </div>
                    <div className="mt-auto bg-white p-3 border-t-2 border-black flex justify-around">
                      <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                      <div className="w-6 h-6 bg-brand-200 rounded-full border-2 border-black"></div>
                      <div className="w-6 h-6 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                  {/* Floating Elements */}
                  <div className="absolute top-1/3 -left-8 bg-white p-3 rounded-xl border-2 border-black shadow-pop flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="bg-green-100 p-1.5 rounded-full border-2 border-black text-green-600">
                      <CheckCircle size={16} strokeWidth={3} />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-black uppercase">Ticket Validé</div>
                      <div className="text-xs font-black text-slate-900">Burna Boy Live</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
