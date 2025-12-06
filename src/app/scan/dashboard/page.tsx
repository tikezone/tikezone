'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LogOut, Calendar, MapPin, ChevronRight, QrCode, Wifi, RefreshCcw } from 'lucide-react';
import { useRouter } from '../../../lib/safe-navigation';

type Agent = {
  id: string;
  name: string;
  isOnline: boolean;
  organizerEmail: string;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl?: string;
  totalBookings: number;
  checkedIn: number;
};

export default function ScanDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scan/events', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push('/scan/login');
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'Chargement impossible');
      }
      setAgent(data.agent);
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/scan/logout', { method: 'POST' });
    router.push('/scan/login');
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetch('/api/scan/ping', { method: 'POST' }).catch(() => {});
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const initials = useMemo(() => {
    if (!agent?.name) return 'AG';
    return agent.name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [agent]);

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
      
      <header className="relative z-10 bg-white/10 backdrop-blur-2xl border-b border-white/10 p-4 flex justify-between items-center sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/30">
            {initials}
          </div>
          <div>
            <p className="font-bold text-sm text-white">{agent?.name || 'Agent Scan'}</p>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${agent?.isOnline ? 'bg-green-400' : 'bg-gray-500'}`} />
              {agent?.isOnline ? 'Agent online' : 'Agent hors ligne'}
            </p>
          </div>
        </div>
        <button onClick={logout} className="p-2.5 bg-white/10 border border-white/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all" title="Se deconnecter">
          <LogOut size={20} />
        </button>
      </header>

      <main className="relative z-10 flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase text-white px-1">Evenements assignes</h2>
          <button
            onClick={loadData}
            className="flex items-center gap-2 text-xs font-black text-white bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl hover:bg-white/20 transition-all"
          >
            <RefreshCcw size={14} /> Rafraichir
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm rounded-2xl p-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 font-bold py-10">Chargement...</div>
        ) : events.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 text-center text-gray-400 font-bold">
            Aucun evenement assigne.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => (
              <Link href={`/scan/${evt.id}`} key={evt.id} className="block group">
                <div className="bg-white/10 backdrop-blur-2xl p-5 rounded-3xl border border-white/20 group-active:scale-95 transition-transform flex items-center justify-between gap-4 hover:bg-white/15">
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-white leading-tight mb-2 line-clamp-2">{evt.title}</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />{' '}
                        {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center">
                        <MapPin size={12} className="mr-1" /> {evt.location}
                      </span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl text-[11px] font-black text-orange-400 border border-white/10">
                      <Wifi size={12} /> {evt.checkedIn} / {evt.totalBookings} entres
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                      <QrCode size={24} />
                    </div>
                    <ChevronRight className="text-gray-500 group-hover:text-orange-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
