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
  <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-pop hover:-translate-y-1 transition-transform">
    <div className="flex justify-between items-start mb-3">
      <div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 font-display mt-1">{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center ${color}`}>
        <Icon size={20} strokeWidth={2.5} className="text-black" />
      </div>
    </div>
    <p className="text-xs font-bold text-slate-600">{subtext}</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-display">Bonjour, {user.name}</h1>
          <p className="text-slate-600 font-medium">Publie ton premier evenement pour activer ton tableau de bord.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/organizer/settings">
            <Button variant="white" icon={<Settings size={18} />}>Parametres</Button>
          </Link>
          <Link href="/publish">
            <Button icon={<Plus size={18} />}>Creer un evenement</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Revenus Totaux" value={`${stats.revenue} FCFA`} subtext="0%" icon={DollarSign} color="bg-yellow-200" />
        <StatCard title="Billets Vendus" value={stats.tickets} subtext="0%" icon={Users} color="bg-brand-200" />
        <StatCard title="Vues Page" value={stats.views} subtext="0%" icon={Eye} color="bg-blue-200" />
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-pop flex flex-col items-center justify-center text-center gap-3">
        <h3 className="text-xl font-black text-slate-900 font-display uppercase">Apercu des ventes</h3>
        {stats.tickets === 0 ? (
          <p className="text-sm font-bold text-slate-500 max-w-md">Aucune donnee pour le moment. Publie ton premier evenement pour voir les stats ici.</p>
        ) : (
          <p className="text-sm font-bold text-slate-700">Total tickets vendus : {stats.tickets}</p>
        )}
      </div>

      {/* Liste des evenements */}
      <div className="bg-white border-2 border-black rounded-2xl p-6 shadow-pop space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-display uppercase">Vos evenements</h3>
            <p className="text-xs font-bold text-slate-500">
              {loading ? 'Chargement...' : `${events.length} evenement${events.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/organizer/events">
            <Button variant="secondary" icon={<ArrowRight size={16} />}>Voir tout</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold">
            {error}
          </div>
        )}

        {!loading && !error && recentEvents.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="font-black text-slate-700">Aucun evenement</p>
            <p className="text-sm font-bold text-slate-500">Publie ton premier evenement pour remplir ton tableau de bord.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentEvents.map((evt) => (
            <div key={evt.id} className="border-2 border-black rounded-2xl p-4 bg-slate-50 shadow-pop-sm flex flex-col gap-3">
              <div className="h-32 rounded-xl overflow-hidden border-2 border-black">
                <img src={evt.imageUrl || '/img.png'} alt={evt.title} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500">{evt.category}</p>
                <h4 className="text-lg font-black text-slate-900 line-clamp-2">{evt.title}</h4>
                <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                  <Calendar size={12} /> {new Date(evt.date).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                  <MapPin size={12} /> {evt.location}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-black text-slate-700 border-t border-dashed border-slate-200 pt-2">
                <span>Vendus : {(evt as any).soldCount ?? 0}</span>
                <span>
                  Restants : {Math.max(((evt as any).totalTickets ?? (evt.availableTickets ?? 0)) - ((evt as any).soldCount ?? 0), 0)}
                </span>
              </div>
              <Link href={`/organizer/events/edit/${evt.id}`}>
                <Button variant="white" className="w-full text-xs" icon={<ArrowRight size={14} />}>
                  Modifier
                </Button>
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
    <div className="bg-yellow-300 border-b-4 border-black py-16 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-5xl font-black font-display text-slate-900 leading-tight drop-shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
          Publie tes evenements facilement
        </h1>
        <p className="text-lg font-bold text-slate-700">
          Cree un compte organisateur pour acceder au tableau de bord et publier tes evenements.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register?role=organizer">
            <Button variant="primary" className="px-8 py-4 text-lg">Creer un compte organisateur</Button>
          </Link>
          <Link href="/login">
            <Button variant="white" className="px-8 py-4 text-lg">Se connecter</Button>
          </Link>
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
