'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from '../../lib/safe-navigation';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { Lock, ArrowRight, Mail, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';
import { loginUser, resendVerification, verifyEmail } from '../../services/authClient';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const redirectPath = searchParams?.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, router, redirectPath]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const validate = () => {
    const newErrors: any = {};
    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format invalide';
    if (!formData.password) newErrors.password = 'Mot de passe requis';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerError(null);
    setSuccessMsg(null);
    setUnverifiedEmail(null);
    try {
      const res = await loginUser(formData.email, formData.password);
      if (login && res?.user) {
        login({
          id: res.user.id,
          name: res.user.name || 'Utilisateur',
          email: res.user.email,
          role: res.user.role === 'customer' ? 'user' : res.user.role,
          avatarUrl: res.user.avatarUrl || null,
        });
      }
      router.push(redirectPath === '/publish' ? '/organizer' : redirectPath);
    } catch (err: any) {
      if (err?.status === 403 && (err?.message || '').toLowerCase().includes('vérifi')) {
        setUnverifiedEmail(formData.email);
        setServerError("Email non vérifié. Vérifie ton mail ou saisis un code OTP.");
        setOtp('');
      } else {
        setServerError(err?.message || 'Connexion impossible');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!unverifiedEmail || cooldown > 0) return;
    setIsResending(true);
    setServerError(null);
    try {
      await resendVerification(unverifiedEmail);
      setCooldown(30);
      setServerError('Code de vérification renvoyé.');
    } catch (err: any) {
      setServerError(err?.message || 'Envoi impossible');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!unverifiedEmail) return;
    if (!otp.trim()) {
      setServerError('Code requis');
      return;
    }
    setIsVerifying(true);
    setServerError(null);
    setSuccessMsg(null);
    try {
      const res = await verifyEmail(unverifiedEmail, otp.trim());
      if (login && res?.user) {
        login({
          id: res.user.id,
          name: res.user.name || 'Utilisateur',
          email: res.user.email,
          role: res.user.role === 'customer' ? 'user' : res.user.role,
          avatarUrl: res.user.avatarUrl || null,
        });
        router.push(redirectPath === '/publish' ? '/organizer' : redirectPath);
        return;
      }
      setSuccessMsg('Compte verifie. Tu peux maintenant te connecter.');
      setUnverifiedEmail(null);
      setOtp('');
    } catch (err: any) {
      setServerError(err?.message || 'Code invalide');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden bg-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="relative w-full max-w-4xl z-10">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row overflow-hidden relative min-h-[600px] shadow-2xl">
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-white/10 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-orange-600/20 via-black to-black">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-white/20 bg-orange-500/10"></div>
              <div className="absolute bottom-20 right-10 w-48 h-48 rotate-12 border border-white/10 rounded-xl bg-white/5"></div>
            </div>

            <div className="relative z-10 mt-8">
              <Link href="/" className="inline-block text-4xl font-black font-display mb-4 px-4 py-2 transform -rotate-2 hover:rotate-0 transition-transform">
                <span className="text-white">TIKE</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ZONE</span>
              </Link>
              <h2 className="text-5xl font-black font-display leading-[0.9] mt-4 text-white">
                Connexion <br /> fun & securisee
              </h2>
              <p className="mt-6 text-lg font-medium leading-tight text-gray-300">
                Retrouve tes billets, coups de coeur et outils organisateur sans te prendre la tete.
              </p>
            </div>
          </div>

          <div className="w-full md:w-7/12 bg-white/5 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center relative">
            <div className="max-w-sm mx-auto w-full space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-3xl font-black text-white font-display">Connexion</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      placeholder="vous@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400 font-bold">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400 font-bold">{errors.password}</p>}
                </div>

                {serverError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-bold">
                    {serverError}
                  </div>
                )}
                {successMsg && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl p-3 text-sm font-bold flex items-center gap-2">
                    <Sparkles size={16} /> {successMsg}
                  </div>
                )}
                {unverifiedEmail && (
                  <div className="bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded-xl p-3 text-xs font-bold space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span>Email non vérifié pour {unverifiedEmail}. Récupère ton code OTP ou renvoie-en un.</span>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0 || isResending}
                        className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 disabled:opacity-60 transition-colors"
                      >
                        {isResending ? 'Envoi...' : cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifying}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-xs disabled:opacity-60 hover:from-orange-600 hover:to-orange-700 transition-all"
                      >
                        {isVerifying ? 'Vérif...' : 'Valider'}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">Une fois validé, clique à nouveau sur "Se connecter".</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  {isLoading ? 'Chargement...' : (
                    <>
                      <ArrowRight size={18} />
                      Se connecter
                    </>
                  )}
                </button>
              </form>

              <div className="flex justify-between text-xs font-bold">
                <Link href="/forgot" className="text-orange-400 hover:text-orange-300 transition-colors">
                  Mot de passe oublié ?
                </Link>
                <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                  Créer un compte
                </Link>
              </div>
            </div>

            <div className="absolute bottom-4 right-8 text-xs font-black text-gray-600">Page 1</div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-20">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white text-sm font-bold hover:bg-white/10 transition-all">
          <ArrowLeft size={16} />
          Retour
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Chargement...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
