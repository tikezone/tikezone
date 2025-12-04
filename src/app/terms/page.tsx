
'use client';

import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout showAnnouncement={false}>
      <div className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white border-4 border-black p-8 md:p-12 rounded-[2rem] shadow-pop-lg relative">
          
          {/* Header decoration */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-300 border-2 border-black px-6 py-2 rounded-xl shadow-sm rotate-2">
             <span className="font-black text-black uppercase tracking-widest text-sm">Document Officiel</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-display mb-8 text-center uppercase border-b-4 border-black pb-6 border-dashed">
            Conditions Générales de Vente
          </h1>

          <div className="prose prose-slate prose-headings:font-display prose-headings:font-black prose-p:font-medium prose-p:text-slate-600 max-w-none">
            <h3>1. Objet</h3>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme TIKEZONE pour l'achat de billets d'événements. En achetant un billet, vous acceptez ces conditions sans réserve. C'est du sérieux, mais on va faire simple.
            </p>

            <h3>2. Billets et Commandes</h3>
            <p>
              Les billets sont émis sous forme électronique (QR Code). Une fois la commande validée et payée, le billet est envoyé par email ou WhatsApp. Le client est responsable de la saisie correcte de ses coordonnées. On ne peut pas envoyer un billet à une adresse qui n'existe pas !
            </p>

            <h3>3. Prix et Paiement</h3>
            <p>
              Les prix sont indiqués en Francs CFA (XOF). Le paiement est exigible immédiatement à la commande. Nous acceptons les paiements via Mobile Money (Wave, Orange Money, MTN) et Cartes Bancaires. Les transactions sont sécurisées.
            </p>

            <h3>4. Remboursement et Annulation</h3>
            <p>
              Les billets ne sont ni échangeables ni remboursables, sauf en cas d'annulation de l'événement par l'organisateur. Dans ce cas, Tikezone s'engage à rembourser le montant du billet (hors frais de service) sous 14 jours.
            </p>

            <h3>5. Accès à l'événement</h3>
            <p>
              Chaque billet est unique. La première personne à présenter le QR Code valide aura accès à l'événement. Gardez votre billet en sécurité, ne le partagez pas sur les réseaux sociaux avant l'événement !
            </p>

            <h3>6. Responsabilité</h3>
            <p>
              Tikezone agit en tant qu'intermédiaire. La responsabilité du déroulement de l'événement incombe entièrement à l'organisateur. Si l'artiste chante faux, ce n'est pas notre faute (mais on compatit).
            </p>
          </div>

          <div className="mt-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest border-t-2 border-slate-200 pt-6">
             Dernière mise à jour : 25 Octobre 2024
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
