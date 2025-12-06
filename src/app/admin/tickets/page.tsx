'use client';

import { useEffect, useState } from 'react';
import { 
  Ticket, Search, Filter, RefreshCw, CheckCircle, XCircle,
  MoreVertical, Eye, Ban, RotateCcw, Download, Calendar,
  MapPin, User, Mail, Phone, Clock, AlertTriangle
} from 'lucide-react';

interface TicketItem {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  quantity: number;
  total_amount: number;
  status: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  ticket_type: string;
  ticket_price: number;
  promo_type: string | null;
  promo_value: number | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        status: statusFilter,
        type: typeFilter,
        search
      });

      const res = await fetch(`/api/admin/tickets?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, typeFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchTickets();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleAction = async (ticketId: string, action: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        fetchTickets();
        setShowModal(false);
        setSelectedTicket(null);
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const getStatusBadge = (ticket: TicketItem) => {
    if (ticket.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
          <Ban size={12} /> Annule
        </span>
      );
    }
    if (ticket.checked_in) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
          <CheckCircle size={12} /> Scanne
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
        <Clock size={12} /> En attente
      </span>
    );
  };

  const getTypeBadge = (ticket: TicketItem) => {
    if (ticket.total_amount === 0) {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">GRATUIT</span>;
    }
    if (ticket.promo_type) {
      return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">PROMO</span>;
    }
    return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">PAYANT</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Tickets</h1>
          <p className="text-gray-400">
            {pagination ? `${formatPrice(pagination.total)} tickets au total` : 'Chargement...'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTickets}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white transition-colors">
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
              placeholder="Rechercher par nom, email, telephone ou evenement..."
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
              <option value="checked_in">Scannes</option>
              <option value="not_checked_in">Non scannes</option>
              <option value="cancelled">Annules</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
            >
              <option value="all">Tous les types</option>
              <option value="free">Gratuits</option>
              <option value="paid">Payants</option>
              <option value="promo">Promo</option>
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
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Acheteur</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Evenement</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Type</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Qte</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Montant</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Date</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        Aucun ticket trouve
                      </td>
                    </tr>
                  ) : (
                    tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{ticket.buyer_name}</p>
                            <p className="text-gray-400 text-sm">{ticket.buyer_email}</p>
                            {ticket.buyer_phone && (
                              <p className="text-gray-500 text-xs">{ticket.buyer_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="max-w-[200px]">
                            <p className="text-white text-sm truncate">{ticket.event_title}</p>
                            <p className="text-gray-400 text-xs flex items-center gap-1">
                              <MapPin size={10} />
                              {ticket.event_location}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs block w-fit">
                              {ticket.ticket_type || 'Standard'}
                            </span>
                            {getTypeBadge(ticket)}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-white font-medium">{ticket.quantity}</td>
                        <td className="py-4 px-4">
                          <span className={ticket.total_amount === 0 ? 'text-green-400' : 'text-orange-400'}>
                            {ticket.total_amount === 0 ? 'GRATUIT' : `${formatPrice(ticket.total_amount)} F`}
                          </span>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(ticket)}</td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {formatDate(ticket.created_at)}
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowModal(true);
                            }}
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

      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Details du Ticket</h3>
              {getStatusBadge(selectedTicket)}
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-700/50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Acheteur</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white">
                    <User size={16} className="text-gray-400" />
                    {selectedTicket.buyer_name}
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail size={16} className="text-gray-400" />
                    {selectedTicket.buyer_email}
                  </div>
                  {selectedTicket.buyer_phone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone size={16} className="text-gray-400" />
                      {selectedTicket.buyer_phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-700/50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Evenement</h4>
                <p className="text-white font-medium mb-1">{selectedTicket.event_title}</p>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <Calendar size={14} className="text-gray-400" />
                  {formatDate(selectedTicket.event_date)}
                </div>
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <MapPin size={14} className="text-gray-400" />
                  {selectedTicket.event_location}
                </div>
              </div>

              <div className="p-4 bg-gray-700/50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Ticket</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs">Type</p>
                    <p className="text-white">{selectedTicket.ticket_type || 'Standard'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Quantite</p>
                    <p className="text-white">{selectedTicket.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Montant</p>
                    <p className="text-orange-400 font-bold">
                      {selectedTicket.total_amount === 0 ? 'GRATUIT' : `${formatPrice(selectedTicket.total_amount)} F`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Achat le</p>
                    <p className="text-white text-sm">{formatDate(selectedTicket.created_at)}</p>
                  </div>
                </div>
                {selectedTicket.checked_in && selectedTicket.checked_in_at && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                      <CheckCircle size={14} />
                      Scanne le {formatDate(selectedTicket.checked_in_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Actions</h4>
              
              {selectedTicket.status !== 'cancelled' && (
                <>
                  {!selectedTicket.checked_in ? (
                    <button
                      onClick={() => handleAction(selectedTicket.id, 'force_checkin')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Forcer le check-in
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction(selectedTicket.id, 'cancel_checkin')}
                      disabled={actionLoading}
                      className="flex items-center gap-2 w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-white transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={18} />
                      Annuler le check-in
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm('Annuler ce ticket ? Cette action remettra les places en stock.')) {
                        handleAction(selectedTicket.id, 'cancel');
                      }
                    }}
                    disabled={actionLoading}
                    className="flex items-center gap-2 w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors disabled:opacity-50"
                  >
                    <Ban size={18} />
                    Annuler le ticket
                  </button>
                </>
              )}

              {selectedTicket.status === 'cancelled' && (
                <button
                  onClick={() => handleAction(selectedTicket.id, 'restore')}
                  disabled={actionLoading}
                  className="flex items-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={18} />
                  Restaurer le ticket
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                setSelectedTicket(null);
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
