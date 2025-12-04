'use client';

import React, { useEffect, useMemo, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
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
      // ignore soft
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
        <div className="bg-slate-900 rounded-3xl border-4 border-black p-8 text-white shadow-pop flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-brand-500 p-2 rounded-lg border-2 border-white shadow-sm">
                <Smartphone size={24} className="text-white" />
              </div>
              <h1 className="text-3xl font-black font-display uppercase">Agents & Scans</h1>
            </div>
            <p className="font-medium text-slate-300 max-w-lg">
              Cree tes agents, assigne-les a tes evenements et gere leur acces.
            </p>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border-2 border-white/10 backdrop-blur-md relative z-10 w-full md:w-auto">
            <p className="text-xs font-black uppercase mb-2 text-brand-400">Lien de connexion App</p>
            <div className="flex items-center bg-black/50 rounded-xl p-1 pr-4 border border-white/10">
              <div className="bg-white text-black px-3 py-2 rounded-lg font-black text-xs mr-3">SCAN</div>
              <code className="text-sm font-mono text-white truncate flex-1">tikezone.com/scan/login</code>
              <button
                className="ml-3 hover:text-brand-400 transition-colors"
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
            <h2 className="text-2xl font-black text-slate-900 uppercase flex items-center mr-4">
              Membres
              <span className="ml-3 bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-sm font-bold">
                {filteredAgents.length}
              </span>
            </h2>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-slate-500" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 bg-white border-2 border-slate-200 hover:border-black rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:shadow-pop-sm transition-all cursor-pointer appearance-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="blocked">Bloques</option>
              </select>
            </div>

            <div className="relative group max-w-[220px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users size={14} className="text-slate-500" />
              </div>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border-2 border-slate-200 hover:border-black rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:shadow-pop-sm transition-all cursor-pointer appearance-none truncate"
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

          <Button onClick={() => setIsAddModalOpen(true)} icon={<Plus size={18} />} className="w-full xl:w-auto">
            Ajouter un agent
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 text-red-700 rounded-xl p-3 text-sm font-bold">
            {error}
          </div>
        )}

        {loadingAgents ? (
          <div className="text-center py-12 text-slate-400 font-bold">Chargement...</div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16 bg-white border-2 border-dashed border-slate-300 rounded-3xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-1">Ajoute ton premier agent</h3>
            <p className="text-slate-500 font-bold text-sm mb-6">Cree un agent pour commencer les scans.</p>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(true)} icon={<Plus size={18} />}>
              Creer un agent
            </Button>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-bold">Aucun agent ne correspond aux filtres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-2xl border-2 border-black shadow-pop p-5 relative group hover:-translate-y-1 transition-transform"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-black text-lg uppercase transition-colors ${
                        agent.status === 'active' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-400'
                      }`}
                    >
                      {agent.name.substring(0, 2)}
                      {agent.isOnline && agent.status === 'active' && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900 leading-none mb-1">{agent.name}</h3>
                      <div className="flex gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            agent.status === 'active'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {agent.status === 'active' ? 'Actif' : 'Bloque'}
                        </span>
                        {agent.isOnline && agent.status === 'active' && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200 flex items-center gap-1">
                            <Wifi size={10} /> En ligne
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors group-hover:opacity-100 opacity-80"
                    onClick={() => handleDeleteAgent(agent.id)}
                  >
                    <Trash2 size={18} className="text-red-400 hover:text-red-600" />
                  </button>
                </div>

                <div className="bg-slate-50 border-2 border-black border-dashed rounded-xl p-3 mb-4 flex justify-between items-center relative overflow-hidden">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Code d'acces</p>
                    <p className="font-mono font-black text-xl tracking-widest text-slate-900">{agent.code}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => regenerateCode(agent)}
                      className="p-2 hover:bg-white rounded-lg transition-colors border-2 border-transparent hover:border-slate-200 active:scale-95 text-slate-400 hover:text-blue-600"
                      title="Regenerer"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(agent.code)}
                      className="p-2 hover:bg-white rounded-lg transition-colors border-2 border-transparent hover:border-slate-200 active:scale-95"
                      title="Copier le code"
                    >
                      <Copy size={18} className="text-slate-400 hover:text-black" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500">Acces</span>
                    <span
                      className="font-black text-slate-900 max-w-[150px] truncate text-right"
                      title={getEventNames(agent.eventIds, agent.allEvents)}
                    >
                      {getEventNames(agent.eventIds, agent.allEvents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500">Scans</span>
                    <span className="font-black text-slate-900">{agent.scans}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-500">Derniere activite</span>
                    <span className="font-bold text-slate-900 text-xs">
                      {agent.isOnline ? <span className="text-green-600">En ligne</span> : agent.lastActive || '-'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-slate-100">
                  <button
                    onClick={() => openAssignModal(agent)}
                    className="py-2.5 rounded-xl border-2 border-slate-200 hover:border-black font-bold text-xs hover:bg-white hover:shadow-sm transition-all"
                  >
                    Gerer acces
                  </button>
                  <button
                    onClick={() => toggleStatus(agent)}
                    className={`py-2.5 rounded-xl border-2 font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      agent.status === 'active'
                        ? 'border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-600 hover:text-red-600'
                        : 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border-4 border-black shadow-pop-lg w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="bg-brand-500 p-6 border-b-4 border-black">
                <h3 className="text-xl font-black text-white uppercase">Nouvel Agent</h3>
              </div>
              <div className="p-6 space-y-6">
                <Input
                  label="Nom de l'agent"
                  placeholder="Ex: Paul"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  autoFocus
                />
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                  <div className="flex gap-2 items-center mb-2">
                    <ShieldAlert className="shrink-0 w-5 h-5 text-blue-600" />
                    <p className="text-xs font-black text-blue-800 uppercase">Code d'acces</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white border-2 border-blue-200 rounded-lg p-2 text-center font-mono font-black text-lg tracking-widest text-blue-900">
                      {generatedCode}
                    </div>
                    <button
                      onClick={() => setGeneratedCode(generatePlaceholderCode())}
                      className="p-2 bg-white border-2 border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                      title="Regenerer"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 mt-2">Le vrai code sera genere a la creation.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} fullWidth>
                    Annuler
                  </Button>
                  <Button variant="primary" onClick={handleAddAgent} disabled={!newAgentName.trim()} fullWidth>
                    Creer Agent
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAssignModalOpen && selectedAgent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border-4 border-black shadow-pop-lg w-full max-w-md flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
              <div className="p-6 border-b-2 border-slate-100 bg-white z-10">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-xl font-black uppercase">Assigner evenements</h3>
                  <button onClick={() => setIsAssignModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm font-bold text-slate-500 mb-4">
                  Pour <span className="text-slate-900 bg-yellow-200 px-1 rounded">{selectedAgent.name}</span>
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
                    className="w-4 h-4 border-2 border-black rounded"
                  />
                  <label htmlFor="all-events" className="text-sm font-bold text-slate-800">
                    Acces a tous les evenements
                  </label>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-black outline-none font-bold text-sm bg-slate-50 focus:bg-white transition-colors"
                    placeholder="Rechercher un evenement..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    disabled={tempAllEvents}
                  />
                </div>
              </div>

              <div className="p-4 space-y-2 overflow-y-auto flex-1 bg-slate-50 custom-scrollbar">
                {loadingEvents ? (
                  <div className="text-center py-8 text-slate-400 font-bold text-sm">Chargement...</div>
                ) : tempAllEvents ? (
                  <div className="text-center py-8 text-slate-500 font-bold text-sm">Acces global activé.</div>
                ) : filteredEvents.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 font-bold text-xs">Aucun evenement trouve.</p>
                ) : (
                  filteredEvents.map((evt) => {
                    const isSelected = tempSelectedEvents.includes(evt.id);
                    return (
                      <label
                        key={evt.id}
                        onClick={() =>
                          setTempSelectedEvents((prev) =>
                            isSelected ? prev.filter((v) => v !== evt.id) : [...prev, evt.id]
                          )
                        }
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-brand-500 shadow-sm ring-1 ring-brand-500'
                            : 'bg-white border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors ${
                            isSelected ? 'bg-brand-500 border-brand-500' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check size={12} className="text-white" strokeWidth={4} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate text-slate-900">{evt.title}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t-2 border-slate-200 bg-white flex gap-3">
                <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)} fullWidth>
                  Annuler
                </Button>
                <Button variant="primary" onClick={saveAssignments} fullWidth>
                  Enregistrer
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
