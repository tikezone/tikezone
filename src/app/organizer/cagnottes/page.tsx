'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import {
  Coins,
  PlusCircle,
  Eye,
  Trash2,
  Target,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import DeleteConfirmationModal from '../../../components/UI/DeleteConfirmationModal';

interface Cagnotte {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  contributor_count: number;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending_validation: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <Clock size={14} /> },
  online: { label: 'En ligne', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <CheckCircle size={14} /> },
  rejected: { label: 'Refusee', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle size={14} /> },
  pending_documents: { label: 'Documents requis', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <AlertCircle size={14} /> },
  pending_payout: { label: 'En attente versement', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <TrendingUp size={14} /> },
  completed: { label: 'Terminee', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: <CheckCircle size={14} /> },
};

export default function OrganizerCagnottesPage() {
  const [cagnottes, setCagnottes] = useState<Cagnotte[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadCagnottes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cagnottes?organizer_id=me', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setCagnottes(data.cagnottes || []);
      }
    } catch (e) {
      console.error('Error loading cagnottes:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCagnottes();
  }, [loadCagnottes]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/cagnottes/${deleteId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setCagnottes(cagnottes.filter(c => c.id !== deleteId));
      }
    } catch (e) {
      console.error('Error deleting cagnotte:', e);
    }
    setDeleteId(null);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price) + ' F';

  const getProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  return (
    <OrganizerLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white flex items-center gap-3">
              <Coins className="text-yellow-400" size={32} />
              Mes Cagnottes
            </h1>
            <p className="text-gray-400 font-bold text-sm mt-1">
              Gerez vos collectes de fonds
            </p>
          </div>
          <Link
            href="/organizer/cagnottes/create"
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-3 px-6 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <PlusCircle size={20} />
            Nouvelle Cagnotte
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
                <div className="h-2 bg-white/10 rounded-full w-full mb-4"></div>
                <div className="h-10 bg-white/10 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : cagnottes.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10 border-dashed">
            <Coins size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-black text-white mb-2">Aucune cagnotte</h3>
            <p className="text-gray-400 font-bold mb-6">Commencez par creer votre premiere cagnotte</p>
            <Link
              href="/organizer/cagnottes/create"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all"
            >
              <PlusCircle size={18} />
              Creer une cagnotte
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cagnottes.map((cagnotte) => {
              const status = statusConfig[cagnotte.status] || statusConfig.pending_validation;
              const progress = getProgress(cagnotte.current_amount, cagnotte.goal_amount);

              return (
                <div
                  key={cagnotte.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-yellow-500/30 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-white group-hover:text-yellow-400 transition-colors">
                          {cagnotte.title}
                        </h3>
                        <p className="text-sm text-gray-400 font-bold mt-1 line-clamp-2">
                          {cagnotte.description || 'Pas de description'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-400">Progression</span>
                        <span className="text-sm font-black text-yellow-400">{progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-lg font-black text-white">{formatPrice(cagnotte.current_amount)}</span>
                        <span className="text-sm font-bold text-gray-400">sur {formatPrice(cagnotte.goal_amount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 font-bold mb-4">
                      <div className="flex items-center gap-1.5">
                        <Users size={14} />
                        {cagnotte.contributor_count || 0} contributeurs
                      </div>
                      {cagnotte.end_date && (
                        <div className="flex items-center gap-1.5">
                          <Target size={14} />
                          Fin: {new Date(cagnotte.end_date).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/cagnotte/${cagnotte.id}`}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                      >
                        <Eye size={16} />
                        Voir
                      </Link>
                      <button
                        onClick={() => setDeleteId(cagnotte.id)}
                        disabled={cagnotte.current_amount > 0}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        eventName={cagnottes.find(c => c.id === deleteId)?.title || 'cette cagnotte'}
      />
    </OrganizerLayout>
  );
}
