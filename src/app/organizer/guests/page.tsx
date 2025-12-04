'use client';

import React, { useEffect, useMemo, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import Button from '../../../components/UI/Button';
import { Search, Plus, CheckCircle, Download, Filter, Clock } from 'lucide-react';

type Guest = {
  id: string;
  name: string;
  ticket: string;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string;
  eventId: string;
  eventTitle: string;
  createdAt: string;
};

type EventOption = { id: string; title: string };

export default function GuestListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/organizer/events', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setEvents(data.events || []);
    } catch {
      // ignore soft
    }
  };

  const loadGuests = async (evtId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = evtId ? `/api/organizer/guests?eventId=${evtId}` : '/api/organizer/guests';
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Chargement impossible');
      setGuests(data.guests || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur chargement invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadGuests();
  }, []);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (eventFilter !== 'all' && g.eventId !== eventFilter) return false;
      if (searchTerm && !g.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [guests, eventFilter, searchTerm]);

  const toggleCheckIn = async (guest: Guest) => {
    const res = await fetch(`/api/organizer/guests/${guest.id}/checkin`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checkedIn: !guest.checkedIn }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || 'Action impossible');
      return;
    }
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guest.id ? { ...g, checkedIn: !guest.checkedIn, checkedInAt: !guest.checkedIn ? new Date().toISOString() : undefined } : g
      )
    );
  };

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 font-display uppercase">Liste des invites</h1>
            <p className="text-slate-500 font-bold text-sm">Suivi des tickets par événement et présence (check-in).</p>
          </div>
          <div className="flex gap-2">
            <Button variant="white" icon={<Download size={18} />} onClick={() => {
              const url = eventFilter === 'all' ? '/api/organizer/guests/export' : `/api/organizer/guests/export?eventId=${eventFilter}`;
              window.open(url, '_blank');
            }}>Exporter</Button>
            <Button icon={<Plus size={18} />}>Ajouter invite</Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border-2 border-black shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un nom..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 focus:border-black outline-none font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-slate-500" />
              </div>
              <select
                value={eventFilter}
                onChange={(e) => {
                  setEventFilter(e.target.value);
                  loadGuests(e.target.value === 'all' ? undefined : e.target.value);
                }}
                className="pl-9 pr-8 py-2 bg-white border-2 border-slate-200 hover:border-black rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:shadow-pop-sm transition-all cursor-pointer appearance-none"
              >
                <option value="all">Tous les evenements</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.title}</option>
                ))}
              </select>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg border border-green-200 text-xs font-black uppercase">
              Presents: {guests.filter((g) => g.checkedIn).length}
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs font-black uppercase">
              Total: {guests.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-black shadow-pop overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b-2 border-black text-slate-500 font-black uppercase text-[10px]">
              <tr>
                <th className="p-4">Nom</th>
                <th className="p-4">Ticket</th>
                <th className="p-4">Evenement</th>
                <th className="p-4">Check-in</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-yellow-50/50 transition-colors font-bold text-sm text-slate-900 group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-black border border-brand-200">
                        {guest.name.charAt(0)}
                      </div>
                      {guest.name}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs border bg-blue-50 border-blue-200">
                      {guest.ticket}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{guest.eventTitle}</td>
                  <td className="p-4 text-slate-600">
                    {guest.checkedIn ? (
                      <span className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 text-xs">
                        <CheckCircle size={12} className="mr-1" /> Présent
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-xs">
                        <Clock size={12} className="mr-1" /> À vérifier
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleCheckIn(guest)}
                      className={`px-3 py-1.5 rounded-lg border-2 font-black text-xs transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[1px] active:translate-x-[1px] ${
                        guest.checkedIn
                          ? 'bg-white border-slate-300 text-slate-500 hover:text-red-500'
                          : 'bg-green-400 border-black text-black hover:bg-green-500'
                      }`}
                    >
                      {guest.checkedIn ? 'Annuler' : 'Valider la présence'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="p-6 text-center text-slate-500 font-bold">Chargement...</div>
          )}
          {!loading && filteredGuests.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-bold">
              Aucun invite trouve.
            </div>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
}
