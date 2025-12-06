'use client';

import { useEffect, useState } from 'react';
import { 
  Shield, RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock,
  User, Globe, Monitor, Lock, Key, Eye, Activity, Filter,
  AlertOctagon, ShieldAlert, UserX, MapPin
} from 'lucide-react';

interface Stats {
  total_logs: string;
  success_count: string;
  failed_count: string;
  login_count: string;
  failed_logins: string;
  unique_users: string;
  unique_ips: string;
}

interface ActionStat {
  action: string;
  status: string;
  count: string;
}

interface FailedLogin {
  user_email: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  details: Record<string, unknown>;
}

interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface DailyActivity {
  date: string;
  total: string;
  success: string;
  failed: string;
}

interface SuspiciousIP {
  ip_address: string;
  attempts: string;
  failed_attempts: string;
  last_attempt: string;
}

interface PasswordResets {
  total_resets: string;
  last_24h: string;
}

interface OtpStats {
  total_otp: string;
  last_24h: string;
}

export default function AdminSecurityPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [actionStats, setActionStats] = useState<ActionStat[]>([]);
  const [recentFailedLogins, setRecentFailedLogins] = useState<FailedLogin[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousIP[]>([]);
  const [passwordResets, setPasswordResets] = useState<PasswordResets | null>(null);
  const [otpStats, setOtpStats] = useState<OtpStats | null>(null);
  const [period, setPeriod] = useState('week');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'alerts'>('overview');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ period, action: actionFilter, status: statusFilter });
      const res = await fetch(`/api/admin/security?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setActionStats(data.actionStats || []);
        setRecentFailedLogins(data.recentFailedLogins || []);
        setLogs(data.logs || []);
        setDailyActivity(data.dailyActivity || []);
        setSuspiciousActivity(data.suspiciousActivity || []);
        setPasswordResets(data.passwordResets);
        setOtpStats(data.otpStats);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, actionFilter, statusFilter]);

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
    if (status === 'success') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
          <CheckCircle size={12} /> Succes
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
        <XCircle size={12} /> Echec
      </span>
    );
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <User size={16} className="text-blue-400" />;
      case 'logout':
        return <UserX size={16} className="text-gray-400" />;
      case 'password_reset':
        return <Key size={16} className="text-yellow-400" />;
      case 'register':
        return <User size={16} className="text-green-400" />;
      case 'view':
        return <Eye size={16} className="text-purple-400" />;
      case 'create':
      case 'update':
      case 'delete':
        return <Activity size={16} className="text-orange-400" />;
      default:
        return <Activity size={16} className="text-gray-400" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'login': 'Connexion',
      'logout': 'Deconnexion',
      'password_reset': 'Reset mot de passe',
      'register': 'Inscription',
      'view': 'Consultation',
      'create': 'Creation',
      'update': 'Modification',
      'delete': 'Suppression'
    };
    return labels[action] || action;
  };

  const maxActivity = Math.max(...dailyActivity.map(d => parseInt(d.total) || 0), 1);

  const uniqueActions = Array.from(new Set(actionStats.map(a => a.action)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Securite & Audit</h1>
            <p className="text-gray-400">Journal des actions et surveillance</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Activity size={20} className="text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm">Actions totales</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats?.total_logs || 0}</p>
              <p className="text-gray-500 text-xs mt-1">{stats?.unique_users || 0} utilisateurs uniques</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <CheckCircle size={20} className="text-green-400" />
                </div>
                <span className="text-gray-400 text-sm">Connexions</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{stats?.login_count || 0}</p>
              <p className="text-gray-500 text-xs mt-1">{stats?.unique_ips || 0} IPs uniques</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <span className="text-gray-400 text-sm">Echecs connexion</span>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats?.failed_logins || 0}</p>
              <p className="text-gray-500 text-xs mt-1">{suspiciousActivity.length} IPs suspectes</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Key size={20} className="text-yellow-400" />
                </div>
                <span className="text-gray-400 text-sm">Resets mot de passe</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{passwordResets?.last_24h || 0}</p>
              <p className="text-gray-500 text-xs mt-1">{passwordResets?.total_resets || 0} total</p>
            </div>
          </div>

          {dailyActivity.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Activite des 30 derniers jours</h3>
              <div className="flex items-end gap-1 h-32">
                {dailyActivity.slice(0, 30).reverse().map((day, idx) => {
                  const successHeight = (parseInt(day.success) / maxActivity) * 100;
                  const failedHeight = (parseInt(day.failed) / maxActivity) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      <div className="w-full flex flex-col">
                        <div 
                          className="w-full bg-red-500 rounded-t"
                          style={{ height: `${Math.max(failedHeight, 0)}%` }}
                        />
                        <div 
                          className="w-full bg-gradient-to-t from-green-500 to-emerald-500"
                          style={{ height: `${Math.max(successHeight, 2)}%` }}
                        />
                      </div>
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                        {formatShortDate(day.date)}: {day.success} succes, {day.failed} echecs
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span>Succes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span>Echecs</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'overview' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Vue globale
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'logs' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Journal d&apos;audit
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === 'alerts' ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Alertes
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500"
                >
                  <option value="today">Aujourd&apos;hui</option>
                  <option value="week">Cette semaine</option>
                  <option value="month">Ce mois</option>
                  <option value="all">Tout</option>
                </select>
                {activeTab === 'logs' && (
                  <>
                    <select
                      value={actionFilter}
                      onChange={(e) => setActionFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="all">Toutes les actions</option>
                      {uniqueActions.map(action => (
                        <option key={action} value={action}>{getActionLabel(action)}</option>
                      ))}
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="success">Succes</option>
                      <option value="failed">Echecs</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-blue-400" />
                  Repartition des actions
                </h3>
                {actionStats.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Aucune donnee disponible</p>
                ) : (
                  <div className="space-y-3">
                    {uniqueActions.slice(0, 8).map(action => {
                      const successCount = actionStats.find(a => a.action === action && a.status === 'success')?.count || '0';
                      const failedCount = actionStats.find(a => a.action === action && a.status === 'failed')?.count || '0';
                      const total = parseInt(successCount) + parseInt(failedCount);
                      return (
                        <div key={action} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getActionIcon(action)}
                            <span className="text-white">{getActionLabel(action)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400 text-sm">{successCount}</span>
                            {parseInt(failedCount) > 0 && (
                              <span className="text-red-400 text-sm">/ {failedCount}</span>
                            )}
                            <span className="text-gray-500 text-xs">({total})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Lock size={20} className="text-yellow-400" />
                  Securite du compte
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Key size={18} className="text-yellow-400" />
                      <span className="text-white">Reset mot de passe (24h)</span>
                    </div>
                    <span className="text-yellow-400 font-bold">{passwordResets?.last_24h || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-blue-400" />
                      <span className="text-white">Codes OTP (24h)</span>
                    </div>
                    <span className="text-blue-400 font-bold">{otpStats?.last_24h || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertTriangle size={18} className="text-red-400" />
                      <span className="text-white">Echecs connexion</span>
                    </div>
                    <span className="text-red-400 font-bold">{stats?.failed_logins || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-purple-400" />
                      <span className="text-white">IPs suspectes</span>
                    </div>
                    <span className="text-purple-400 font-bold">{suspiciousActivity.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-700/50">
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Date</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Utilisateur</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Action</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Resource</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">IP</th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          <Shield size={48} className="mx-auto mb-3 text-gray-600" />
                          <p>Aucun log d&apos;audit trouve</p>
                          <p className="text-sm text-gray-500 mt-1">Les actions seront enregistrees ici</p>
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                          <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(log.created_at)}</td>
                          <td className="py-4 px-4">
                            <p className="text-white">{log.user_email || 'Anonyme'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <span className="text-white">{getActionLabel(log.action)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400">{log.resource || '-'}</span>
                            {log.resource_id && (
                              <span className="text-gray-500 text-xs ml-1">#{log.resource_id.slice(0, 8)}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-400 font-mono text-sm">{log.ip_address || '-'}</span>
                          </td>
                          <td className="py-4 px-4">{getStatusBadge(log.status)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {suspiciousActivity.length > 0 && (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                    <ShieldAlert size={20} className="text-red-400" />
                    <h3 className="text-lg font-bold text-white">IPs suspectes</h3>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full ml-2">
                      {suspiciousActivity.length} detectees
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-700/50">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Adresse IP</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Tentatives</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Echecs</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Derniere tentative</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suspiciousActivity.map((ip, idx) => (
                          <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-red-400" />
                                <span className="text-white font-mono">{ip.ip_address}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-white">{ip.attempts}</td>
                            <td className="py-3 px-4">
                              <span className="text-red-400 font-bold">{ip.failed_attempts}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(ip.last_attempt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {recentFailedLogins.length > 0 && (
                <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                    <AlertOctagon size={20} className="text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Echecs de connexion recents</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700 bg-gray-700/50">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Email</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">IP</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Navigateur</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentFailedLogins.map((login, idx) => (
                          <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                            <td className="py-3 px-4 text-white">{login.user_email || 'Inconnu'}</td>
                            <td className="py-3 px-4 text-gray-400 font-mono text-sm">{login.ip_address || '-'}</td>
                            <td className="py-3 px-4 text-gray-400 text-sm truncate max-w-xs">
                              {login.user_agent ? login.user_agent.slice(0, 50) + '...' : '-'}
                            </td>
                            <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(login.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {suspiciousActivity.length === 0 && recentFailedLogins.length === 0 && (
                <div className="bg-gray-800 rounded-2xl p-12 border border-gray-700 text-center">
                  <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-white mb-2">Aucune alerte</h2>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Tout semble normal. Aucune activite suspecte n&apos;a ete detectee pour la periode selectionnee.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
