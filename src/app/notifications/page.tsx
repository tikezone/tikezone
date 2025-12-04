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
        return <Ticket size={20} className="text-green-600" />;
      case 'promo':
        return <Tag size={20} className="text-yellow-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-slate-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'ticket':
        return 'bg-green-100 border-green-300';
      case 'promo':
        return 'bg-yellow-100 border-yellow-300';
      case 'info':
        return 'bg-blue-100 border-blue-300';
      default:
        return 'bg-slate-100 border-slate-300';
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
      // ignore
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  return (
    <MainLayout showAnnouncement={false}>
      <div className="bg-slate-50 min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 font-display uppercase">Notifications</h1>
              <p className="text-sm font-bold text-slate-500">{unreadCount} non lues</p>
            </div>
            <div className="flex gap-3">
              <button onClick={loadNotifs} className="text-sm font-bold text-slate-600 hover:underline">Rafraichir</button>
              <button onClick={markAllRead} className="text-sm font-bold text-brand-600 hover:underline">Tout marquer comme lu</button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border-2 border-red-400 bg-red-50 text-red-700 p-3 font-bold text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center text-sm font-bold text-slate-500">Chargement...</div>
          ) : (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center text-sm font-bold text-slate-500">Aucune notification</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-white p-5 rounded-2xl border-2 border-black shadow-sm transition-all hover:-translate-y-1 hover:shadow-pop-sm flex gap-4 ${
                      !notif.is_read ? 'border-l-[6px] border-l-brand-500' : ''
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center shrink-0 ${getBg(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-black text-sm ${!notif.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {new Date(notif.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-snug">{notif.body}</p>
                    </div>
                    {!notif.is_read && (
                      <div className="self-center">
                        <div className="w-3 h-3 bg-brand-500 rounded-full border border-black" title="Non lu"></div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase">Fin des notifications</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
