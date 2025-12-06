'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from '../../lib/safe-navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';

function ResetPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token') || '';
  const email = searchParams?.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setError('Lien invalide ou incomplet.');
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!token || !email) {
      setError('Lien invalide.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Mot de passe trop court (6 min).');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Reinitialisation impossible');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur reseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />

      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-white bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 hover:bg-white/20 transition-all">
          <ArrowLeft size={16} /> Retour
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Lock size={32} className="text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white font-display text-center">Nouveau mot de passe</h1>
          <p className="text-sm font-bold text-gray-400 text-center">
            Choisis un nouveau mot de passe pour {email || 'ton compte'}.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-1">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 pl-10 pr-4 text-white font-bold text-sm focus:outline-none focus:border-orange-500 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 pl-10 pr-4 text-white font-bold text-sm focus:outline-none focus:border-orange-500 placeholder-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !token || !email}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Reinitialisation...' : 'Reinitialiser'}
            </button>
          </form>

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl p-4 text-sm font-bold flex items-center gap-2">
              <CheckCircle size={18} /> Mot de passe mis a jour. Redirection en cours...
            </div>
          )}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl p-4 text-sm font-bold">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>}>
      <ResetPageContent />
    </Suspense>
  );
}
