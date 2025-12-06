'use client';

import React, { useEffect, useMemo, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import {
  Users,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  Ban,
  Check,
  Search,
  ShieldAlert,
  Smartphone,
  X,
  RefreshCw,
  Filter,
  Wifi,
} from 'lucide-react';

type Agent = {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'blocked';
  scans: number;
  lastActive?: string;
  isOnline?: boolean;
  allEvents: boolean;
  eventIds: string[];
};

type EventOption = { id: string; title: string };

export default function TeamPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [tempSelectedEvents, setTempSelectedEvents] = useState<string[]>([]);
  const [tempAllEvents, setTempAllEvents] = useState<boolean>(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoadingAgents(true);
    setError(null);
    try {
      const res = await fetch('/api/organizer/agents', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Impossible de charger les agents');
      setAgents(data.agents || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur agents');
    } finally {
      setLoadingAgents(false);
    }
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/organizer/events', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Impossible de charger les evenements');
      setEvents(data.events || []);
    } catch (err) {
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadAgents();
    loadEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      if (statusFilter !== 'all' && agent.status !== statusFilter) return false;
      if (eventFilter !== 'all') {
        if (agent.allEvents) return true;
        return agent.eventIds.includes(eventFilter);
      }
      return true;
    });
  }, [agents, statusFilter, eventFilter]);

  const generatePlaceholderCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let str = '';
    for (let i = 0; i < 4; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AGT-${str}`;
  };

  useEffect(() => {
    if (isAddModalOpen) {
      setGeneratedCode(generatePlaceholderCode());
    }
  }, [isAddModalOpen]);

  const handleAddAgent = async () => {
    if (!newAgentName.trim()) return;
    try {
      const res = await fetch('/api/organizer/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAgentName.trim(), allEvents: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Creation impossible');
      setAgents((prev) => [data.agent, ...prev]);
      setIsAddModalOpen(false);
      setNewAgentName('');
    } catch (err: any) {
      setError(err?.message || 'Erreur creation agent');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Supprimer cet agent ?')) return;
    const res = await fetch(`/api/organizer/agents/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || 'Suppression impossible');
      return;
    }
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleStatus = async (agent: Agent) => {
    const nextStatus = agent.status === 'active' ? 'blocked' : 'active';
    const res = await fetch(`/api/organizer/agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status', status: nextStatus }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error || 'Maj impossible');
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a)));
  };

  const regenerateCode = async (agent: Agent) => {
    const res = await fetch(`/api/organizer/agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'regenerate-code' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error || 'Maj impossible');
    setAgents((prev) => prev.map((a) => (a.id === agent.id ? { ...a, code: data.code } : a)));
  };

  const openAssignModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setTempSelectedEvents(agent.eventIds || []);
    setTempAllEvents(agent.allEvents);
    setEventSearchQuery('');
    setIsAssignModalOpen(true);
  };

  const saveAssignments = async () => {
    if (!selectedAgent) return;
    const res = await fetch(`/api/organizer/agents/${selectedAgent.id}/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventIds: tempSelectedEvents, allEvents: tempAllEvents }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(data.error || 'Maj impossible');
      return;
    }
    setAgents((prev) =>
      prev.map((a) =>
        a.id === selectedAgent.id
          ? { ...a, eventIds: data.eventIds || [], allEvents: !!data.allEvents }
          : a
      )
    );
    setIsAssignModalOpen(false);
    setSelectedAgent(null);
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((e) =>
        e.title.toLowerCase().includes(eventSearchQuery.toLowerCase())
      ),
    [events, eventSearchQuery]
  );

  const getEventNames = (ids: string[], allEvents: boolean) => {
    if (allEvents) return 'Tous les evenements';
    if (ids.length === 0) return 'Aucun acces';
    if (ids.length === 1) {
      const evt = events.find((e) => e.id === ids[0]);
      return evt ? evt.title : 'Evenement inconnu';
    }
    return `${ids.length} evenements assignes`;
  };

  return (
    <OrganizerLayout>
      <div className="space-y-8 pb-20">
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-900/20 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg border border-white/20 shadow-sm">
                <Smartphone size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-black font-display uppercase">Agents & Scans</h1>
            </div>
            <p className="font-medium text-gray-300 max-w-lg">
              Cree tes agents, assigne-les a tes evenements et gere leur acces.
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10 w-full md:w-auto">
            <p className="text-xs font-black uppercase mb-2 text-orange-400">Lien de connexion App</p>
            <div className="flex items-center bg-black/50 rounded-xl p-1 pr-4 border border-white/10">
              <div className="bg-white text-black px-3 py-2 rounded-lg font-black text-xs mr-3">SCAN</div>
              <code className="text-sm font-mono text-white truncate flex-1">tikezone.com/scan/login</code>
              <button
                className="ml-3 hover:text-orange-400 transition-colors"
                title="Copier"
                onClick={() => navigator.clipboard.writeText('tikezone.com/scan/login')}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <h2 className="text-2xl font-black text-white uppercase flex items-center mr-4">
              Membres
              <span className="ml-3 bg-white/10 text-gray-300 px-2 py-0.5 rounded-full text-sm font-bold">
                {filteredAgents.length}
              </span>
            </h2>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-gray-500" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-xl text-sm font-bold text-gray-300 focus:outline-none appearance-none cursor-pointer transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="blocked">Bloques</option>
              </select>
            </div>

            <div className="relative group max-w-[220px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users size={14} className="text-gray-500" />
              </div>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white/5 border border-white/10 hover:border-orange-500/50 rounded-xl text-sm font-bold text-gray-300 focus:outline-none appearance-none cursor-pointer truncate transition-all"
              >
                <option value="all">Tous les evenements</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all w-full xl:w-auto justify-center"
          >
            <Plus size={18} />
            Ajouter un agent
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-bold">
            {error}
          </div>
        )}

        {loadingAgents ? (
          <div className="text-center py-12 text-gray-500 font-bold">Chargement...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-2xl border border-dashed border-white/20 rounded-3xl">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">Ajoute ton premier agent</h3>
            <p className="text-gray-500 font-bold text-sm mb-6">Cree un agent pour commencer les scans.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 transition-all mx-auto"
            >
              <Plus size={18} />
              Creer un agent
            </button>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-2xl border border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-500 font-bold">Aucun agent ne correspond aux filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-5 relative group hover:-translate-y-1 transition-transform"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center font-black text-lg uppercase transition-colors ${
                        agent.status === 'active' ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {agent.name.substring(0, 2)}
                      {agent.isOnline && agent.status === 'active' && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-black"></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-white leading-none mb-1">{agent.name}</h3>
                      <div className="flex gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            agent.status === 'active'
                              ? 'bg-green-500/30 text-green-400 border-green-500/30'
                              : 'bg-red-500/30 text-red-400 border-red-500/30'
                          }`}
                        >
                          {agent.status === 'active' ? 'Actif' : 'Bloque'}
                        </span>
                        {agent.isOnline && agent.status === 'active' && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-blue-500/30 text-blue-400 border-blue-500/30 flex items-center gap-1">
                            <Wifi size={10} /> En ligne
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group-hover:opacity-100 opacity-80"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <Trash2 size={18} className="text-red-400 hover:text-red-500" />
                  </button>
                </div>

                <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-3 mb-4 flex justify-between items-center relative overflow-hidden">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-0.5">Code d'acces</p>
                    <p className="font-mono font-black text-xl tracking-widest text-white">{agent.code}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => regenerateCode(agent)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/20 active:scale-95 text-gray-500 hover:text-blue-400"
                      title="Regenerer"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(agent.code)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/20 active:scale-95"
                      title="Copier le code"
                    >
                      <Copy size={18} className="text-gray-500 hover:text-white" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-500">Acces</span>
                    <span
                      className="font-black text-white max-w-[150px] truncate text-right"
                      title={getEventNames(agent.eventIds, agent.allEvents)}
                    >
                      {getEventNames(agent.eventIds, agent.allEvents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-500">Scans</span>
                    <span className="font-black text-white">{agent.scans}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-500">Derniere activite</span>
                    <span className="font-bold text-white text-xs">
                      {agent.isOnline ? <span className="text-green-400">En ligne</span> : agent.lastActive || '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => openAssignModal(agent)}
                    className="py-2.5 rounded-xl border border-white/20 hover:border-orange-500/50 font-bold text-xs text-white hover:bg-white/10 transition-all"
                  >
                    Gerer acces
                  </button>
                  <button
                    onClick={() => toggleStatus(agent)}
                    className={`py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      agent.status === 'active'
                        ? 'border-white/20 hover:border-red-500/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                        : 'border-green-500/30 bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                  >
                    {agent.status === 'active' ? (
                      <>
                        <Ban size={14} /> Bloquer
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} /> Activer
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/20 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase">Nouvel Agent</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Nom de l'agent</label>
                  <input
                    type="text"
                    placeholder="Ex: Paul"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-gray-500 focus:border-orange-500/50 outline-none"
                  />
                </div>
                <div className="bg-blue-500/20 p-4 rounded-xl border border-blue-500/30">
                  <div className="flex gap-2 items-center mb-2">
                    <ShieldAlert className="shrink-0 w-5 h-5 text-blue-400" />
                    <p className="text-xs font-black text-blue-400 uppercase">Code d'acces</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-blue-500/30 rounded-lg p-2 text-center font-mono font-black text-lg tracking-widest text-blue-300">
                      {generatedCode}
                    </div>
                    <button
                      onClick={() => setGeneratedCode(generatePlaceholderCode())}
                      className="p-2 bg-white/5 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                      title="Regenerer"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                  <p className="text-[11px] font-bold text-gray-500 mt-2">Le vrai code sera genere a la creation.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddAgent}
                    disabled={!newAgentName.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
                  >
                    Creer Agent
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAssignModalOpen && selectedAgent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/20 w-full max-w-md flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-6 border-b border-white/10 z-10">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xl font-black uppercase text-white">Assigner evenements</h3>
                  <button onClick={() => setIsAssignModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full text-white">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-500 mb-4">
                  Pour <span className="text-white bg-orange-500/30 px-1 rounded">{selectedAgent.name}</span>
                </p>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="all-events"
                    checked={tempAllEvents}
                    onChange={(e) => {
                      setTempAllEvents(e.target.checked);
                      if (e.target.checked) setTempSelectedEvents([]);
                    }}
                    className="w-4 h-4 border border-white/20 rounded bg-white/5"
                  />
                  <label htmlFor="all-events" className="font-bold text-sm text-white cursor-pointer">
                    Acces a tous les evenements
                  </label>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 font-bold text-sm focus:border-orange-500/50 outline-none"
                    disabled={tempAllEvents}
                  />
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto p-4 space-y-2 ${tempAllEvents ? 'opacity-50 pointer-events-none' : ''}`}>
                {filteredEvents.map((evt) => (
                  <label
                    key={evt.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                      tempSelectedEvents.includes(evt.id) ? 'bg-orange-500/20 border-orange-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedEvents.includes(evt.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTempSelectedEvents([...tempSelectedEvents, evt.id]);
                        } else {
                          setTempSelectedEvents(tempSelectedEvents.filter((id) => id !== evt.id));
                        }
                      }}
                      className="w-4 h-4 border border-white/20 rounded bg-white/5"
                    />
                    <span className="font-bold text-sm text-white">{evt.title}</span>
                    {tempSelectedEvents.includes(evt.id) && <Check size={16} className="ml-auto text-orange-400" />}
                  </label>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={saveAssignments}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
