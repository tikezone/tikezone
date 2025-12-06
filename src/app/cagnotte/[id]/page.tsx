'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Coins,
  Heart,
  Target,
  Users,
  Calendar,
  Share2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Gift,
  User,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  Smartphone,
} from 'lucide-react';

interface Cagnotte {
  id: string;
  title: string;
  description: string;
  reason: string;
  goal_amount: number;
  current_amount: number;
  min_contribution: number;
  suggested_contribution: number;
  start_date: string;
  end_date: string;
  rules: string;
  image_url: string;
  status: string;
  organizer_first_name: string;
  organizer_last_name: string;
  contributor_count: number;
  total_collected: number;
}

interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  message: string;
  is_anonymous: boolean;
  created_at: string;
}

const reasonLabels: Record<string, string> = {
  medical: 'Frais medicaux',
  education: 'Education / Scolarite',
  funeral: 'Frais funeraires',
  emergency: 'Urgence / Sinistre',
  project: 'Projet personnel',
  community: 'Projet communautaire',
  celebration: 'Celebration / Evenement',
  other: 'Autre',
};

export default function CagnottePublicPage() {
  const params = useParams();
  const id = params?.id as string;

  const [cagnotte, setCagnotte] = useState<Cagnotte | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    contributor_name: '',
    email: '',
    phone: '',
    amount: '',
    message: '',
    is_anonymous: false,
    payment_method: 'wave',
  });

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [cagnotteRes, contribRes] = await Promise.all([
          fetch(`/api/cagnottes/${id}`),
          fetch(`/api/cagnottes/${id}/contribute`),
        ]);

        if (cagnotteRes.ok) {
          const data = await cagnotteRes.json();
          setCagnotte(data.cagnotte);
        } else {
          setError('Cagnotte non trouvee');
        }

        if (contribRes.ok) {
          const data = await contribRes.json();
          setContributions(data.contributions || []);
        }
      } catch (e) {
        console.error('Error loading cagnotte:', e);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cagnotte) return;

    const amount = parseInt(formData.amount.replace(/\D/g, ''));
    if (!amount || amount < cagnotte.min_contribution) {
      alert(`Le montant minimum est de ${formatPrice(cagnotte.min_contribution)}`);
      return;
    }

    if (!formData.contributor_name.trim()) {
      alert('Veuillez entrer votre nom');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/cagnottes/${id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributor_name: formData.contributor_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          amount,
          message: formData.message.trim(),
          is_anonymous: formData.is_anonymous,
          payment_method: formData.payment_method,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setShowForm(false);
        setFormData({
          contributor_name: '',
          email: '',
          phone: '',
          amount: '',
          message: '',
          is_anonymous: false,
          payment_method: 'wave',
        });
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la contribution');
      }
    } catch (e) {
      console.error('Error contributing:', e);
      alert('Erreur lors de la contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price) + ' F';

  const getProgress = (current: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: cagnotte?.title,
          text: `Soutenez cette cagnotte: ${cagnotte?.title}`,
          url,
        });
      } catch (e) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copie!');
    }
  };

  const setSuggestedAmount = (amount: number) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          <p className="font-bold text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error || !cagnotte) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Coins size={64} className="mx-auto text-gray-600 mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Cagnotte introuvable</h1>
          <p className="text-gray-400 font-bold mb-6">{error || 'Cette cagnotte n\'existe pas'}</p>
          <Link href="/" className="inline-flex items-center gap-2 text-yellow-400 font-bold hover:underline">
            <ArrowLeft size={18} />
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (cagnotte.status !== 'online') {
    const statusMessages: Record<string, { title: string; message: string; icon: string; color: string }> = {
      pending_validation: {
        title: 'Cagnotte en cours de verification',
        message: 'Cette cagnotte est en attente de validation par notre equipe. Les contributions seront ouvertes une fois validee.',
        icon: '🔍',
        color: 'text-blue-400',
      },
      pending_documents: {
        title: 'Documents en attente',
        message: 'L\'organisateur doit fournir des documents supplementaires. Les contributions seront ouvertes une fois la verification terminee.',
        icon: '📄',
        color: 'text-orange-400',
      },
      rejected: {
        title: 'Cagnotte refusee',
        message: 'Cette cagnotte n\'a pas ete validee par notre equipe.',
        icon: '❌',
        color: 'text-red-400',
      },
      pending_payout: {
        title: 'Collecte terminee',
        message: 'La collecte est terminee. Le versement est en cours de traitement.',
        icon: '💰',
        color: 'text-green-400',
      },
      completed: {
        title: 'Cagnotte terminee',
        message: 'Cette cagnotte a atteint son objectif et est maintenant terminee. Merci a tous les contributeurs!',
        icon: '✅',
        color: 'text-green-400',
      },
    };
    
    const statusInfo = statusMessages[cagnotte.status] || {
      title: 'Cagnotte non disponible',
      message: 'Cette cagnotte n\'est pas accessible pour le moment.',
      icon: '⏳',
      color: 'text-gray-400',
    };

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h1 className={`text-2xl font-black text-white mb-2`}>{statusInfo.title}</h1>
          <p className="text-gray-400 font-bold mb-4">{cagnotte.title}</p>
          <div className={`bg-white/5 rounded-2xl border border-white/10 p-4 mb-6`}>
            <p className={`${statusInfo.color} font-bold`}>{statusInfo.message}</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 text-yellow-400 font-bold hover:underline">
            <ArrowLeft size={18} />
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const progress = getProgress(cagnotte.current_amount, cagnotte.goal_amount);
  const daysLeft = Math.max(0, Math.ceil((new Date(cagnotte.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-bold transition-colors">
            <ArrowLeft size={18} />
            Retour
          </Link>
        </div>

        {success && (
          <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="text-yellow-400" size={24} />
            <div>
              <p className="font-black text-yellow-400">Contribution enregistree!</p>
              <p className="text-sm text-yellow-300/80 font-bold">Votre contribution est en attente de confirmation du paiement. Vous recevrez une notification une fois validee.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {cagnotte.image_url && (
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img 
                  src={cagnotte.image_url} 
                  alt={cagnotte.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-black rounded-full mb-2">
                    {reasonLabels[cagnotte.reason] || cagnotte.reason}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{cagnotte.title}</h1>
                  <p className="text-gray-400 font-bold mt-1">
                    par {cagnotte.organizer_first_name} {cagnotte.organizer_last_name}
                  </p>
                </div>
                <button
                  onClick={handleShare}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <p className="text-gray-300 font-medium whitespace-pre-wrap">{cagnotte.description}</p>

              {cagnotte.rules && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="font-black text-white mb-2">Regles de la cagnotte</h3>
                  <p className="text-gray-400 font-medium text-sm">{cagnotte.rules}</p>
                </div>
              )}
            </div>

            {contributions.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Heart className="text-red-400" size={20} />
                  Derniers soutiens
                </h2>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {contributions.slice(0, 10).map((contrib) => (
                    <div key={contrib.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-white truncate">
                            {contrib.is_anonymous ? 'Anonyme' : contrib.contributor_name}
                          </p>
                          <span className="font-black text-yellow-400 flex-shrink-0">
                            {formatPrice(contrib.amount)}
                          </span>
                        </div>
                        {contrib.message && (
                          <p className="text-sm text-gray-400 font-medium mt-1">{contrib.message}</p>
                        )}
                        <p className="text-xs text-gray-500 font-bold mt-1">
                          {new Date(contrib.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-4">
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-black text-white">{formatPrice(cagnotte.current_amount)}</span>
                  <span className="text-sm font-bold text-gray-400">sur {formatPrice(cagnotte.goal_amount)}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm font-black text-yellow-400 mt-2">{progress}% atteint</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Users className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-lg font-black text-white">{cagnotte.contributor_count}</p>
                  <p className="text-xs font-bold text-gray-400">contributeurs</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <Calendar className="mx-auto text-gray-400 mb-1" size={20} />
                  <p className="text-lg font-black text-white">{daysLeft}</p>
                  <p className="text-xs font-bold text-gray-400">jours restants</p>
                </div>
              </div>

              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                >
                  <Gift size={20} />
                  Contribuer
                </button>
              ) : (
                <form onSubmit={handleContribute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Montant (F CFA) *</label>
                    <input
                      type="text"
                      value={formData.amount ? new Intl.NumberFormat('fr-FR').format(parseInt(formData.amount.replace(/\D/g, '')) || 0) : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value.replace(/\D/g, '') }))}
                      placeholder={`Min. ${formatPrice(cagnotte.min_contribution)}`}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                    />
                    <div className="flex gap-2 mt-2">
                      {[cagnotte.min_contribution, cagnotte.suggested_contribution, cagnotte.suggested_contribution * 2].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setSuggestedAmount(amt)}
                          className="flex-1 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300 hover:bg-white/10 transition-colors"
                        >
                          {formatPrice(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      <User size={14} className="inline mr-1" />
                      Votre nom *
                    </label>
                    <input
                      type="text"
                      value={formData.contributor_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, contributor_name: e.target.value }))}
                      placeholder="Votre nom complet"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      <Phone size={14} className="inline mr-1" />
                      Telephone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+221 XX XXX XX XX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      <MessageSquare size={14} className="inline mr-1" />
                      Message (optionnel)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Un mot d'encouragement..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Mode de paiement</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'wave', label: 'Wave', icon: <Smartphone size={16} /> },
                        { id: 'orange', label: 'Orange Money', icon: <Smartphone size={16} /> },
                        { id: 'mtn', label: 'MTN MoMo', icon: <Smartphone size={16} /> },
                        { id: 'card', label: 'Carte', icon: <CreditCard size={16} /> },
                      ].map(method => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, payment_method: method.id }))}
                          className={`p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                            formData.payment_method === method.id
                              ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 border'
                              : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {method.icon}
                          {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_anonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-yellow-500 focus:ring-yellow-500/50"
                    />
                    <span className="text-sm font-bold text-gray-300">Contribuer anonymement</span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-gray-300 hover:bg-white/10 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl font-black text-white hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Heart size={18} />
                      )}
                      {submitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
