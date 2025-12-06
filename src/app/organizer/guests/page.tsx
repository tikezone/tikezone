'use client';

import React, { useEffect, useMemo, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
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
            <h1 className="text-3xl font-black text-white font-display uppercase">Liste des invites</h1>
            <p className="text-gray-400 font-bold text-sm">Suivi des tickets par evenement et presence (check-in).</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const url = eventFilter === 'all' ? '/api/organizer/guests/export' : `/api/organizer/guests/export?eventId=${eventFilter}`;
                window.open(url, '_blank');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all"
            >
              <Download size={18} />
              Exporter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
              <Plus size={18} />
              Ajouter invite
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Rechercher un nom..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 font-bold text-sm focus:border-orange-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-gray-500" />
              </div>
              <select
                value={eventFilter}
                onChange={(e) => {
                  setEventFilter(e.target.value);
                  loadGuests(e.target.value === 'all' ? undefined : e.target.value);
                }}
                className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-xl text-sm font-bold text-gray-300 focus:outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="all">Tous les evenements</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.title}</option>
                ))}
              </select>
            </div>
            <span className="px-3 py-1 bg-green-500/30 text-green-400 rounded-lg border border-green-500/30 text-xs font-black uppercase">
              Presents: {guests.filter((g) => g.checkedIn).length}
            </span>
            <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-lg border border-white/10 text-xs font-black uppercase">
              Total: {guests.length}
            </span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-gray-500 font-black uppercase text-[10px]">
              <tr>
                <th className="p-4">Nom</th>
                <th className="p-4">Ticket</th>
                <th className="p-4">Evenement</th>
                <th className="p-4">Check-in</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="hover:bg-white/5 transition-colors font-bold text-sm text-white group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/30 text-orange-400 flex items-center justify-center text-xs font-black border border-orange-500/30">
                        {guest.name.charAt(0)}
                      </div>
                      {guest.name}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-xs border bg-blue-500/30 border-blue-500/30 text-blue-400">
                      {guest.ticket}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{guest.eventTitle}</td>
                  <td className="p-4 text-gray-400">
                    {guest.checkedIn ? (
                      <span className="inline-flex items-center text-green-400 bg-green-500/20 px-2 py-1 rounded border border-green-500/30 text-xs">
                        <CheckCircle size={12} className="mr-1" /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10 text-xs">
                        <Clock size={12} className="mr-1" /> A verifier
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleCheckIn(guest)}
                      className={`px-3 py-1.5 rounded-lg border font-black text-xs transition-all ${
                        guest.checkedIn
                          ? 'bg-white/10 border-white/20 text-gray-400 hover:text-red-400 hover:border-red-500/50'
                          : 'bg-green-500/30 border-green-500/30 text-green-400 hover:bg-green-500/50'
                      }`}
                    >
                      {guest.checkedIn ? 'Annuler' : 'Valider la presence'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="p-6 text-center text-gray-500 font-bold">Chargement...</div>
          )}
          {!loading && filteredGuests.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-bold">
              Aucun invite trouve.
            </div>
          )}
        </div>
      </div>
    </OrganizerLayout>
  );
}
