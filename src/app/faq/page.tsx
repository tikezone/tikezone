
'use client';

import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => (
  <details className="group mb-4">
    <summary className="flex justify-between items-center bg-white border-2 border-black p-5 rounded-2xl cursor-pointer list-none shadow-sm hover:shadow-pop-sm transition-all group-open:bg-yellow-50 group-open:shadow-pop">
      <span className="font-black text-slate-900 text-lg">{question}</span>
      <span className="transition-transform group-open:rotate-180 bg-slate-900 text-white rounded-full p-1 border-2 border-black">
        <ChevronDown size={16} strokeWidth={3} />
      </span>
    </summary>
    <div className="bg-white border-2 border-t-0 border-black -mt-2 pt-6 pb-5 px-5 rounded-b-2xl mx-2 relative z-0 animate-in slide-in-from-top-2">
      <p className="text-slate-600 font-medium leading-relaxed">{answer}</p>
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
      <div className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto">
          
          <div className="text-center mb-12">
             <div className="inline-flex items-center justify-center p-4 bg-brand-200 rounded-full border-2 border-black mb-4 shadow-pop-sm">
                <HelpCircle size={32} className="text-brand-700" />
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display mb-4 uppercase">
               Questions Fréquentes
             </h1>
             <p className="text-lg font-bold text-slate-600">
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
