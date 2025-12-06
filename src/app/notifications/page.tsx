'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { Bell, Ticket, Tag, Info } from 'lucide-react';

type Notif = { id: string; title: string; body: string; type: string; is_read: boolean; created_at: string };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ticket':
        return <Ticket size={20} className="text-green-400" />;
      case 'promo':
        return <Tag size={20} className="text-yellow-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
      default:
        return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'ticket':
        return 'bg-green-500/20 border-green-500/30';
      case 'promo':
        return 'bg-yellow-500/20 border-yellow-500/30';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/30';
      default:
        return 'bg-white/10 border-white/10';
    }
  };

  const loadNotifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notifications?limit=50', { cache: 'no-store' });
      if (!res.ok) throw new Error('Impossible de charger les notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch {
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  return (
    <MainLayout showAnnouncement={false}>
      <div className="min-h-screen bg-black relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-white font-display uppercase">Notifications</h1>
              <p className="text-sm font-bold text-gray-400">{unreadCount} non lues</p>
            </div>
            <div className="flex gap-3">
              <button onClick={loadNotifs} className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Rafraichir</button>
              <button onClick={markAllRead} className="text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors">Tout marquer comme lu</button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/20 text-red-400 p-3 font-bold text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-sm font-bold text-gray-400">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10">
                  <Bell size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-400">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-white/5 backdrop-blur-2xl p-5 rounded-2xl border border-white/10 transition-all hover:-translate-y-1 hover:bg-white/10 flex gap-4 ${
                      !notif.is_read ? 'border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${getBg(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-black text-sm ${!notif.is_read ? 'text-white' : 'text-gray-400'}`}>{notif.title}</h3>
                        <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                          {new Date(notif.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-400 leading-snug">{notif.body}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="self-center">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" title="Non lu"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase">Fin des notifications</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
