'use client';

import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Search, Ticket, QrCode, Smile } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
        num: 1,
        title: "Cherchez",
        desc: "Parcourez des centaines d'événements par catégorie, date ou lieu.",
        icon: Search,
        color: "from-blue-500 to-blue-600"
    },
    {
        num: 2,
        title: "Réservez",
        desc: "Choisissez vos places et payez en toute sécurité via Mobile Money.",
        icon: Ticket,
        color: "from-yellow-500 to-yellow-600"
    },
    {
        num: 3,
        title: "Recevez",
        desc: "Votre ticket QR code est envoyé instantanément par WhatsApp ou Email.",
        icon: QrCode,
        color: "from-green-500 to-green-600"
    },
    {
        num: 4,
        title: "Profitez",
        desc: "Présentez votre QR code à l'entrée et amusez-vous !",
        icon: Smile,
        color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <MainLayout showAnnouncement={false}>
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 py-20 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black font-display text-white mb-6 uppercase">
                C'est Simple <br/> Comme Bonjour
            </h1>
            <p className="text-xl font-bold text-gray-400 max-w-2xl mx-auto mb-8">
                Tikezone rend l'achat de billets rapide, sûr et amusant. Voici comment ça marche.
            </p>
            <Link href="/explore">
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                    Commencer l'aventure
                </button>
            </Link>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/50 via-white/20 to-orange-500/50"></div>

                {steps.map((step, idx) => (
                    <div key={idx} className={`relative flex items-center ${idx % 2 === 0 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        
                        <div className={`flex-1 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl hover:-translate-y-2 transition-transform group">
                                <div className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform ${idx % 2 === 0 ? 'md:ml-auto' : ''}`}>
                                    <step.icon size={32} className="text-white" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black font-display text-white mb-2 uppercase">
                                    {step.num}. {step.title}
                                </h3>
                                <p className="text-gray-400 font-bold leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>

        <div className="relative z-10 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl py-16 px-4 text-center border-t border-white/10">
            <h2 className="text-3xl font-black font-display text-white mb-6">VOUS ÊTES ORGANISATEUR ?</h2>
            <Link href="/publish">
                <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all uppercase">
                    Publier un événement
                </button>
            </Link>
        </div>

      </div>
    </MainLayout>
  );
}