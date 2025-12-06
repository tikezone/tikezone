'use client';

import React, { useEffect, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import { Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, Smartphone, CreditCard, Ticket, X } from 'lucide-react';

type Tx = { id: string; title: string; amount: number; status: string; createdAt: string };
type Payout = { id: string; amount: number; method: string; destination: string; status: string; createdAt: string };

export default function WalletPage() {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [available, setAvailable] = useState(0);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState({ amount: '', method: 'wave', destination: '' });
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);

  const loadWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/organizer/wallet', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Chargement impossible');
      setBalance(data.totalSales || 0);
      setAvailable(data.available || 0);
      setTransactions(data.transactions || []);
      setPayouts(data.payouts || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur portefeuille');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const submitPayout = async () => {
    setPayoutError(null);
    const amt = Number(payoutForm.amount || 0);
    if (!amt || amt <= 0) {
      setPayoutError('Montant invalide');
      return;
    }
    if (amt > available) {
      setPayoutError('Montant trop eleve');
      return;
    }
    if (!payoutForm.destination.trim()) {
      setPayoutError('Renseigne le numero ou RIB');
      return;
    }

    setPayoutLoading(true);
    try {
      const res = await fetch('/api/organizer/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amt,
          method: payoutForm.method,
          destination: payoutForm.destination.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Demande impossible');
      setPayouts((prev) => [data.payout, ...prev]);
      setAvailable(data.available ?? available - amt);
      setIsWithdrawModalOpen(false);
      setPayoutForm({ amount: '', method: 'wave', destination: '' });
    } catch (err: any) {
      setPayoutError(err?.message || 'Erreur demande retrait');
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <OrganizerLayout>
      <div className="space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-white font-display uppercase">Portefeuille</h1>
              <p className="text-gray-400 font-bold text-sm">Total ventes payees issues de tes evenements.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadWallet}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
              >
                <ArrowDownLeft size={18} />
                {loading ? 'Chargement...' : 'Rafraichir'}
              </button>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
              >
                <ArrowUpRight size={18} />
                Demander un retrait
              </button>
            </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-900/20 backdrop-blur-2xl text-white p-8 rounded-3xl border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10">
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Solde total</p>
                <h2 className="text-5xl md:text-6xl font-black font-display mb-2">
                    {new Intl.NumberFormat('fr-FR').format(balance)} <span className="text-2xl text-orange-400">F CFA</span>
                </h2>
                <p className="text-sm font-bold text-orange-300">Disponible: {new Intl.NumberFormat('fr-FR').format(available)} F</p>
                
                <div className="flex gap-6 text-sm font-bold mt-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2 border border-green-500/50">
                            <ArrowDownLeft size={16} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Revenus (bookings payes)</p>
                            <p className="text-white">+ {new Intl.NumberFormat('fr-FR').format(balance)} F</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-2 border border-red-500/50">
                            <ArrowUpRight size={16} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Retraits demandes</p>
                            <p className="text-white">- {new Intl.NumberFormat('fr-FR').format(Math.max(0, balance - available))} F</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-black text-lg uppercase text-white">Demandes de retrait</h3>
          </div>
          <div>
            {payouts.map((p) => (
              <div key={p.id} className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">
                    {new Intl.NumberFormat('fr-FR').format(p.amount)} F - {p.method.toUpperCase()}
                  </p>
                  <p className="text-xs font-bold text-gray-500">{p.destination}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500">
                    {new Date(p.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                    p.status === 'paid'
                      ? 'bg-green-500/30 text-green-400 border-green-500/30'
                      : p.status === 'pending'
                      ? 'bg-yellow-500/30 text-yellow-400 border-yellow-500/30'
                      : 'bg-gray-500/30 text-gray-400 border-gray-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
            {!loading && payouts.length === 0 && (
              <div className="p-6 text-center text-gray-500 font-bold">Aucun retrait demande pour l'instant.</div>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-black text-lg uppercase text-white">Historique des ventes</h3>
                {loading && <span className="text-xs font-bold text-gray-500">Chargement...</span>}
            </div>
            <div>
                {transactions.map((t) => (
                    <div key={t.id} className="p-4 border-b border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-green-500/30 bg-green-500/20 text-green-400">
                                <Ticket size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">{t.title}</p>
                                <p className="text-xs font-bold text-gray-500">
                                    {new Date(t.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-black ${t.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                                {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(t.amount)} F
                            </p>
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${t.status === 'paid' ? 'bg-green-500/30 text-green-400 border-green-500/30' : 'bg-yellow-500/30 text-yellow-400 border-yellow-500/30'}`}>
                                {t.status === 'paid' ? 'Succes' : t.status}
                            </span>
                        </div>
                    </div>
                ))}
                {!loading && transactions.length === 0 && (
                  <div className="p-6 text-center text-gray-500 font-bold">Aucune transaction pour l'instant.</div>
                )}
            </div>
        </div>

        {isWithdrawModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/20 w-full max-w-md overflow-hidden animate-in zoom-in-95">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex items-center justify-between">
                        <h3 className="text-2xl font-black uppercase text-white">Retirer des fonds</h3>
                        <button onClick={() => setIsWithdrawModalOpen(false)} className="text-white/80 hover:text-white">
                          <X size={24} />
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-gray-400">Montant (FCFA)</label>
                          <div className="relative">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                              type="number"
                              placeholder="Ex: 50000"
                              value={payoutForm.amount}
                              onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-gray-500 focus:border-orange-500/50 outline-none"
                            />
                          </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400 block mb-2">Moyen de paiement</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                  className={`p-3 rounded-xl border ${payoutForm.method === 'wave' ? 'border-orange-500 bg-orange-500/20' : 'border-white/10 bg-white/5'} flex flex-col items-center justify-center hover:bg-white/10 transition-all`}
                                  onClick={() => setPayoutForm({ ...payoutForm, method: 'wave' })}
                                  type="button"
                                >
                                    <Smartphone size={24} className={`mb-1 ${payoutForm.method === 'wave' ? 'text-orange-400' : 'text-gray-400'}`} />
                                    <span className={`font-bold text-xs ${payoutForm.method === 'wave' ? 'text-orange-400' : 'text-gray-400'}`}>Wave / OM</span>
                                </button>
                                <button
                                  className={`p-3 rounded-xl border ${payoutForm.method === 'bank' ? 'border-orange-500 bg-orange-500/20' : 'border-white/10 bg-white/5'} flex flex-col items-center justify-center hover:bg-white/10 transition-all`}
                                  onClick={() => setPayoutForm({ ...payoutForm, method: 'bank' })}
                                  type="button"
                                >
                                    <CreditCard size={24} className={`mb-1 ${payoutForm.method === 'bank' ? 'text-orange-400' : 'text-gray-400'}`} />
                                    <span className={`font-bold text-xs ${payoutForm.method === 'bank' ? 'text-orange-400' : 'text-gray-400'}`}>Virement</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase text-gray-400">{payoutForm.method === 'bank' ? 'RIB / Compte' : 'Numero de telephone'}</label>
                          <div className="relative">
                            <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                              type="text"
                              placeholder={payoutForm.method === 'bank' ? 'RIB ou compte bancaire' : '07 00 00 00 00'}
                              value={payoutForm.destination}
                              onChange={(e) => setPayoutForm({ ...payoutForm, destination: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold placeholder-gray-500 focus:border-orange-500/50 outline-none"
                            />
                          </div>
                        </div>
                        
                        {payoutError && (
                          <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-2 text-sm font-bold">
                            {payoutError}
                          </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button
                              onClick={() => setIsWithdrawModalOpen(false)}
                              className="flex-1 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={submitPayout}
                              disabled={payoutLoading}
                              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
                            >
                              {payoutLoading ? 'Chargement...' : 'Valider'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </OrganizerLayout>
  );
}
