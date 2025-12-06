'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, TrendingDown, Calendar, Users, Ticket, DollarSign, 
  CheckCircle, AlertTriangle, Activity, MapPin, Eye, RefreshCw,
  Zap, ShieldAlert, Clock
} from 'lucide-react';

interface Stats {
  events: { total: string; published: string; draft: string; verified: string; upcoming: string };
  users: { total: string; organizers: string; admins: string; verified: string };
  bookings: { total: string; revenue: string };
  tickets: { total: string; available: string; sold: string };
}

interface AdvancedStats {
  salesByPeriod: {
    today: number;
    week: number;
    month: number;
    ticketsToday: number;
    ticketsWeek: number;
    ticketsMonth: number;
  };
  topEvents: Array<{
    id: string;
    title: string;
    image_url: string;
    location: string;
    tickets_sold: number;
    total_revenue: number;
  }>;
  topCities: Array<{
    city: string;
    events_count: number;
    bookings_count: number;
    revenue: number;
  }>;
  scanStats: {
    total: number;
    checkedIn: number;
    notCheckedIn: number;
    rate: number;
  };
  recentBookings: Array<{
    id: string;
    buyer_name: string;
    buyer_email: string;
    total_amount: number;
    quantity: number;
    created_at: string;
    event_title: string;
    ticket_type: string;
  }>;
  fraudAlerts: {
    duplicateScans: number;
    cancelledButScanned: number;
    bulkPurchases: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [advancedStats, setAdvancedStats] = useState<AdvancedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, advancedRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/stats/advanced')
      ]);

      if (statsRes.ok && advancedRes.ok) {
        const [statsData, advancedData] = await Promise.all([
          statsRes.json(),
          advancedRes.json()
        ]);
        setStats(statsData);
        setAdvancedStats(advancedData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const totalFraudAlerts = advancedStats 
    ? advancedStats.fraudAlerts.duplicateScans + advancedStats.fraudAlerts.cancelledButScanned + advancedStats.fraudAlerts.bulkPurchases
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Vue d&apos;ensemble en temps reel</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Calendar className="text-orange-500" />}
            label="Evenements"
            value={stats.events.total}
            subtext={`${stats.events.published} publies`}
            trend={stats.events.upcoming}
            trendLabel="a venir"
          />
          <StatCard
            icon={<Users className="text-blue-500" />}
            label="Utilisateurs"
            value={stats.users.total}
            subtext={`${stats.users.organizers} organisateurs`}
            trend={stats.users.verified}
            trendLabel="verifies"
          />
          <StatCard
            icon={<Ticket className="text-green-500" />}
            label="Tickets vendus"
            value={stats.tickets.sold}
            subtext={`sur ${stats.tickets.total} disponibles`}
            trend={advancedStats?.salesByPeriod.ticketsToday || 0}
            trendLabel="aujourd'hui"
            trendUp
          />
          <StatCard
            icon={<DollarSign className="text-yellow-500" />}
            label="Revenus total"
            value={`${formatPrice(stats.bookings.revenue)} F`}
            subtext={`${stats.bookings.total} reservations`}
            trend={formatPrice(advancedStats?.salesByPeriod.today || 0)}
            trendLabel="F aujourd'hui"
            trendUp
          />
        </div>
      )}

      {advancedStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-purple-500" />
                <span className="text-gray-400 font-medium">Ventes par periode</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Aujourd&apos;hui</span>
                  <div className="text-right">
                    <span className="text-white font-bold">{formatPrice(advancedStats.salesByPeriod.today)} F</span>
                    <span className="text-gray-500 text-sm ml-2">({advancedStats.salesByPeriod.ticketsToday} tickets)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Cette semaine</span>
                  <div className="text-right">
                    <span className="text-white font-bold">{formatPrice(advancedStats.salesByPeriod.week)} F</span>
                    <span className="text-gray-500 text-sm ml-2">({advancedStats.salesByPeriod.ticketsWeek} tickets)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ce mois</span>
                  <div className="text-right">
                    <span className="text-white font-bold">{formatPrice(advancedStats.salesByPeriod.month)} F</span>
                    <span className="text-gray-500 text-sm ml-2">({advancedStats.salesByPeriod.ticketsMonth} tickets)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-green-500" />
                <span className="text-gray-400 font-medium">Taux de scan</span>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      className="text-gray-700"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${advancedStats.scanStats.rate * 3.52} 352`}
                      className="text-green-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{advancedStats.scanStats.rate}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="text-green-400 font-bold">{advancedStats.scanStats.checkedIn}</div>
                  <div className="text-gray-500">Scannes</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 font-bold">{advancedStats.scanStats.notCheckedIn}</div>
                  <div className="text-gray-500">En attente</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className={totalFraudAlerts > 0 ? 'text-red-500' : 'text-green-500'} />
                <span className="text-gray-400 font-medium">Alertes Fraude</span>
              </div>
              {totalFraudAlerts === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-green-400">
                  <CheckCircle size={48} className="mb-2" />
                  <span className="font-medium">Aucune alerte</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {advancedStats.fraudAlerts.duplicateScans > 0 && (
                    <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <span className="text-red-400 text-sm">Scans dupliques</span>
                      <span className="text-red-400 font-bold">{advancedStats.fraudAlerts.duplicateScans}</span>
                    </div>
                  )}
                  {advancedStats.fraudAlerts.cancelledButScanned > 0 && (
                    <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                      <span className="text-orange-400 text-sm">Annules mais scannes</span>
                      <span className="text-orange-400 font-bold">{advancedStats.fraudAlerts.cancelledButScanned}</span>
                    </div>
                  )}
                  {advancedStats.fraudAlerts.bulkPurchases > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <span className="text-yellow-400 text-sm">Achats en masse (+10)</span>
                      <span className="text-yellow-400 font-bold">{advancedStats.fraudAlerts.bulkPurchases}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-orange-500" />
                <span className="text-white font-bold">Top 5 Evenements</span>
              </div>
              <div className="space-y-3">
                {advancedStats.topEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun evenement avec des ventes</p>
                ) : (
                  advancedStats.topEvents.map((event, index) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                      <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <img
                        src={event.image_url || 'https://via.placeholder.com/40'}
                        alt={event.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{event.title}</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <MapPin size={12} />
                          {event.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-400 font-bold">{event.tickets_sold} tickets</p>
                        <p className="text-gray-400 text-sm">{formatPrice(event.total_revenue)} F</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-blue-500" />
                <span className="text-white font-bold">Top 5 Villes</span>
              </div>
              <div className="space-y-3">
                {advancedStats.topCities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune donnee disponible</p>
                ) : (
                  advancedStats.topCities.map((city, index) => (
                    <div key={city.city} className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-xl">
                      <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{city.city || 'Non specifie'}</p>
                        <p className="text-gray-400 text-sm">{city.events_count} evenements</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold">{city.bookings_count} ventes</p>
                        <p className="text-gray-400 text-sm">{formatPrice(city.revenue)} F</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-green-500" />
              <span className="text-white font-bold">Dernieres Reservations</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">Acheteur</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">Evenement</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">Type</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">Qte</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">Montant</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {advancedStats.recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Aucune reservation recente
                      </td>
                    </tr>
                  ) : (
                    advancedStats.recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-3 px-2">
                          <div>
                            <p className="text-white text-sm font-medium">{booking.buyer_name}</p>
                            <p className="text-gray-400 text-xs">{booking.buyer_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-300 text-sm max-w-[200px] truncate">
                          {booking.event_title}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {booking.ticket_type || 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-white text-sm">{booking.quantity}</td>
                        <td className="py-3 px-2 text-orange-400 font-medium text-sm">
                          {booking.total_amount === 0 ? 'GRATUIT' : `${formatPrice(booking.total_amount)} F`}
                        </td>
                        <td className="py-3 px-2 text-gray-400 text-sm">
                          {formatDate(booking.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  subtext, 
  trend, 
  trendLabel,
  trendUp 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtext: string;
  trend?: string | number;
  trendLabel?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-gray-700 rounded-xl">{icon}</div>
        <span className="text-gray-400">{label}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{subtext}</span>
        {trend !== undefined && (
          <span className={`text-xs flex items-center gap-1 ${trendUp ? 'text-green-400' : 'text-gray-400'}`}>
            {trendUp && <TrendingUp size={12} />}
            +{trend} {trendLabel}
          </span>
        )}
      </div>
    </div>
  );
}
