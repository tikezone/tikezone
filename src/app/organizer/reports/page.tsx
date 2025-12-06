'use client';

import React, { useEffect, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import { BarChart3, Download, TrendingUp, Users, Ticket, Calendar } from 'lucide-react';

type Stats = {
  totalSales: number;
  ticketsSold: number;
  buyers: number;
  events: number;
};

type Tx = {
  id: string;
  buyer: string;
  event: string;
  ticket: string;
  amount: number;
  quantity: number;
  createdAt: string;
};

type TopEvent = { title: string; sold: number };

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/organizer/reports', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Chargement impossible');
        setStats(data.stats || null);
        setTransactions(data.transactions || []);
        setTopEvents(data.topEvents || []);
      } catch (err: any) {
        setError(err?.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmtMoney = (v: number) =>
    new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(v) + ' F CFA';

  return (
    <OrganizerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-white font-display uppercase">Rapports & Stats</h1>
          <button className="flex items-center text-sm font-bold bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl text-white hover:bg-white/20 transition-all">
            <Download size={16} className="mr-2" /> Exporter CSV
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 font-bold p-4 rounded-xl">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={TrendingUp} label="Chiffre d'affaires" value={stats ? fmtMoney(stats.totalSales) : '--'} />
          <StatCard icon={Ticket} label="Billets vendus" value={stats ? stats.ticketsSold.toString() : '--'} />
          <StatCard icon={Users} label="Acheteurs uniques" value={stats ? stats.buyers.toString() : '--'} />
          <StatCard icon={Calendar} label="Evenements" value={stats ? stats.events.toString() : '--'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 lg:col-span-2">
            <h3 className="font-black text-lg uppercase mb-4 text-white">Top evenements (ventes)</h3>
            {topEvents.length === 0 ? (
              <p className="text-gray-500 font-bold text-sm">Aucune vente pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {topEvents.map((evt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center font-black">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white">{evt.title}</p>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                          style={{ width: `${Math.min(100, evt.sold)}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-300">{evt.sold} billets</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20">
            <h3 className="font-black text-lg uppercase mb-4 text-white">Resume express</h3>
            <ul className="space-y-3 text-sm font-bold text-gray-300">
              <li className="flex justify-between">
                <span>CA moyen / event</span>
                <span className="text-white">{stats && stats.events > 0 ? fmtMoney(Math.round(stats.totalSales / stats.events)) : '--'}</span>
              </li>
              <li className="flex justify-between">
                <span>Billets / acheteur</span>
                <span className="text-white">
                  {stats && stats.buyers > 0 ? (stats.ticketsSold / stats.buyers).toFixed(1) : '--'}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-black uppercase text-white">Dernieres transactions</h3>
            <span className="text-xs font-black text-gray-500">
              {transactions.length} enregistrements
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500 font-black uppercase text-[10px] border-b border-white/10">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Evenement</th>
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Qte</th>
                  <th className="p-4">Montant</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-bold text-white">
                {transactions.length === 0 ? (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={6}>
                      Aucune transaction pour l'instant.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">{tx.buyer}</td>
                      <td className="p-4">{tx.event}</td>
                      <td className="p-4">
                        <span className="bg-blue-500/30 text-blue-400 px-2 py-0.5 rounded text-xs border border-blue-500/30">
                          {tx.ticket}
                        </span>
                      </td>
                      <td className="p-4">{tx.quantity}</td>
                      <td className="p-4">{fmtMoney(tx.amount)}</td>
                      <td className="p-4 text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-2xl p-4 rounded-2xl border border-white/20 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl border border-white/20 flex items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-black uppercase text-gray-400">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}
