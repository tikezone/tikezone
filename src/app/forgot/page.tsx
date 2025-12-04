'use client';

import React, { useState } from 'react';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!email || !email.includes('@')) {
      setError('Email invalide');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Envoi impossible');
      } else {
        setSuccess(true);
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
      <div className="absolute bottom-10 right-6 w-32 h-32 bg-pink-200 rounded-full border-2 border-black blur-2xl opacity-40 -rotate-6"></div>

      <div className="absolute top-4 left-4 z-20">
        <Link href="/login" className="inline-flex items-center text-xs font-black text-slate-600 hover:text-slate-900 bg-white border-2 border-black rounded-full px-3 py-1 shadow-pop-sm">
          <ArrowLeft size={16} className="mr-2" /> Tu te rappelles de ton mot de passe maintenant ?
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-pop p-8 space-y-6 relative overflow-hidden z-10">
        <div className="absolute -top-6 -left-6 w-16 h-16 bg-brand-500 rounded-full border-2 border-black opacity-20 rotate-12"></div>
        <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-blue-200 rounded-full border-2 border-black opacity-30 rotate-6"></div>

        <h1 className="text-3xl font-black text-slate-900 font-display text-center">Mot de passe oublié</h1>
        <p className="text-sm font-bold text-slate-600 text-center">
          Entre ton email, on t’envoie un lien de réinitialisation valable 15 minutes.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            placeholder="vous@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error || undefined}
            icon={<Mail size={18} />}
          />
          <Button type="submit" variant="primary" fullWidth isLoading={loading} className="bg-slate-900">
            Envoyer le lien
          </Button>
        </form>
        {success && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-3 text-sm font-bold shadow-sm">
            Si un compte existe, un email a été envoyé avec le lien de réinitialisation.
          </div>
        )}
        {error && !success && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold shadow-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
