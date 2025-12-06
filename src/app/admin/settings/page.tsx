'use client';

import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl">
          <Settings size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Parametres Generaux</h1>
          <p className="text-gray-400">Module en cours de developpement - Phase 4</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
        <Settings size={64} className="text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Bientot disponible</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Cette section permettra de configurer le branding, les commissions, 
          les politiques d&apos;annulation et la gestion des roles.
        </p>
      </div>
    </div>
  );
}
