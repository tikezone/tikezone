'use client';

import React, { useEffect, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import Button from '../../../components/UI/Button';
import Input from '../../../components/UI/Input';
import { Wallet, ArrowUpRight, ArrowDownLeft, DollarSign, Smartphone, CreditCard, Ticket } from 'lucide-react';

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
              <h1 className="text-3xl font-black text-slate-900 font-display uppercase">Portefeuille</h1>
              <p className="text-slate-500 font-bold text-sm">Total ventes payees issues de tes evenements.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadWallet} variant="white" icon={<ArrowDownLeft size={18} />} isLoading={loading}>
                  Rafraichir
              </Button>
              <Button onClick={() => setIsWithdrawModalOpen(true)} variant="primary" icon={<ArrowUpRight size={18} />}>
                  Demander un retrait
              </Button>
            </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 text-red-700 rounded-xl p-3 text-sm font-bold">
            {error}
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl border-4 border-black shadow-pop-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="relative z-10">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Solde total</p>
                <h2 className="text-5xl md:text-6xl font-black font-display mb-2">
                    {new Intl.NumberFormat('fr-FR').format(balance)} <span className="text-2xl text-yellow-400">F CFA</span>
                </h2>
                <p className="text-sm font-bold text-yellow-200">Disponible: {new Intl.NumberFormat('fr-FR').format(available)} F</p>
                
                <div className="flex gap-6 text-sm font-bold mt-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mr-2 border border-green-500/50">
                            <ArrowDownLeft size={16} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] uppercase">Revenus (bookings payes)</p>
                            <p>+ {new Intl.NumberFormat('fr-FR').format(balance)} F</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mr-2 border border-red-500/50">
                            <ArrowUpRight size={16} className="text-red-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] uppercase">Retraits demandes</p>
                            <p>- {new Intl.NumberFormat('fr-FR').format(Math.max(0, balance - available))} F</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Payouts */}
        <div className="bg-white rounded-2xl border-2 border-black shadow-pop overflow-hidden">
          <div className="p-6 border-b-2 border-black bg-slate-50 flex justify-between items-center">
            <h3 className="font-black text-lg uppercase">Demandes de retrait</h3>
          </div>
          <div>
            {payouts.map((p) => (
              <div key={p.id} className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {new Intl.NumberFormat('fr-FR').format(p.amount)} F - {p.method.toUpperCase()}
                  </p>
                  <p className="text-xs font-bold text-slate-500">{p.destination}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500">
                    {new Date(p.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                  </p>
                  <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${
                    p.status === 'paid'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : p.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
            {!loading && payouts.length === 0 && (
              <div className="p-6 text-center text-slate-500 font-bold">Aucun retrait demande pour l'instant.</div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border-2 border-black shadow-pop overflow-hidden">
            <div className="p-6 border-b-2 border-black bg-slate-50 flex justify-between items-center">
                <h3 className="font-black text-lg uppercase">Historique des ventes</h3>
                {loading && <span className="text-xs font-bold text-slate-500">Chargement...</span>}
            </div>
            <div>
                {transactions.map((t) => (
                    <div key={t.id} className="p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black bg-green-100 text-green-700">
                                <Ticket size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                                <p className="text-xs font-bold text-slate-500">
                                    {new Date(t.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-black ${t.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('fr-FR').format(t.amount)} F
                            </p>
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded border ${t.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                {t.status === 'paid' ? 'Succes' : t.status}
                            </span>
                        </div>
                    </div>
                ))}
                {!loading && transactions.length === 0 && (
                  <div className="p-6 text-center text-slate-500 font-bold">Aucune transaction pour l'instant.</div>
                )}
            </div>
        </div>

        {/* Withdrawal Modal */}
        {isWithdrawModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl border-4 border-black shadow-pop-lg w-full max-w-md overflow-hidden animate-in zoom-in-95">
                    <div className="bg-yellow-400 p-6 border-b-2 border-black">
                        <h3 className="text-2xl font-black uppercase">Retirer des fonds</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <Input
                          label="Montant (FCFA)"
                          placeholder="Ex: 50000"
                          type="number"
                          icon={<DollarSign size={16}/>}
                          value={payoutForm.amount}
                          onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                        />
                        
                        <div>
                            <label className="text-xs font-black uppercase ml-1 block mb-2">Moyen de paiement</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                  className={`p-3 rounded-xl border-2 ${payoutForm.method === 'wave' ? 'border-black bg-blue-100' : 'border-slate-200 bg-white text-slate-500'} flex flex-col items-center justify-center hover:shadow-pop-sm transition-all active:translate-y-1`}
                                  onClick={() => setPayoutForm({ ...payoutForm, method: 'wave' })}
                                  type="button"
                                >
                                    <Smartphone size={24} className="mb-1 text-blue-600" />
                                    <span className="font-bold text-xs">Wave / OM</span>
                                </button>
                                <button
                                  className={`p-3 rounded-xl border-2 ${payoutForm.method === 'bank' ? 'border-black bg-blue-50' : 'border-slate-200 bg-white text-slate-500'} flex flex-col items-center justify-center hover:shadow-pop-sm transition-all active:translate-y-1`}
                                  onClick={() => setPayoutForm({ ...payoutForm, method: 'bank' })}
                                  type="button"
                                >
                                    <CreditCard size={24} className="mb-1" />
                                    <span className="font-bold text-xs">Virement</span>
                                </button>
                            </div>
                        </div>

                        <Input
                          label={payoutForm.method === 'bank' ? 'RIB / Compte' : 'Numero de telephone'}
                          placeholder={payoutForm.method === 'bank' ? 'RIB ou compte bancaire' : '07 00 00 00 00'}
                          icon={<Smartphone size={16}/>}
                          value={payoutForm.destination}
                          onChange={(e) => setPayoutForm({ ...payoutForm, destination: e.target.value })}
                        />
                        
                        {payoutError && (
                          <div className="bg-red-50 border-2 border-red-400 text-red-700 rounded-xl p-2 text-sm font-bold">
                            {payoutError}
                          </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <Button variant="ghost" onClick={() => setIsWithdrawModalOpen(false)} fullWidth>Annuler</Button>
                            <Button variant="primary" fullWidth onClick={submitPayout} isLoading={payoutLoading}>Valider</Button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </OrganizerLayout>
  );
}
