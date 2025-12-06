'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Search, RefreshCw, MoreVertical, Ban, CheckCircle,
  Ticket, ShoppingBag, Calendar, Mail, Clock, Shield, UserCheck,
  Download, Crown, UserMinus, MapPin
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  totalTickets: number;
  totalSpent: number;
  eventsAttended: number;
  totalCheckedIn: number;
}

interface UserDetail {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    createdAt: string;
    lastLoginAt: string | null;
  };
  stats: {
    totalTickets: number;
    totalSpent: number;
    eventsAttended: number;
    totalCheckedIn: number;
    cancelledBookings: number;
  };
  bookings: {
    id: string;
    quantity: number;
    totalAmount: number;
    status: string;
    checkedIn: boolean;
    checkedInAt: string | null;
    createdAt: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalUsers: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        role: roleFilter,
        verified: verifiedFilter,
        sortBy,
        search
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, statusFilter, roleFilter, verifiedFilter, sortBy]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleAction = async (userId: string, action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        fetchUsers();
        if (selectedUser) {
          fetchUserDetail(userId);
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

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
          <Shield size={12} /> Admin
        </span>
      );
    }
    if (role === 'organizer') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
          <Crown size={12} /> Organisateur
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
        <Users size={12} /> Utilisateur
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Gestion des Utilisateurs</h1>
            <p className="text-gray-400">
              {pagination ? `${formatPrice(pagination.totalUsers)} utilisateurs` : 'Chargement...'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
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
        <div className="flex flex-col lg:flex-row gap-4">
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
          <div className="flex flex-wrap gap-2">
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
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">Tous les roles</option>
              <option value="user">Utilisateurs</option>
              <option value="organizer">Organisateurs</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={verifiedFilter}
              onChange={(e) => { setVerifiedFilter(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">Email</option>
              <option value="yes">Verifie</option>
              <option value="no">Non verifie</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="recent">Plus recents</option>
              <option value="name">Par nom</option>
              <option value="tickets">Par tickets</option>
              <option value="spent">Par depenses</option>
              <option value="login">Derniere connexion</option>
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
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Utilisateur</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Role</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Email</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Tickets</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Depenses</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Inscription</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        Aucun utilisateur trouve
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                              user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              user.role === 'organizer' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                              'bg-gradient-to-r from-green-500 to-teal-500'
                            }`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                        <td className="py-4 px-4">
                          {user.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                              <CheckCircle size={14} /> Verifie
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                              <Clock size={14} /> Non verifie
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="text-white font-medium">{formatPrice(user.totalTickets)}</p>
                            <p className="text-gray-400 text-xs">{user.eventsAttended} events</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-orange-400 font-bold">{formatPrice(user.totalSpent)} F</span>
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => fetchUserDetail(user.id)}
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

      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                  selectedUser.user.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                  selectedUser.user.role === 'organizer' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                  'bg-gradient-to-r from-green-500 to-teal-500'
                }`}>
                  {selectedUser.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.user.name}</h3>
                  <p className="text-gray-400">{selectedUser.user.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {getRoleBadge(selectedUser.user.role)}
                {getStatusBadge(selectedUser.user.status)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <Ticket size={20} className="text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatPrice(selectedUser.stats.totalTickets)}</p>
                <p className="text-gray-400 text-xs">Tickets</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <Calendar size={20} className="text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{selectedUser.stats.eventsAttended}</p>
                <p className="text-gray-400 text-xs">Events</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <ShoppingBag size={20} className="text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-400">{formatPrice(selectedUser.stats.totalSpent)} F</p>
                <p className="text-gray-400 text-xs">Depenses</p>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-xl text-center">
                <CheckCircle size={20} className="text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatPrice(selectedUser.stats.totalCheckedIn)}</p>
                <p className="text-gray-400 text-xs">Scannes</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-700/50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Informations</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Membre depuis</p>
                    <p className="text-white">{formatDate(selectedUser.user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Derniere connexion</p>
                    <p className="text-white">
                      {selectedUser.user.lastLoginAt 
                        ? formatDateTime(selectedUser.user.lastLoginAt)
                        : 'Jamais'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Email verifie</p>
                    <p className={selectedUser.user.emailVerified ? 'text-green-400' : 'text-yellow-400'}>
                      {selectedUser.user.emailVerified ? 'Oui' : 'Non'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Reservations annulees</p>
                    <p className="text-white">{selectedUser.stats.cancelledBookings}</p>
                  </div>
                </div>
              </div>

              {selectedUser.bookings.length > 0 && (
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Dernieres reservations</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUser.bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-2 bg-gray-600/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm truncate">{booking.eventTitle}</p>
                            {booking.checkedIn && <CheckCircle size={12} className="text-green-400 flex-shrink-0" />}
                            {booking.status === 'cancelled' && <Ban size={12} className="text-red-400 flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <span>{formatDate(booking.eventDate)}</span>
                            <span>-</span>
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {booking.eventLocation}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className={`text-sm font-medium ${booking.totalAmount === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                            {booking.totalAmount === 0 ? 'GRATUIT' : `${formatPrice(booking.totalAmount)} F`}
                          </p>
                          <p className="text-gray-400 text-xs">{booking.quantity} ticket(s)</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedUser.user.role !== 'admin' && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Actions</h4>
                
                {!selectedUser.user.emailVerified && (
                  <button
                    onClick={() => handleAction(selectedUser.user.id, 'verify_email')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors disabled:opacity-50"
                  >
                    <Mail size={18} />
                    Verifier l'email manuellement
                  </button>
                )}

                {selectedUser.user.role === 'user' && (
                  <button
                    onClick={() => {
                      if (confirm('Promouvoir cet utilisateur en organisateur ?')) {
                        handleAction(selectedUser.user.id, 'promote_organizer');
                      }
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white transition-colors disabled:opacity-50"
                  >
                    <Crown size={18} />
                    Promouvoir en organisateur
                  </button>
                )}

                {selectedUser.user.role === 'organizer' && (
                  <button
                    onClick={() => {
                      if (confirm('Retirer le role organisateur de cet utilisateur ?')) {
                        handleAction(selectedUser.user.id, 'demote_user');
                      }
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white transition-colors disabled:opacity-50"
                  >
                    <UserMinus size={18} />
                    Retirer le role organisateur
                  </button>
                )}
                
                {selectedUser.user.status === 'active' ? (
                  <button
                    onClick={() => {
                      if (confirm('Suspendre cet utilisateur ?')) {
                        handleAction(selectedUser.user.id, 'suspend');
                      }
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors disabled:opacity-50"
                  >
                    <Ban size={18} />
                    Suspendre l'utilisateur
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(selectedUser.user.id, 'activate')}
                    disabled={actionLoading}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Reactiver l'utilisateur
                  </button>
                )}
              </div>
            )}

            {selectedUser.user.role === 'admin' && (
              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-purple-400 text-sm flex items-center gap-2">
                  <Shield size={16} />
                  Les comptes admin ne peuvent pas etre modifies depuis cette interface
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedUser(null);
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
