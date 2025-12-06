'use client';

import { useEffect, useState } from 'react';
import { 
  Settings, RefreshCw, Save, Palette, CreditCard, Calendar, Shield,
  Phone, Mail, Percent, Clock, Users, TicketCheck, CheckCircle, AlertCircle
} from 'lucide-react';

interface SettingValue {
  value: string;
  type: string;
  category: string;
  description: string;
  updated_at?: string;
}

interface Stats {
  users: { total_users: string; organizers: string; admins: string };
  events: { total_events: string; published_events: string };
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, SettingValue>>({});
  const [stats, setStats] = useState<Stats | null>(null);
  const [editedSettings, setEditedSettings] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [activeTab, setActiveTab] = useState<'branding' | 'payments' | 'events' | 'security' | 'policies' | 'contact'>('branding');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || {});
        setStats(data.stats);
        const initial: Record<string, string> = {};
        for (const [key, val] of Object.entries(data.settings || {})) {
          initial[key] = (val as SettingValue).value;
        }
        setEditedSettings(initial);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: editedSettings })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await fetchData();
      } else {
        const data = await res.json();
        setSaveError(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveError('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setEditedSettings(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = () => {
    for (const [key, val] of Object.entries(settings)) {
      if (editedSettings[key] !== val.value) return true;
    }
    return false;
  };

  const renderSettingInput = (key: string, setting: SettingValue) => {
    const value = editedSettings[key] ?? setting.value;

    if (setting.type === 'boolean') {
      return (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => updateSetting(key, e.target.checked ? 'true' : 'false')}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      );
    }

    if (setting.type === 'color') {
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value}
            onChange={(e) => updateSetting(key, e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => updateSetting(key, e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white w-32 focus:outline-none focus:border-blue-500"
          />
        </div>
      );
    }

    if (setting.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => updateSetting(key, e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white w-32 focus:outline-none focus:border-blue-500"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => updateSetting(key, e.target.value)}
        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white w-full max-w-md focus:outline-none focus:border-blue-500"
      />
    );
  };

  const getSettingsByCategory = (category: string) => {
    return Object.entries(settings).filter(([, val]) => val.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'branding': return <Palette size={20} className="text-pink-400" />;
      case 'payments': return <CreditCard size={20} className="text-green-400" />;
      case 'events': return <Calendar size={20} className="text-blue-400" />;
      case 'security': return <Shield size={20} className="text-red-400" />;
      case 'policies': return <Percent size={20} className="text-yellow-400" />;
      case 'contact': return <Phone size={20} className="text-purple-400" />;
      default: return <Settings size={20} className="text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      branding: 'Branding',
      payments: 'Paiements',
      events: 'Evenements',
      security: 'Securite',
      policies: 'Politiques',
      contact: 'Contact'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl">
            <Settings size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Parametres Generaux</h1>
            <p className="text-gray-400">Configuration de la plateforme</p>
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
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-colors ${
              hasChanges() 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                : 'bg-gray-700 cursor-not-allowed'
            }`}
          >
            <Save size={18} className={saving ? 'animate-pulse' : ''} />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400">
          <CheckCircle size={20} />
          <span>Parametres sauvegardes avec succes!</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
          <AlertCircle size={20} />
          <span>{saveError}</span>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Users size={20} className="text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm">Utilisateurs</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{stats?.users.total_users || 0}</p>
              <p className="text-gray-500 text-xs mt-1">{stats?.users.organizers || 0} organisateurs</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Calendar size={20} className="text-purple-400" />
                </div>
                <span className="text-gray-400 text-sm">Evenements</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{stats?.events.total_events || 0}</p>
              <p className="text-gray-500 text-xs mt-1">{stats?.events.published_events || 0} publies</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <TicketCheck size={20} className="text-green-400" />
                </div>
                <span className="text-gray-400 text-sm">Commission</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{editedSettings.commission_rate || 5}%</p>
              <p className="text-gray-500 text-xs mt-1">Sur chaque vente</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Clock size={20} className="text-yellow-400" />
                </div>
                <span className="text-gray-400 text-sm">Session</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{editedSettings.session_duration_hours || 24}h</p>
              <p className="text-gray-500 text-xs mt-1">Duree de session</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex gap-2 flex-wrap">
              {['branding', 'payments', 'events', 'security', 'policies', 'contact'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === tab ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {getCategoryIcon(tab)}
                  {getCategoryLabel(tab)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex items-center gap-3">
              {getCategoryIcon(activeTab)}
              <h3 className="text-lg font-bold text-white">{getCategoryLabel(activeTab)}</h3>
            </div>
            <div className="p-6 space-y-6">
              {getSettingsByCategory(activeTab).length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aucun parametre dans cette categorie</p>
              ) : (
                getSettingsByCategory(activeTab).map(([key, setting]) => (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-gray-700/50 last:border-0">
                    <div className="flex-1">
                      <p className="text-white font-medium">{setting.description}</p>
                      <p className="text-gray-500 text-sm">{key}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {renderSettingInput(key, setting)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
