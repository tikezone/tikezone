'use client';

import { useEffect, useState } from 'react';
import { 
  Bell, RefreshCw, Send, Users, UserCheck, User, 
  CheckCircle, Clock, Mail, MessageSquare, AlertTriangle,
  Filter, Eye, EyeOff
} from 'lucide-react';

interface Stats {
  total: string;
  read_count: string;
  unread_count: string;
  type_count: string;
}

interface TypeStat {
  type: string;
  count: string;
}

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_email: string;
  user_name: string;
}

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'info',
    target: 'all'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, type: typeFilter });
      const res = await fetch(`/api/admin/notifications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setTypeStats(data.typeStats || []);
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, typeFilter]);

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      setMessage({ type: 'error', text: 'Veuillez remplir le titre et le message' });
      return;
    }

    setSending(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setFormData({ title: '', body: '', type: 'info', target: 'all' });
        setShowForm(false);
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setSending(false);
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

  const getTypeBadge = (type: string) => {
    const styles: Record<string, { bg: string; text: string; icon: typeof Bell }> = {
      info: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Bell },
      success: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
      warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: AlertTriangle },
      error: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle },
      promo: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: MessageSquare },
      system: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Mail }
    };
    const style = styles[type] || styles.info;
    const Icon = style.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 ${style.bg} ${style.text} rounded-full text-xs`}>
        <Icon size={12} /> {type}
      </span>
    );
  };

  const getTargetLabel = (target: string) => {
    switch (target) {
      case 'all': return 'Tous les utilisateurs';
      case 'organizers': return 'Organisateurs uniquement';
      case 'customers': return 'Clients uniquement';
      default: return target;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl">
            <Bell size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Communication & Notifications</h1>
            <p className="text-gray-400">Envoyez des notifications aux utilisateurs</p>
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
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-xl text-white transition-colors"
          >
            <Send size={18} />
            Nouvelle notification
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Envoyer une notification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la notification"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Message</label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Contenu du message..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="info">Information</option>
                  <option value="success">Succes</option>
                  <option value="warning">Avertissement</option>
                  <option value="promo">Promotion</option>
                  <option value="system">Systeme</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Destinataires</label>
                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="all">Tous les utilisateurs</option>
                  <option value="organizers">Organisateurs</option>
                  <option value="customers">Clients</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 rounded-xl text-white transition-colors disabled:opacity-50"
              >
                {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
                {sending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-pink-500/20 rounded-xl">
                  <Bell size={20} className="text-pink-400" />
                </div>
                <span className="text-gray-400 text-sm">Total</span>
              </div>
              <p className="text-2xl font-bold text-pink-400">{stats?.total || 0}</p>
              <p className="text-gray-500 text-xs mt-1">notifications envoyees</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Eye size={20} className="text-green-400" />
                </div>
                <span className="text-gray-400 text-sm">Lues</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{stats?.read_count || 0}</p>
              <p className="text-gray-500 text-xs mt-1">ouvertes</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <EyeOff size={20} className="text-yellow-400" />
                </div>
                <span className="text-gray-400 text-sm">Non lues</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{stats?.unread_count || 0}</p>
              <p className="text-gray-500 text-xs mt-1">en attente</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <MessageSquare size={20} className="text-purple-400" />
                </div>
                <span className="text-gray-400 text-sm">Types</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{stats?.type_count || 0}</p>
              <p className="text-gray-500 text-xs mt-1">categories</p>
            </div>
          </div>

          {typeStats.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Repartition par type</h3>
              <div className="flex flex-wrap gap-3">
                {typeStats.map((ts) => (
                  <div key={ts.type} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-xl">
                    {getTypeBadge(ts.type)}
                    <span className="text-white font-medium">{ts.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <span className="text-gray-400">Filtres:</span>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="read">Lues</option>
                  <option value="unread">Non lues</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="info">Information</option>
                  <option value="success">Succes</option>
                  <option value="warning">Avertissement</option>
                  <option value="promo">Promotion</option>
                  <option value="system">Systeme</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-700/50">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Destinataire</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Titre</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Message</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Type</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Statut</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <Bell size={48} className="mx-auto mb-3 text-gray-600" />
                        <p>Aucune notification trouvee</p>
                      </td>
                    </tr>
                  ) : (
                    notifications.map((notif) => (
                      <tr key={notif.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                              {(notif.user_name || notif.user_email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm">{notif.user_name || 'Utilisateur'}</p>
                              <p className="text-gray-400 text-xs">{notif.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-white font-medium">{notif.title}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-300 text-sm max-w-xs truncate">{notif.body}</p>
                        </td>
                        <td className="py-4 px-4">{getTypeBadge(notif.type)}</td>
                        <td className="py-4 px-4">
                          {notif.is_read ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                              <CheckCircle size={12} /> Lu
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              <Clock size={12} /> Non lu
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(notif.created_at)}</td>
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
