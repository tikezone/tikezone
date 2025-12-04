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
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-slate-900 text-white p-4 border-b-4 border-brand-500 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center font-black text-black">
            {initials}
          </div>
          <div>
            <p className="font-bold text-sm">{agent?.name || 'Agent Scan'}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${agent?.isOnline ? 'bg-green-400' : 'bg-slate-500'}`} />
              {agent?.isOnline ? 'Agent online' : 'Agent hors ligne'}
            </p>
          </div>
        </div>
        <button onClick={logout} className="p-2 bg-slate-800 rounded-lg text-red-400" title="Se deconnecter">
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase px-1">Evenements assignes</h2>
          <button
            onClick={loadData}
            className="flex items-center gap-2 text-xs font-black text-slate-600 bg-white border-2 border-slate-200 px-3 py-2 rounded-xl hover:border-black transition-all"
          >
            <RefreshCcw size={14} /> Rafraichir
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 font-bold text-sm rounded-xl p-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-400 font-bold py-10">Chargement...</div>
        ) : events.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-500 font-bold">
            Aucun evenement assigne.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => (
              <Link href={`/scan/${evt.id}`} key={evt.id} className="block group">
                <div className="bg-white p-5 rounded-2xl border-2 border-black shadow-pop group-active:scale-95 transition-transform flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-black text-lg leading-tight mb-2 line-clamp-2">{evt.title}</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />{' '}
                        {new Date(evt.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="flex items-center">
                        <MapPin size={12} className="mr-1" /> {evt.location}
                      </span>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-xl text-[11px] font-black text-slate-700 border border-slate-200">
                      <Wifi size={12} /> {evt.checkedIn} / {evt.totalBookings} entres
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-12 h-12 bg-brand-500 rounded-xl border-2 border-black flex items-center justify-center text-white shadow-sm">
                      <QrCode size={24} />
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-black transition-colors" />
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
