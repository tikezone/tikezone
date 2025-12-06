'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Eye, Calendar, Users, Ticket, DollarSign, 
  CheckCircle, XCircle, Star, BadgeCheck, Tag,
  Search, Filter, MoreVertical, Trash2, Edit,
  TrendingUp, Clock, AlertTriangle
} from 'lucide-react';

interface Stats {
  events: {
    total: string;
    published: string;
    draft: string;
    verified: string;
    upcoming: string;
  };
  users: {
    total: string;
    organizers: string;
    admins: string;
    verified: string;
  };
  bookings: {
    total: string;
    revenue: string;
  };
  tickets: {
    total: string;
    available: string;
    sold: string;
  };
}

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

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [statusFilter, search]);

  const fetchData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/events?status=${statusFilter}&search=${encodeURIComponent(search)}`)
      ]);

      if (statsRes.status === 401 || eventsRes.status === 401) {
        router.push('/login');
        return;
      }

      if (statsRes.status === 403 || eventsRes.status === 403) {
        router.push('/');
        return;
      }

      const [statsData, eventsData] = await Promise.all([
        statsRes.json(),
        eventsRes.json()
      ]);

      setStats(statsData);
      setEvents(eventsData.events || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, updates: Record<string, any>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setUpdating(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Supprimer cet evenement ? Cette action est irreversible.')) return;
    
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
            <Eye size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">L&apos;oeil de Dieu</h1>
            <p className="text-gray-400">Tableau de bord administrateur</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Calendar className="text-orange-500" />}
              label="Evenements"
              value={stats.events.total}
              subtext={`${stats.events.published} publies, ${stats.events.verified} verifies`}
            />
            <StatCard
              icon={<Users className="text-blue-500" />}
              label="Utilisateurs"
              value={stats.users.total}
              subtext={`${stats.users.organizers} organisateurs`}
            />
            <StatCard
              icon={<Ticket className="text-green-500" />}
              label="Tickets vendus"
              value={stats.tickets.sold}
              subtext={`sur ${stats.tickets.total} disponibles`}
            />
            <StatCard
              icon={<DollarSign className="text-yellow-500" />}
              label="Revenus"
              value={`${formatPrice(stats.bookings.revenue)} F`}
              subtext={`${stats.bookings.total} reservations`}
            />
          </div>
        )}

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-2 text-gray-400 font-medium">Evenement</th>
                  <th className="text-left py-4 px-2 text-gray-400 font-medium">Organisateur</th>
                  <th className="text-left py-4 px-2 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-4 px-2 text-gray-400 font-medium">Tickets</th>
                  <th className="text-left py-4 px-2 text-gray-400 font-medium">Badges</th>
                  <th className="text-left py-4 px-2 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const available = parseInt(event.available_tickets);
                  const total = parseInt(event.total_tickets);
                  const sold = total - available;
                  const almostSoldOut = available > 0 && available < 100;
                  const soldOut = available === 0 && total > 0;

                  return (
                    <tr key={event.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.image_url || 'https://via.placeholder.com/50'}
                            alt={event.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-semibold">{event.title}</div>
                            <div className="text-sm text-gray-400">{event.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="text-sm">
                          <div>{event.organizer_company || event.organizer_name || '-'}</div>
                          <div className="text-gray-400">{event.organizer_email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm">{formatDate(event.date)}</td>
                      <td className="py-4 px-2">
                        <div className="text-sm">
                          <span className="text-green-400">{sold}</span>
                          <span className="text-gray-400"> / {total}</span>
                        </div>
                        {soldOut && (
                          <span className="inline-flex items-center gap-1 text-xs text-red-400 animate-pulse">
                            <AlertTriangle size={12} /> Epuise
                          </span>
                        )}
                        {almostSoldOut && (
                          <span className="inline-flex items-center gap-1 text-xs text-orange-400 animate-pulse">
                            <AlertTriangle size={12} /> Presque epuise
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-wrap gap-1">
                          {event.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              <BadgeCheck size={12} /> Verifie
                            </span>
                          )}
                          {event.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              <Star size={12} /> Vedette
                            </span>
                          )}
                          {event.is_promo && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                              <Tag size={12} /> -{event.discount_percent}%
                            </span>
                          )}
                          {event.is_event_of_year && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                              <TrendingUp size={12} /> Event de l&apos;annee
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowModal(true);
                          }}
                          className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {events.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Aucun evenement trouve
            </div>
          )}
        </div>
      </div>

      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700">
            <h3 className="text-xl font-bold mb-4">{selectedEvent.title}</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="text-blue-400" size={20} />
                  <span>Verifie</span>
                </div>
                <button
                  onClick={() => updateEvent(selectedEvent.id, { is_verified: !selectedEvent.is_verified })}
                  disabled={updating}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedEvent.is_verified ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    selectedEvent.is_verified ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400" size={20} />
                  <span>Vedette</span>
                </div>
                <button
                  onClick={() => updateEvent(selectedEvent.id, { is_featured: !selectedEvent.is_featured })}
                  disabled={updating}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedEvent.is_featured ? 'bg-yellow-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    selectedEvent.is_featured ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-purple-400" size={20} />
                  <span>Event de l&apos;annee</span>
                </div>
                <button
                  onClick={() => updateEvent(selectedEvent.id, { is_event_of_year: !selectedEvent.is_event_of_year })}
                  disabled={updating}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedEvent.is_event_of_year ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    selectedEvent.is_event_of_year ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-xl">
                <div className="flex items-center gap-2">
                  <Tag className="text-orange-400" size={20} />
                  <span>Promo</span>
                </div>
                <button
                  onClick={() => updateEvent(selectedEvent.id, { is_promo: !selectedEvent.is_promo })}
                  disabled={updating}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    selectedEvent.is_promo ? 'bg-orange-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                    selectedEvent.is_promo ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {selectedEvent.is_promo && (
                <div className="p-3 bg-gray-700 rounded-xl">
                  <label className="block text-sm text-gray-400 mb-2">Pourcentage de reduction</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    defaultValue={selectedEvent.discount_percent || 10}
                    onChange={(e) => updateEvent(selectedEvent.id, { discount_percent: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => deleteEvent(selectedEvent.id)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedEvent(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtext: string;
}) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gray-700 rounded-xl">{icon}</div>
        <span className="text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-gray-400">{subtext}</div>
    </div>
  );
}
