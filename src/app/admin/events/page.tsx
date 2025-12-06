'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, Search, Filter, RefreshCw, CheckCircle, XCircle,
  MoreVertical, Eye, Trash2, Star, BadgeCheck, Tag, TrendingUp,
  MapPin, Clock, Users, Ticket, AlertTriangle, ExternalLink,
  EyeOff, Edit
} from 'lucide-react';

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  date: string;
  location: string;
  category: string;
  status: string;
  is_verified: boolean;
  is_featured: boolean;
  is_event_of_year: boolean;
  is_promo: boolean;
  discount_percent: number | null;
  image_url: string;
  created_at: string;
  organizer_email: string;
  organizer_name: string;
  organizer_company: string;
  total_tickets: string;
  available_tickets: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const updateEvent = async (eventId: string, updates: Record<string, any>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        fetchEvents();
        if (selectedEvent) {
          setSelectedEvent({ ...selectedEvent, ...updates });
        }
      }
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Supprimer cet evenement ? Cette action est irreversible et supprimera tous les tickets associes.')) return;
    
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchEvents();
        setShowModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getStockStatus = (event: AdminEvent) => {
    const available = parseInt(event.available_tickets);
    const total = parseInt(event.total_tickets);

    if (total === 0) return null;
    if (available === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-red-400 animate-pulse">
          <AlertTriangle size={12} /> Epuise
        </span>
      );
    }
    if (available < 100) {
      return (
        <span className="inline-flex items-center gap-1 text-xs text-orange-400 animate-pulse">
          <AlertTriangle size={12} /> Presque epuise
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Evenements</h1>
          <p className="text-gray-400">{events.length} evenements</p>
        </div>
        <button
          onClick={fetchEvents}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un evenement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publies</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-700/50">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Evenement</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Organisateur</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Date</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Tickets</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Badges</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Aucun evenement trouve
                    </td>
                  </tr>
                ) : (
                  events.map((event) => {
                    const available = parseInt(event.available_tickets);
                    const total = parseInt(event.total_tickets);
                    const sold = total - available;
                    const isPast = new Date(event.date) < new Date();

                    return (
                      <tr key={event.id} className={`border-b border-gray-700/50 hover:bg-gray-700/30 ${isPast ? 'opacity-60' : ''}`}>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={event.image_url || 'https://via.placeholder.com/50'}
                              alt={event.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-semibold text-white">{event.title}</div>
                              <div className="text-sm text-gray-400 flex items-center gap-1">
                                <MapPin size={12} />
                                {event.location}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <div className="text-white">{event.organizer_company || event.organizer_name || '-'}</div>
                            <div className="text-gray-400">{event.organizer_email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-white">{formatDate(event.date)}</div>
                          {isPast && (
                            <span className="text-xs text-gray-500">Passe</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <span className="text-green-400 font-medium">{sold}</span>
                            <span className="text-gray-400"> / {total}</span>
                          </div>
                          {getStockStatus(event)}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.status === 'published' ? 'Publie' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {event.is_verified && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                <BadgeCheck size={12} />
                              </span>
                            )}
                            {event.is_featured && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                                <Star size={12} />
                              </span>
                            )}
                            {event.is_promo && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                                <Tag size={12} />
                              </span>
                            )}
                            {event.is_event_of_year && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                <TrendingUp size={12} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/events/${event.id}`}
                              target="_blank"
                              className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                              <ExternalLink size={18} />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowModal(true);
                              }}
                              className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                            >
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedEvent.image_url || 'https://via.placeholder.com/60'}
                alt={selectedEvent.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <MapPin size={12} />
                  {selectedEvent.location}
                </p>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-400">Badges & Verification</h4>
              
              <ToggleOption
                icon={<BadgeCheck className="text-blue-400" size={20} />}
                label="Verifie"
                description="L'evenement a ete verifie par l'equipe"
                checked={selectedEvent.is_verified}
                onChange={() => updateEvent(selectedEvent.id, { is_verified: !selectedEvent.is_verified })}
                disabled={updating}
              />

              <ToggleOption
                icon={<Star className="text-yellow-400" size={20} />}
                label="Vedette"
                description="Affiche en avant sur la page d'accueil"
                checked={selectedEvent.is_featured}
                onChange={() => updateEvent(selectedEvent.id, { is_featured: !selectedEvent.is_featured })}
                disabled={updating}
              />

              <ToggleOption
                icon={<TrendingUp className="text-purple-400" size={20} />}
                label="Event de l'annee"
                description="Marque comme evenement exceptionnel"
                checked={selectedEvent.is_event_of_year}
                onChange={() => updateEvent(selectedEvent.id, { is_event_of_year: !selectedEvent.is_event_of_year })}
                disabled={updating}
              />

              <ToggleOption
                icon={<Tag className="text-orange-400" size={20} />}
                label="Promo"
                description="Affiche un badge promo sur l'evenement"
                checked={selectedEvent.is_promo}
                onChange={() => updateEvent(selectedEvent.id, { is_promo: !selectedEvent.is_promo })}
                disabled={updating}
              />

              {selectedEvent.is_promo && (
                <div className="p-3 bg-gray-700 rounded-xl ml-8">
                  <label className="block text-sm text-gray-400 mb-2">Pourcentage de reduction</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={selectedEvent.discount_percent || 10}
                    onBlur={(e) => updateEvent(selectedEvent.id, { discount_percent: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-400">Actions Rapides</h4>
              
              {selectedEvent.status === 'published' ? (
                <button
                  onClick={() => {
                    if (confirm('Depublier cet evenement ? Il ne sera plus visible publiquement.')) {
                      updateEvent(selectedEvent.id, { status: 'draft' });
                    }
                  }}
                  disabled={updating}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white transition-colors disabled:opacity-50"
                >
                  <EyeOff size={18} />
                  Depublier l&apos;evenement
                </button>
              ) : (
                <button
                  onClick={() => updateEvent(selectedEvent.id, { status: 'published' })}
                  disabled={updating}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-colors disabled:opacity-50"
                >
                  <Eye size={18} />
                  Publier l&apos;evenement
                </button>
              )}

              <button
                onClick={() => deleteEvent(selectedEvent.id)}
                className="flex items-center gap-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors"
              >
                <Trash2 size={18} />
                Supprimer definitivement
              </button>
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedEvent(null);
              }}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleOption({
  icon,
  label,
  description,
  checked,
  onChange,
  disabled
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-xl">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <span className="text-white font-medium">{label}</span>
          <p className="text-gray-400 text-xs">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-gray-600'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`} />
      </button>
    </div>
  );
}
