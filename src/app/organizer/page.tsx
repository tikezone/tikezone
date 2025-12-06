'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Settings, DollarSign, Users, Eye, Calendar, MapPin, ArrowRight } from 'lucide-react';
import MainLayout from '../../components/Layout/MainLayout';
import OrganizerLayout from '../../components/Layout/OrganizerLayout';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';
import { Event } from '../../types';

type StatCardProps = { title: string; value: string | number; subtext: string; icon: any; color: string };

const StatCard = ({ title, value, subtext, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 hover:-translate-y-1 transition-transform">
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-white font-display mt-1">{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center ${color}`}>
        <Icon size={20} strokeWidth={2.5} className="text-white" />
      </div>
    </div>
    <p className="text-xs font-bold text-gray-400">{subtext}</p>
  </div>
);

const OrganizerDashboard = ({ user }: { user: any }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/organizer/events', { cache: 'no-store', credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Impossible de charger vos evenements');
        }
        if (!cancelled) {
          setEvents(
            (data.events || []).map((evt: any) => {
              const totalTickets = evt.totalTickets ?? evt.availableTickets ?? 0;
              return {
                ...evt,
                totalTickets,
                availableTickets: totalTickets,
                soldCount: evt.soldCount ?? 0,
              };
            })
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Chargement impossible');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const revenue = events.reduce((sum, e: any) => sum + (e.soldCount || 0) * (e.price || 0), 0);
    const tickets = events.reduce((sum, e: any) => sum + (e.soldCount || 0), 0);
    return { revenue, tickets, views: 0 };
  }, [events]);

  const recentEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  }, [events]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white font-display">Bonjour, {user.name}</h1>
          <p className="text-gray-400 font-medium">Publie ton premier evenement pour activer ton tableau de bord.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/organizer/settings">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all">
              <Settings size={18} />
              Parametres
            </button>
          </Link>
          <Link href="/publish">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
              <Plus size={18} />
              Creer un evenement
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Revenus Totaux" value={`${stats.revenue} FCFA`} subtext="0%" icon={DollarSign} color="bg-yellow-500/30" />
        <StatCard title="Billets Vendus" value={stats.tickets} subtext="0%" icon={Users} color="bg-orange-500/30" />
        <StatCard title="Vues Page" value={stats.views} subtext="0%" icon={Eye} color="bg-blue-500/30" />
      </div>

      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3">
        <h3 className="text-xl font-black text-white font-display uppercase">Apercu des ventes</h3>
        {stats.tickets === 0 ? (
          <p className="text-sm font-bold text-gray-400 max-w-md">Aucune donnee pour le moment. Publie ton premier evenement pour voir les stats ici.</p>
        ) : (
          <p className="text-sm font-bold text-gray-300">Total tickets vendus : {stats.tickets}</p>
        )}
      </div>

      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-white font-display uppercase">Vos evenements</h3>
            <p className="text-xs font-bold text-gray-400">
              {loading ? 'Chargement...' : `${events.length} evenement${events.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/organizer/events">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white font-bold text-sm hover:bg-white/20 transition-all">
              Voir tout
              <ArrowRight size={16} />
            </button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-bold">
            {error}
          </div>
        )}

        {!loading && !error && recentEvents.length === 0 && (
          <div className="text-center py-10 border border-dashed border-white/20 rounded-xl">
            <p className="font-black text-gray-300">Aucun evenement</p>
            <p className="text-sm font-bold text-gray-500">Publie ton premier evenement pour remplir ton tableau de bord.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentEvents.map((evt) => (
            <div key={evt.id} className="border border-white/20 rounded-2xl p-4 bg-white/5 backdrop-blur-xl flex flex-col gap-3">
              <div className="h-32 rounded-xl overflow-hidden border border-white/10">
                <img src={evt.imageUrl || '/img.png'} alt={evt.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-gray-500">{evt.category}</p>
                <h4 className="text-lg font-black text-white line-clamp-2">{evt.title}</h4>
                <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                  <Calendar size={12} /> {new Date(evt.date).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs font-bold text-gray-400 flex items-center gap-2">
                  <MapPin size={12} /> {evt.location}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-black text-gray-300 border-t border-dashed border-white/10 pt-2">
                <span>Vendus : {(evt as any).soldCount ?? 0}</span>
                <span>
                  Restants : {Math.max(((evt as any).totalTickets ?? (evt.availableTickets ?? 0)) - ((evt as any).soldCount ?? 0), 0)}
                </span>
              </div>
              <Link href={`/organizer/events/edit/${evt.id}`}>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white font-bold text-xs hover:bg-white/20 transition-all">
                  <ArrowRight size={14} />
                  Modifier
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OrganizerLanding = () => (
  <MainLayout showAnnouncement={true}>
    <div className="min-h-screen bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
      <div className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-black font-display text-white leading-tight">
            Publie tes evenements facilement
          </h1>
          <p className="text-lg font-bold text-gray-400">
            Cree un compte organisateur pour acceder au tableau de bord et publier tes evenements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=organizer">
              <button className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                Creer un compte organisateur
              </button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 text-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all">
                Se connecter
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
);

export default function OrganizerPage() {
  const { user, isAuthenticated } = useAuth();
  const isOrganizer = isAuthenticated && user?.role === 'organizer';

  if (isOrganizer && user) {
    return (
      <OrganizerLayout>
        <OrganizerDashboard user={user} />
      </OrganizerLayout>
    );
  }

  return <OrganizerLanding />;
}
