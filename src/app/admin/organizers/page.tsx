'use client';

import { Users } from 'lucide-react';

export default function AdminOrganizersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
          <Users size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Supervision des Organisateurs</h1>
          <p className="text-gray-400">Module en cours de developpement - Phase 2</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
        <Users size={64} className="text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Bientot disponible</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Cette section permettra de superviser tous les organisateurs, leur volume de ventes, 
          taux de scan, historique de paiements et de suspendre des comptes si necessaire.
        </p>
      </div>
    </div>
  );
}
