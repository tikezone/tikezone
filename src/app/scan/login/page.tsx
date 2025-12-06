'use client';

import React, { useState } from 'react';
import { useRouter } from '../../../lib/safe-navigation';
import { QrCode, ArrowRight, AlertTriangle } from 'lucide-react';

export default function ScanLoginPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (cleaned.length < 4) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scan/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleaned }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Connexion impossible');
        return;
      }
      router.push('/scan/dashboard');
    } catch (err) {
      setError('Connexion impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <QrCode size={40} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-center text-white font-display uppercase mb-2">Espace Scan</h1>
          <p className="text-gray-400 text-center font-bold text-sm mb-8">
            Entrez votre code agent pour acceder aux evenements.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-1">Code d'acces</label>
              <input
                type="text"
                className="w-full text-center text-3xl font-black tracking-widest py-4 bg-white/5 border border-white/20 rounded-2xl uppercase text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-all"
                placeholder="AGT-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm font-bold text-red-400 bg-red-500/20 border border-red-500/30 rounded-2xl p-4">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Entrer'}
              <ArrowRight size={20} />
            </button>
          </form>
        </div>

        <p className="text-gray-500 text-xs font-bold mt-8 text-center">Tikezone Pro</p>
      </div>
    </div>
  );
}
