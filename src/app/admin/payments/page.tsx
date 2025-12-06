'use client';

import { useEffect, useState } from 'react';
import { 
  CreditCard, RefreshCw, TrendingUp, Wallet, Clock, CheckCircle,
  XCircle, Download, Filter, Calendar, User, Building2, ArrowUpRight,
  ArrowDownRight, AlertTriangle, Banknote, PiggyBank
} from 'lucide-react';

interface Stats {
  total_bookings: string;
  total_revenue: string;
  confirmed_revenue: string;
  cancelled_revenue: string;
  free_tickets: string;
  paid_tickets: string;
}

interface PayoutStats {
  total_payouts: string;
  total_paid: string;
  pending_amount: string;
  completed_amount: string;
  failed_amount: string;
}

interface Transaction {
  id: string;
  quantity: number;
  total_amount: number;
  status: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  checked_in: boolean;
  created_at: string;
  event_title: string;
  event_date: string;
  tier_name: string;
  organizer_name: string;
  organizer_email: string;
}

interface Payout {
  id: string;
  organizer_email: string;
  amount: number;
  method: string;
  destination: string;
  status: string;
  note: string;
  created_at: string;
}

interface OrganizerBalance {
  id: string;
  email: string;
  full_name: string;
  company_name: string;
  total_revenue: string;
  total_paid: string;
  balance: string;
}

interface DailyRevenue {
  date: string;
  bookings: string;
  revenue: string;
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [payoutStats, setPayoutStats] = useState<PayoutStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [organizerBalances, setOrganizerBalances] = useState<OrganizerBalance[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [period, setPeriod] = useState('all');
  const [type, setType] = useState('all');
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts' | 'balances'>('transactions');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, type });
      const res = await fetch(`/api/admin/payments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPayoutStats(data.payoutStats);
        setTransactions(data.transactions || []);
        setPayouts(data.payouts || []);
        setOrganizerBalances(data.organizerBalances || []);
        setDailyRevenue(data.dailyRevenue || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, type]);

  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('fr-FR').format(num);
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

  const formatShortDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short'
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <CheckCircle size={12} /> {status === 'confirmed' ? 'Confirme' : 'Complete'}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            <Clock size={12} /> En attente
          </span>
        );
      case 'cancelled':
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            <XCircle size={12} /> {status === 'cancelled' ? 'Annule' : 'Echoue'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
            {status}
          </span>
        );
    }
  };

  const maxRevenue = Math.max(...dailyRevenue.map(d => parseFloat(d.revenue) || 0), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl">
            <CreditCard size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Paiements & Finances</h1>
            <p className="text-gray-400">Vue globale des transactions et paiements</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
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

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <TrendingUp size={20} className="text-green-400" />
                </div>
                <span className="text-gray-400 text-sm">Revenus totaux</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{formatPrice(stats?.total_revenue || 0)} F</p>
              <p className="text-gray-500 text-xs mt-1">{formatPrice(stats?.total_bookings || 0)} reservations</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Wallet size={20} className="text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm">Confirmes</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatPrice(stats?.confirmed_revenue || 0)} F</p>
              <p className="text-gray-500 text-xs mt-1">{formatPrice(stats?.paid_tickets || 0)} tickets payes</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Clock size={20} className="text-yellow-400" />
                </div>
                <span className="text-gray-400 text-sm">Payouts en attente</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{formatPrice(payoutStats?.pending_amount || 0)} F</p>
              <p className="text-gray-500 text-xs mt-1">{formatPrice(payoutStats?.total_payouts || 0)} demandes</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Banknote size={20} className="text-purple-400" />
                </div>
                <span className="text-gray-400 text-sm">Total verse</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{formatPrice(payoutStats?.completed_amount || 0)} F</p>
              <p className="text-gray-500 text-xs mt-1">{formatPrice(stats?.free_tickets || 0)} tickets gratuits</p>
            </div>
          </div>

          {dailyRevenue.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Revenus des 30 derniers jours</h3>
              <div className="flex items-end gap-1 h-32">
                {dailyRevenue.slice(0, 30).reverse().map((day, idx) => {
                  const height = (parseFloat(day.revenue) / maxRevenue) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className="w-full bg-gradient-to-t from-orange-500 to-yellow-500 rounded-t transition-all group-hover:from-orange-400 group-hover:to-yellow-400"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {formatShortDate(day.date)}: {formatPrice(day.revenue)} F
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'transactions' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Transactions
                </button>
                <button
                  onClick={() => setActiveTab('payouts')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'payouts' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Payouts
                </button>
                <button
                  onClick={() => setActiveTab('balances')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'balances' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Soldes organisateurs
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="all">Toutes les periodes</option>
                  <option value="today">Aujourd&apos;hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                </select>
                {activeTab === 'transactions' && (
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="all">Tous les types</option>
                    <option value="paid">Payes</option>
                    <option value="free">Gratuits</option>
                  </select>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'transactions' && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-700/50">
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Acheteur</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Evenement</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Ticket</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Montant</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          Aucune transaction trouvee
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-white font-medium">{tx.buyer_name || 'Anonyme'}</p>
                              <p className="text-gray-400 text-sm">{tx.buyer_email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-white">{tx.event_title || '-'}</p>
                            <p className="text-gray-400 text-xs">{tx.organizer_name || tx.organizer_email}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-white">{tx.tier_name || 'Standard'}</p>
                            <p className="text-gray-400 text-xs">x{tx.quantity}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-bold ${tx.total_amount === 0 ? 'text-green-400' : 'text-orange-400'}`}>
                              {tx.total_amount === 0 ? 'GRATUIT' : `${formatPrice(tx.total_amount)} F`}
                            </span>
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(tx.status)}</td>
                          <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(tx.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payouts' && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-700/50">
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Organisateur</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Montant</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Methode</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Destination</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          Aucun payout trouve
                        </td>
                      </tr>
                    ) : (
                      payouts.map((payout) => (
                        <tr key={payout.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-4 px-4">
                            <p className="text-white">{payout.organizer_email}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-orange-400 font-bold">{formatPrice(payout.amount)} F</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-white">{payout.method || '-'}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400">{payout.destination || '-'}</span>
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(payout.status)}</td>
                          <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(payout.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'balances' && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-700/50">
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Organisateur</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Revenus totaux</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Deja verse</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Solde</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizerBalances.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-gray-400">
                          Aucun solde a afficher
                        </td>
                      </tr>
                    ) : (
                      organizerBalances.map((org) => (
                        <tr key={org.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {(org.company_name || org.full_name || org.email).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{org.company_name || org.full_name || 'Sans nom'}</p>
                                <p className="text-gray-400 text-sm">{org.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-green-400 font-medium">{formatPrice(org.total_revenue)} F</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-purple-400 font-medium">{formatPrice(org.total_paid)} F</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-bold ${parseFloat(org.balance) > 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                              {formatPrice(org.balance)} F
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
