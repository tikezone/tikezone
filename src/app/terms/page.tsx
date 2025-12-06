
'use client';

import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout showAnnouncement={false}>
      <div className="min-h-screen bg-black relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-12 rounded-3xl">
          
          <div className="text-center mb-8">
             <span className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase shadow-lg shadow-orange-500/30 mb-4">
                Document Officiel
             </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white font-display mb-8 text-center uppercase border-b border-white/10 pb-6">
            Conditions Générales de Vente
          </h1>

          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-lg font-black text-white mb-2">1. Objet</h3>
              <p className="font-medium leading-relaxed">
                Les présentes Conditions Générales de Vente (CGV) régissent l'utilisation de la plateforme TIKEZONE pour l'achat de billets d'événements. En achetant un billet, vous acceptez ces conditions sans réserve. C'est du sérieux, mais on va faire simple.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-black text-white mb-2">2. Billets et Commandes</h3>
              <p className="font-medium leading-relaxed">
                Les billets sont émis sous forme électronique (QR Code). Une fois la commande validée et payée, le billet est envoyé par email ou WhatsApp. Le client est responsable de la saisie correcte de ses coordonnées. On ne peut pas envoyer un billet à une adresse qui n'existe pas !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-black text-white mb-2">3. Prix et Paiement</h3>
              <p className="font-medium leading-relaxed">
                Les prix sont indiqués en Francs CFA (XOF). Le paiement est exigible immédiatement à la commande. Nous acceptons les paiements via Mobile Money (Wave, Orange Money, MTN) et Cartes Bancaires. Les transactions sont sécurisées.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-black text-white mb-2">4. Remboursement et Annulation</h3>
              <p className="font-medium leading-relaxed">
                Les billets ne sont ni échangeables ni remboursables, sauf en cas d'annulation de l'événement par l'organisateur. Dans ce cas, Tikezone s'engage à rembourser le montant du billet (hors frais de service) sous 14 jours.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-black text-white mb-2">5. Accès à l'événement</h3>
              <p className="font-medium leading-relaxed">
                Chaque billet est unique. La première personne à présenter le QR Code valide aura accès à l'événement. Gardez votre billet en sécurité, ne le partagez pas sur les réseaux sociaux avant l'événement !
              </p>
            </div>

            <div>
              <h3 className="text-lg font-black text-white mb-2">6. Responsabilité</h3>
              <p className="font-medium leading-relaxed">
                Tikezone agit en tant qu'intermédiaire. La responsabilité du déroulement de l'événement incombe entièrement à l'organisateur. Si l'artiste chante faux, ce n'est pas notre faute (mais on compatit).
              </p>
            </div>
          </div>

          <div className="mt-12 text-center text-xs font-bold text-gray-500 uppercase tracking-widest border-t border-white/10 pt-6">
             Dernière mise à jour : 25 Octobre 2024
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
