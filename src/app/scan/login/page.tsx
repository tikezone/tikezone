'use client';

import React, { useState } from 'react';
import { useRouter } from '../../../lib/safe-navigation';
import Button from '../../../components/UI/Button';
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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 border-4 border-brand-500 shadow-[0_0_40px_rgba(244,63,94,0.3)]">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center border-4 border-black shadow-pop">
            <QrCode size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-center font-display uppercase mb-2">Espace Scan</h1>
        <p className="text-slate-500 text-center font-bold text-sm mb-8">
          Entrez votre code agent pour acceder aux evenements.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase ml-1">Code d'acces</label>
            <input
              type="text"
              className="w-full text-center text-3xl font-black tracking-widest py-4 border-2 border-black rounded-xl uppercase placeholder-slate-200 focus:outline-none focus:border-brand-500 focus:shadow-pop-sm transition-all"
              placeholder="AGT-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 border-2 border-red-200 rounded-xl p-3">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <Button fullWidth variant="secondary" className="py-4 text-lg" icon={<ArrowRight />} isLoading={loading}>
            Entrer
          </Button>
        </form>
      </div>

      <p className="text-slate-500 text-xs font-bold mt-8">Tikezone Pro</p>
    </div>
  );
}
