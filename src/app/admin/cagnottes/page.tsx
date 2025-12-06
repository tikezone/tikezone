'use client';

import { useEffect, useState } from 'react';
import {
  Coins, RefreshCw, CheckCircle, XCircle, Clock, FileText,
  User, Calendar, Target, Users, TrendingUp, AlertTriangle,
  Eye, Send, Ban, Loader2, Wallet
} from 'lucide-react';

interface Cagnotte {
  id: string;
  title: string;
  description: string;
  reason: string;
  goal_amount: number;
  current_amount: number;
  min_contribution: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
  organizer_first_name: string;
  organizer_last_name: string;
  organizer_email: string;
  organizer_phone: string;
  organizer_created_at: string;
  contributor_count: number;
  total_collected: number;
  organizer_event_count: number;
  organizer_cagnotte_count: number;
  organizer_completed_cagnottes: number;
  organizer_rejected_cagnottes: number;
  organizer_total_raised: number;
  admin_notes: string;
  rejection_reason: string;
}

function calculateTrustScore(cagnotte: Cagnotte): { score: number; level: string; color: string } {
  let score = 0;
  
  const eventCount = parseInt(String(cagnotte.organizer_event_count)) || 0;
  if (eventCount >= 5) score += 25;
  else if (eventCount >= 2) score += 15;
  else if (eventCount >= 1) score += 5;
  
  const completedCagnottes = parseInt(String(cagnotte.organizer_completed_cagnottes)) || 0;
  if (completedCagnottes >= 3) score += 30;
  else if (completedCagnottes >= 1) score += 15;
  
  const rejectedCagnottes = parseInt(String(cagnotte.organizer_rejected_cagnottes)) || 0;
  score -= rejectedCagnottes * 10;
  
  const totalRaised = parseFloat(String(cagnotte.organizer_total_raised)) || 0;
  if (totalRaised >= 1000000) score += 20;
  else if (totalRaised >= 500000) score += 15;
  else if (totalRaised >= 100000) score += 10;
  
  if (cagnotte.organizer_created_at) {
    const accountAge = (Date.now() - new Date(cagnotte.organizer_created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge >= 365) score += 15;
    else if (accountAge >= 90) score += 10;
    else if (accountAge >= 30) score += 5;
  }
  
  score = Math.max(0, Math.min(100, score));
  
  let level: string;
  let color: string;
  if (score >= 70) {
    level = 'Excellent';
    color = 'text-green-400 bg-green-500/20 border-green-500/30';
  } else if (score >= 50) {
    level = 'Bon';
    color = 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  } else if (score >= 30) {
    level = 'Moyen';
    color = 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
  } else {
    level = 'Nouveau';
    color = 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
  
  return { score, level, color };
}

interface Stats {
  pending_validation: string;
  online: string;
  pending_payout: string;
  pending_documents: string;
  rejected: string;
  completed: string;
  total_collected: string;
  total_cagnottes: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_validation: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Clock size={14} /> },
  online: { label: 'En ligne', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle size={14} /> },
  rejected: { label: 'Refusee', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle size={14} /> },
  pending_documents: { label: 'Documents requis', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <FileText size={14} /> },
  pending_payout: { label: 'Versement en attente', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Wallet size={14} /> },
  completed: { label: 'Terminee', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <CheckCircle size={14} /> },
};

const reasonLabels: Record<string, string> = {
  medical: 'Frais medicaux',
  education: 'Education',
  funeral: 'Funerailles',
  emergency: 'Urgence',
  project: 'Projet personnel',
  community: 'Communautaire',
  celebration: 'Celebration',
  other: 'Autre',
};

const paymentMethods = [
  { value: 'wave', label: 'Wave' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'mtn_money', label: 'MTN Mobile Money' },
  { value: 'bank_transfer', label: 'Virement bancaire' },
  { value: 'cash', label: 'Especes' },
];

function PayoutForm({ cagnotte, onSuccess, formatPrice }: { 
  cagnotte: Cagnotte; 
  onSuccess: () => void; 
  formatPrice: (value: string | number) => string;
}) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('wave');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptData, setReceiptData] = useState<{ number: string; pdf: string; filename: string } | null>(null);

  const handlePayout = async () => {
    if (!paymentMethod) {
      alert('Veuillez selectionner une methode de paiement');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/cagnottes/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cagnotte_id: cagnotte.id,
          payment_method: paymentMethod,
          payment_reference: paymentReference,
          notes
        })
      });

      const data = await res.json();

      if (res.ok) {
        setReceiptData(data.receipt);
      } else {
        alert(data.error || 'Erreur lors du versement');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors du versement');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!receiptData) return;
    
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${receiptData.pdf}`;
    link.download = receiptData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (receiptData) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
          <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
          <h3 className="text-xl font-bold text-green-400 mb-2">Versement effectue !</h3>
          <p className="text-gray-300 mb-1">Montant: {formatPrice(cagnotte.current_amount)} F</p>
          <p className="text-sm text-gray-400">Recu N° {receiptData.number}</p>
        </div>
        <button
          onClick={downloadReceipt}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
        >
          <FileText size={18} />
          Telecharger le recu PDF
        </button>
        <button
          onClick={onSuccess}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
        >
          Fermer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-blue-400 font-medium">Versement en attente</p>
        <p className="text-2xl font-bold text-white mt-1">{formatPrice(cagnotte.current_amount)} F</p>
        <p className="text-sm text-blue-300/70 mt-1">{cagnotte.contributor_count} contributeurs</p>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase block mb-2">Methode de paiement *</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
        >
          {paymentMethods.map(method => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase block mb-2">Reference de paiement</label>
        <input
          type="text"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Ex: WAVE-123456789"
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="text-xs text-gray-400 uppercase block mb-2">Notes (optionnel)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes sur le versement..."
          rows={2}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      <button
        onClick={handlePayout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        Effectuer le versement
      </button>
    </div>
  );
}

export default function AdminCagnottesPage() {
  const [cagnottes, setCagnottes] = useState<Cagnotte[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCagnotte, setSelectedCagnotte] = useState<Cagnotte | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      const res = await fetch(`/api/admin/cagnottes?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCagnottes(data.cagnottes || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching cagnottes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleAction = async (action: string) => {
    if (!selectedCagnotte) return;
    
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Veuillez indiquer la raison du refus');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/cagnottes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: selectedCagnotte.id,
          action,
          admin_notes: actionNotes,
          rejection_reason: rejectionReason,
        }),
      });

      if (res.ok) {
        setSelectedCagnotte(null);
        setActionNotes('');
        setRejectionReason('');
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Coins className="text-yellow-400" />
            Gestion des Cagnottes
          </h1>
          <p className="text-gray-400 text-sm">Validez, refusez et gerez les cagnottes</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Clock size={16} />
              <span className="text-xs font-medium">En attente</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending_validation}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <CheckCircle size={16} />
              <span className="text-xs font-medium">En ligne</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.online}</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Wallet size={16} />
              <span className="text-xs font-medium">Versement</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending_payout}</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <FileText size={16} />
              <span className="text-xs font-medium">Docs requis</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending_documents}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <XCircle size={16} />
              <span className="text-xs font-medium">Refusees</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.rejected}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <TrendingUp size={16} />
              <span className="text-xs font-medium">Total collecte</span>
            </div>
            <p className="text-xl font-bold text-white">{formatPrice(stats.total_collected)} F</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'Toutes' },
          { value: 'pending_validation', label: 'En attente' },
          { value: 'online', label: 'En ligne' },
          { value: 'pending_payout', label: 'Versement' },
          { value: 'pending_documents', label: 'Documents' },
          { value: 'rejected', label: 'Refusees' },
          { value: 'completed', label: 'Terminees' },
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              statusFilter === filter.value
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : cagnottes.length === 0 ? (
          <div className="p-8 text-center">
            <Coins size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Aucune cagnotte trouvee</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Cagnotte</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Organisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Objectif</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Collecte</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cagnottes.map((cagnotte) => {
                  const status = statusConfig[cagnotte.status] || statusConfig.pending_validation;
                  const progress = getProgress(cagnotte.current_amount, cagnotte.goal_amount);
                  return (
                    <tr key={cagnotte.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-white">{cagnotte.title}</p>
                          <p className="text-xs text-gray-400">
                            {reasonLabels[cagnotte.reason] || cagnotte.reason} | {formatDate(cagnotte.created_at)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white text-sm">{cagnotte.organizer_first_name} {cagnotte.organizer_last_name}</p>
                          <p className="text-xs text-gray-400">{cagnotte.organizer_email}</p>
                          <p className="text-xs text-gray-500">{cagnotte.organizer_event_count} events | {cagnotte.organizer_cagnotte_count} cagnottes</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-white font-medium">{formatPrice(cagnotte.goal_amount)} F</p>
                        <p className="text-xs text-gray-400">Min: {formatPrice(cagnotte.min_contribution)} F</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-yellow-400 font-medium">{formatPrice(cagnotte.current_amount)} F</span>
                            <span className="text-gray-400">{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{cagnotte.contributor_count} contributeurs</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedCagnotte(cagnotte)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                        >
                          <Eye size={14} />
                          Gerer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCagnotte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCagnotte.title}</h2>
                  <p className="text-sm text-gray-400">{reasonLabels[selectedCagnotte.reason] || selectedCagnotte.reason}</p>
                </div>
                <button
                  onClick={() => setSelectedCagnotte(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">Organisateur</p>
                  <p className="text-white font-medium">{selectedCagnotte.organizer_first_name} {selectedCagnotte.organizer_last_name}</p>
                  <p className="text-sm text-gray-400">{selectedCagnotte.organizer_email}</p>
                  <p className="text-sm text-gray-400">{selectedCagnotte.organizer_phone}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>{selectedCagnotte.organizer_event_count} evenements</span>
                    <span>{selectedCagnotte.organizer_cagnotte_count} cagnottes</span>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">Collecte</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatPrice(selectedCagnotte.current_amount)} F</p>
                  <p className="text-sm text-gray-400">sur {formatPrice(selectedCagnotte.goal_amount)} F ({getProgress(selectedCagnotte.current_amount, selectedCagnotte.goal_amount)}%)</p>
                  <p className="text-xs text-gray-500 mt-1">{selectedCagnotte.contributor_count} contributeurs</p>
                </div>
              </div>

              {(() => {
                const trust = calculateTrustScore(selectedCagnotte);
                return (
                  <div className={`rounded-xl p-4 border ${trust.color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase mb-1 opacity-70">Score de confiance</p>
                        <p className="text-2xl font-bold">{trust.score}/100</p>
                        <p className="text-sm font-medium">{trust.level}</p>
                      </div>
                      <div className="text-right text-xs opacity-70 space-y-1">
                        <p>{selectedCagnotte.organizer_event_count} evenements crees</p>
                        <p>{selectedCagnotte.organizer_completed_cagnottes || 0} cagnottes reussies</p>
                        <p>{selectedCagnotte.organizer_rejected_cagnottes || 0} refusees</p>
                        <p>{formatPrice(selectedCagnotte.organizer_total_raised || 0)} F collectes</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div>
                <p className="text-xs text-gray-400 uppercase mb-2">Description</p>
                <p className="text-gray-300 text-sm">{selectedCagnotte.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Date debut</p>
                  <p className="text-white">{formatDate(selectedCagnotte.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase mb-1">Date fin</p>
                  <p className="text-white">{formatDate(selectedCagnotte.end_date)}</p>
                </div>
              </div>

              {selectedCagnotte.status === 'pending_validation' && (
                <>
                  <div>
                    <label className="text-xs text-gray-400 uppercase block mb-2">Notes admin (optionnel)</label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder="Notes internes..."
                      rows={2}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction('validate')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      Valider
                    </button>
                    <button
                      onClick={() => handleAction('request_documents')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                      Docs
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 uppercase block mb-2">Raison du refus</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez pourquoi la cagnotte est refusee..."
                      rows={2}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => handleAction('reject')}
                      disabled={actionLoading}
                      className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                      Refuser
                    </button>
                  </div>
                </>
              )}

              {selectedCagnotte.status === 'online' && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <p className="text-green-400 font-medium">Cette cagnotte est en ligne et accepte les contributions.</p>
                </div>
              )}

              {selectedCagnotte.status === 'pending_payout' && (
                <PayoutForm 
                  cagnotte={selectedCagnotte} 
                  onSuccess={() => {
                    setSelectedCagnotte(null);
                    fetchData();
                  }}
                  formatPrice={formatPrice}
                />
              )}

              {selectedCagnotte.status === 'rejected' && selectedCagnotte.rejection_reason && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-xs text-red-400 uppercase mb-1">Raison du refus</p>
                  <p className="text-red-300">{selectedCagnotte.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
