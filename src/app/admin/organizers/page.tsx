'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Search, RefreshCw, MoreVertical, Eye, Ban, CheckCircle,
  TrendingUp, Ticket, Calendar, Mail, Clock, AlertTriangle,
  BarChart3, Star, Download, Filter
} from 'lucide-react';

interface Organizer {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  totalEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalCheckedIn: number;
  scanRate: number;
}

interface OrganizerDetail {
  organizer: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    status: string;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string | null;
  };
  stats: {
    totalEvents: number;
    totalRevenue: number;
    totalTickets: number;
    totalCheckedIn: number;
    scanRate: number;
  };
  events: {
    id: string;
    title: string;
    date: string;
    location: string;
    status: string;
    isFeatured: boolean;
    isVerified: boolean;
    revenue: number;
    ticketsSold: number;
    checkedIn: number;
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalOrganizers: number;
}

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('events');
  const [selectedOrganizer, setSelectedOrganizer] = useState<OrganizerDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        sortBy,
        search
      });

      const res = await fetch(`/api/admin/organizers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrganizers(data.organizers);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching organizers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/organizers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrganizer(data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching organizer detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, [page, statusFilter, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchOrganizers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleAction = async (organizerId: string, action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/organizers/${organizerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        fetchOrganizers();
        if (selectedOrganizer) {
          fetchOrganizerDetail(organizerId);
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatDateTime = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'suspended') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
          <Ban size={12} /> Suspendu
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
        <CheckCircle size={12} /> Actif
      </span>
    );
  };

  const getScanRateBadge = (rate: number) => {
    if (rate >= 80) {
      return <span className="text-green-400">{rate}%</span>;
    } else if (rate >= 50) {
      return <span className="text-yellow-400">{rate}%</span>;
    } else if (rate > 0) {
      return <span className="text-red-400">{rate}%</span>;
    }
    return <span className="text-gray-500">-</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Supervision des Organisateurs</h1>
            <p className="text-gray-400">
              {pagination ? `${formatPrice(pagination.totalOrganizers)} organisateurs` : 'Chargement...'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOrganizers}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-white transition-colors">
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="suspended">Suspendus</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="events">Par events</option>
              <option value="revenue">Par revenus</option>
              <option value="tickets">Par tickets vendus</option>
              <option value="scan_rate">Par taux de scan</option>
              <option value="recent">Plus recents</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-700/50">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Organisateur</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Events</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Tickets vendus</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Revenus</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Taux scan</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Membre depuis</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        Aucun organisateur trouve
                      </td>
                    </tr>
                  ) : (
                    organizers.map((org) => (
                      <tr key={org.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {org.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{org.name}</p>
                              <p className="text-gray-400 text-sm">{org.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(org.status)}</td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="text-white font-medium">{org.totalEvents} total</p>
                            <p className="text-gray-400 text-xs">
                              {org.publishedEvents} publies / {org.upcomingEvents} a venir
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="text-white font-medium">{formatPrice(org.totalTicketsSold)}</p>
                            <p className="text-gray-400 text-xs">{formatPrice(org.totalCheckedIn)} scannes</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-orange-400 font-bold">{formatPrice(org.totalRevenue)} F</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  org.scanRate >= 80 ? 'bg-green-500' : 
                                  org.scanRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(org.scanRate, 100)}%` }}
                              />
                            </div>
                            {getScanRateBadge(org.scanRate)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {formatDate(org.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => fetchOrganizerDetail(org.id)}
                            disabled={detailLoading}
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors text-gray-400 hover:text-white"
                          >
                            <MoreVertical size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm">
                  Page {pagination.page} sur {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Precedent
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && selectedOrganizer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                  {selectedOrganizer.organizer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedOrganizer.organizer.name}</h3>
                  <p className="text-gray-400">{selectedOrganizer.organizer.email}</p>
                </div>
              </div>
              {getStatusBadge(selectedOrganizer.organizer.status)}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <Calendar size={20} className="text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedOrganizer.stats.totalEvents}</p>
                <p className="text-gray-400 text-xs">Events</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <Ticket size={20} className="text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatPrice(selectedOrganizer.stats.totalTickets)}</p>
                <p className="text-gray-400 text-xs">Tickets vendus</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <TrendingUp size={20} className="text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-400">{formatPrice(selectedOrganizer.stats.totalRevenue)} F</p>
                <p className="text-gray-400 text-xs">Revenus</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <BarChart3 size={20} className="text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedOrganizer.stats.scanRate}%</p>
                <p className="text-gray-400 text-xs">Taux de scan</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-700/50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Informations</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Membre depuis</p>
                    <p className="text-white">{formatDate(selectedOrganizer.organizer.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Derniere connexion</p>
                    <p className="text-white">
                      {selectedOrganizer.organizer.lastLoginAt 
                        ? formatDateTime(selectedOrganizer.organizer.lastLoginAt)
                        : 'Jamais'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email verifie</p>
                    <p className={selectedOrganizer.organizer.emailVerified ? 'text-green-400' : 'text-red-400'}>
                      {selectedOrganizer.organizer.emailVerified ? 'Oui' : 'Non'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Tickets scannes</p>
                    <p className="text-white">{formatPrice(selectedOrganizer.stats.totalCheckedIn)}</p>
                  </div>
                </div>
              </div>

              {selectedOrganizer.events.length > 0 && (
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Derniers evenements</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrganizer.events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-2 bg-gray-600/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm truncate">{event.title}</p>
                            {event.isFeatured && <Star size={12} className="text-yellow-400 flex-shrink-0" />}
                            {event.isVerified && <CheckCircle size={12} className="text-blue-400 flex-shrink-0" />}
                          </div>
                          <p className="text-gray-400 text-xs">{formatDate(event.date)} - {event.location}</p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className="text-orange-400 text-sm font-medium">{formatPrice(event.revenue)} F</p>
                          <p className="text-gray-400 text-xs">{event.ticketsSold} tickets</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Actions</h4>
              
              {selectedOrganizer.organizer.status === 'active' ? (
                <button
                  onClick={() => {
                    if (confirm('Suspendre cet organisateur ? Tous ses evenements publies seront passes en brouillon.')) {
                      handleAction(selectedOrganizer.organizer.id, 'suspend');
                    }
                  }}
                  disabled={actionLoading}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors disabled:opacity-50"
                >
                  <Ban size={18} />
                  Suspendre l'organisateur
                </button>
              ) : (
                <button
                  onClick={() => handleAction(selectedOrganizer.organizer.id, 'activate')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-colors disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Reactiver l'organisateur
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedOrganizer(null);
              }}
              className="w-full mt-4 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
