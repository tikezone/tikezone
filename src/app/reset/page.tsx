'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from '../../lib/safe-navigation';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';

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
        setError(body.error || 'Réinitialisation impossible');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 1500);
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-10 left-6 w-28 h-28 bg-yellow-200 rounded-full border-2 border-black blur-2xl opacity-40 rotate-6"></div>
      <div className="absolute bottom-10 right-6 w-32 h-32 bg-blue-200 rounded-full border-2 border-black blur-2xl opacity-40 -rotate-6"></div>

      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="inline-flex items-center text-xs font-black text-slate-600 hover:text-slate-900 bg-white border-2 border-black rounded-full px-3 py-1 shadow-pop-sm">
          <ArrowLeft size={16} className="mr-2" /> Retour
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-pop p-8 space-y-6 relative overflow-hidden z-10">
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-brand-500 rounded-full border-2 border-black opacity-20 rotate-12"></div>
        <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-pink-200 rounded-full border-2 border-black opacity-30 rotate-6"></div>

        <h1 className="text-3xl font-black text-slate-900 font-display text-center">Nouveau mot de passe</h1>
        <p className="text-sm font-bold text-slate-600 text-center">
          Choisis un nouveau mot de passe pour {email || 'ton compte'}.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nouveau mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={undefined}
            icon={<Lock size={18} />}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={error || undefined}
            icon={<Lock size={18} />}
          />
          <Button type="submit" variant="primary" fullWidth isLoading={loading} disabled={!token || !email} className="bg-slate-900">
            Réinitialiser
          </Button>
        </form>
        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-3 text-sm font-bold shadow-sm">
            Mot de passe mis à jour. Redirection en cours...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold shadow-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ResetPageContent />
    </Suspense>
  );
}
