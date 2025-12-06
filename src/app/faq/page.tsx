
'use client';

import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => (
  <details className="group mb-4">
    <summary className="flex justify-between items-center bg-white/10 backdrop-blur-2xl border border-white/20 p-5 rounded-2xl cursor-pointer list-none transition-all hover:bg-white/15 group-open:bg-orange-500/20 group-open:border-orange-500/30">
      <span className="font-black text-white text-lg">{question}</span>
      <span className="transition-transform group-open:rotate-180 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full p-1">
        <ChevronDown size={16} strokeWidth={3} />
      </span>
    </summary>
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 border-t-0 -mt-2 pt-6 pb-5 px-5 rounded-b-2xl mx-2 relative z-0">
      <p className="text-gray-300 font-medium leading-relaxed">{answer}</p>
    </div>
  </details>
);

export default function FaqPage() {
  const faqs = [
    {
        question: "Comment recevoir mon billet ?",
        answer: "Une fois le paiement validé, vous recevez votre billet instantanément par WhatsApp (si vous avez choisi cette option) et par Email. Vous pouvez aussi le retrouver dans la section 'Mes Tickets' de votre compte."
    },
    {
        question: "Puis-je me faire rembourser ?",
        answer: "Les billets ne sont généralement pas remboursables, sauf si l'événement est annulé par l'organisateur. Dans ce cas, le remboursement est automatique."
    },
    {
        question: "Est-ce sécurisé ?",
        answer: "À 100%. Nous utilisons les passerelles de paiement officielles des opérateurs (Wave, Orange, MTN) et les standards de sécurité bancaire pour les cartes."
    },
    {
        question: "Je n'ai pas reçu mon billet, que faire ?",
        answer: "Pas de panique ! Vérifiez vos spams. Si toujours rien, contactez-nous via WhatsApp ou Email avec votre numéro de téléphone utilisé lors de l'achat, nous vous le renverrons."
    },
    {
        question: "Puis-je revendre mon billet ?",
        answer: "Cela dépend de l'organisateur. Certains événements exigent une pièce d'identité correspondant au nom sur le billet. Vérifiez les détails de l'événement."
    },
    {
        question: "Comment organiser un événement ?",
        answer: "Cliquez sur 'Publier un événement' dans le menu, créez un compte Organisateur et suivez le guide. C'est gratuit pour les événements gratuits !"
    }
  ];

  return (
    <MainLayout showAnnouncement={false}>
      <div className="min-h-screen bg-black relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto">
          
          <div className="text-center mb-12">
             <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg shadow-orange-500/30">
                <HelpCircle size={32} className="text-white" />
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white font-display mb-4 uppercase">
               Questions Fréquentes
             </h1>
             <p className="text-lg font-bold text-gray-400">
               Tout ce que vous devez savoir pour profiter de Tikezone.
             </p>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
                <FaqItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
