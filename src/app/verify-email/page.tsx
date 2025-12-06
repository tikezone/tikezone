'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from '../../lib/safe-navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
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
              <Mail size={32} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-white font-display text-center">Verifie ton email</h1>
          <p className="text-sm font-bold text-gray-400 text-center">Entre le code a 6 chiffres recu par email.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
                className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-4 text-white font-bold text-sm focus:outline-none focus:border-orange-500 placeholder-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-gray-400 ml-1">Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full bg-white/5 border border-white/20 rounded-2xl py-3 px-4 text-white font-bold text-sm text-center tracking-widest focus:outline-none focus:border-orange-500 placeholder-gray-500"
              />
            </div>
            
            {success && (
              <div className="bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl p-4 text-sm font-bold flex items-center gap-2">
                <CheckCircle size={18} /> Email verifie. Redirection...
              </div>
            )}
            {error && !success && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl p-4 text-sm font-bold">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
            >
              {loading ? 'Verification...' : 'Valider'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
