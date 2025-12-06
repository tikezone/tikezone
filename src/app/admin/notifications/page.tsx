'use client';

import { Bell } from 'lucide-react';

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl">
          <Bell size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Communication & Notifications</h1>
          <p className="text-gray-400">Module en cours de developpement - Phase 4</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
        <Bell size={64} className="text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Bientot disponible</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Cette section permettra d&apos;envoyer des notifications globales ou ciblees, 
          gerer les emails automatiques et les messages WhatsApp/SMS.
        </p>
      </div>
    </div>
  );
}
