'use client';

import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Search, Ticket, QrCode, Smile } from 'lucide-react';
import Link from 'next/link';
import Button from '../../components/UI/Button';

export default function HowItWorksPage() {
  const steps = [
    {
        num: 1,
        title: "Cherchez",
        desc: "Parcourez des centaines d'événements par catégorie, date ou lieu.",
        icon: Search,
        color: "bg-blue-300"
    },
    {
        num: 2,
        title: "Réservez",
        desc: "Choisissez vos places et payez en toute sécurité via Mobile Money.",
        icon: Ticket,
        color: "bg-yellow-300"
    },
    {
        num: 3,
        title: "Recevez",
        desc: "Votre ticket QR code est envoyé instantanément par WhatsApp ou Email.",
        icon: QrCode,
        color: "bg-green-300"
    },
    {
        num: 4,
        title: "Profitez",
        desc: "Présentez votre QR code à l'entrée et amusez-vous !",
        icon: Smile,
        color: "bg-brand-300"
    }
  ];

  return (
    <MainLayout showAnnouncement={false}>
      <div className="bg-white min-h-screen">
        
        {/* Hero */}
        <div className="bg-brand-50 border-b-4 border-black py-20 px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-black font-display text-slate-900 mb-6 uppercase drop-shadow-sm">
                C'est Simple <br/> Comme Bonjour
            </h1>
            <p className="text-xl font-bold text-slate-600 max-w-2xl mx-auto mb-8">
                Tikezone rend l'achat de billets rapide, sûr et amusant. Voici comment ça marche.
            </p>
            <Link href="/explore">
                <Button className="text-lg px-8 py-4">Commencer l'aventure</Button>
            </Link>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto px-4 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
                
                {/* Connecting line for desktop */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-black border-l-2 border-dashed border-black -ml-0.5"></div>

                {steps.map((step, idx) => (
                    <div key={idx} className={`relative flex items-center ${idx % 2 === 0 ? 'md:flex-row-reverse md:text-right' : ''}`}>
                        
                        {/* Content */}
                        <div className={`flex-1 ${idx % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                            <div className="bg-white border-4 border-black p-8 rounded-[2rem] shadow-pop hover:-translate-y-2 transition-transform group">
                                <div className={`w-16 h-16 ${step.color} rounded-2xl border-2 border-black flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform ${idx % 2 === 0 ? 'md:ml-auto' : ''}`}>
                                    <step.icon size={32} className="text-black" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-black font-display text-slate-900 mb-2 uppercase">
                                    {step.num}. {step.title}
                                </h3>
                                <p className="text-slate-600 font-bold leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 text-white py-16 px-4 text-center border-t-4 border-black">
            <h2 className="text-3xl font-black font-display mb-6">VOUS ÊTES ORGANISATEUR ?</h2>
            <Link href="/publish">
                <button className="bg-yellow-400 text-black border-2 border-black px-8 py-3 rounded-xl font-black text-lg shadow-[4px_4px_0px_0px_#fff] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all uppercase">
                    Publier un événement
                </button>
            </Link>
        </div>

      </div>
    </MainLayout>
  );
}