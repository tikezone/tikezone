'use client';

import { CreditCard } from 'lucide-react';

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
          <CreditCard size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Paiements & Finances</h1>
          <p className="text-gray-400">Module en cours de developpement - Phase 3</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
        <CreditCard size={64} className="text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Bientot disponible</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Cette section permettra de voir l&apos;historique complet des paiements, 
          le solde de chaque organisateur, les payouts et les alertes d&apos;anomalies.
        </p>
      </div>
    </div>
  );
}
