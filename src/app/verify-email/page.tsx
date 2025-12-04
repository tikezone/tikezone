'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from '../../lib/safe-navigation';
import Link from 'next/link';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { ArrowLeft } from 'lucide-react';
import { verifyEmail } from '../../services/authClient';
import { useAuth } from '../../context/AuthContext';

function VerifyEmailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const emailParam = searchParams?.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !otp) {
      setError('Email et code requis');
      return;
    }
    setLoading(true);
    try {
      const res = await verifyEmail(email, otp);
      setSuccess(true);
      if (login && res?.user) {
        login({
          id: res.user.id,
          name: res.user.name || 'Utilisateur',
          email: res.user.email,
          role: res.user.role === 'customer' ? 'user' : res.user.role,
          avatarUrl: res.user.avatarUrl || null,
        });
      }
      setTimeout(() => router.push('/'), 1000);
    } catch (err: any) {
      setError(err?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <div className="w-full max-w-md bg-white border-4 border-black rounded-3xl shadow-pop p-8 space-y-6">
        <h1 className="text-3xl font-black text-slate-900 font-display text-center">Vérifie ton email</h1>
        <p className="text-sm font-bold text-slate-600 text-center">Entre le code à 6 chiffres reçu par email.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@example.com"
            error={error || undefined}
          />
          <Input
            label="Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="123456"
            maxLength={6}
            error={undefined}
          />
          {success && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-3 text-sm font-bold">
              Email vérifié. Redirection...
            </div>
          )}
          {error && !success && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold">
              {error}
            </div>
          )}
          <Button type="submit" variant="primary" fullWidth isLoading={loading}>
            Valider
          </Button>
        </form>
      </div>
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="white" className="rounded-full py-2 px-4 shadow-pop-sm" icon={<ArrowLeft size={16} />}>
            Retour
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
