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
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden bg-brand-50">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

      <div className="relative w-full max-w-4xl perspective-1000">
        <div className="absolute top-4 left-4 right-0 bottom-0 rounded-[2.5rem] -z-10 bg-slate-900"></div>

        <div className="bg-white rounded-[2rem] border-4 border-black flex flex-col md:flex-row overflow-hidden relative min-h-[600px]">
          <div className="w-full md:w-5/12 border-b-4 md:border-b-0 md:border-r-4 border-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden bg-yellow-400 text-slate-900">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-current bg-white"></div>
              <div className="absolute bottom-20 right-10 w-48 h-48 rotate-12 border-4 border-current rounded-xl bg-white"></div>
            </div>

            <div className="relative z-10 mt-8">
              <Link href="/" className="inline-block text-4xl font-black font-display mb-4 bg-white px-4 py-2 border-4 border-black shadow-pop-sm transform -rotate-2 hover:rotate-0 transition-transform text-slate-900">
                TIKE<span className="text-brand-500">ZONE</span>
              </Link>
              <h2 className="text-5xl font-black font-display leading-[0.9] mt-4 drop-shadow-sm">
                Connexion <br /> fun & securisee
              </h2>
              <p className="mt-6 text-lg font-bold leading-tight text-slate-900">
                Retrouve tes billets, coups de coeur et outils organisateur sans te prendre la tete.
              </p>
            </div>
          </div>

          <div className="w-full md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center relative">
            <div className="max-w-sm mx-auto w-full space-y-6">
              <div className="text-center mb-4">
                <h2 className="text-3xl font-black text-slate-900 font-display">Connexion</h2>
                <p className="text-sm font-bold text-slate-500 mt-2">Email + mot de passe (un clic et c’est parti)</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="vous@example.com"
                  icon={<Mail className="h-5 w-5" />}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />

                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  icon={<Lock className="h-5 w-5" />}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={errors.password}
                  rightElement={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus:outline-none">
                      {showPassword ? <EyeOff className="h-5 w-5 text-slate-400 hover:text-black" strokeWidth={2.5} /> : <Eye className="h-5 w-5 text-slate-400 hover:text-black" strokeWidth={2.5} />}
                    </button>
                  }
                />

                {serverError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold">
                    {serverError}
                  </div>
                )}
                {successMsg && (
                  <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-3 text-sm font-bold flex items-center gap-2">
                    <Sparkles size={16} /> {successMsg}
                  </div>
                )}
                {unverifiedEmail && (
                  <div className="bg-yellow-50 border-2 border-yellow-300 text-yellow-800 rounded-xl p-3 text-xs font-bold space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span>Email non vérifié pour {unverifiedEmail}. Récupère ton code OTP ou renvoie-en un.</span>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={cooldown > 0 || isResending}
                        className="px-3 py-2 rounded-lg border-2 border-black bg-white hover:bg-yellow-100 disabled:opacity-60"
                      >
                        {isResending ? 'Envoi...' : cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer'}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        label="Code de vérification"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        error={undefined}
                        maxLength={6}
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifying}
                        className="h-[52px] px-4 rounded-xl border-2 border-black bg-slate-900 text-white font-black text-xs shadow-pop-sm hover:shadow-none hover:-translate-y-[1px] disabled:opacity-60"
                      >
                        {isVerifying ? 'Vérif...' : 'Valider le code'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-700">Une fois validé, clique à nouveau sur “Se connecter”.</p>
                  </div>
                )}

                <Button type="submit" variant="primary" fullWidth isLoading={isLoading} icon={!isLoading ? <ArrowRight size={18} /> : undefined} className="bg-slate-900">
                  Se connecter
                </Button>
              </form>

              <div className="flex justify-between text-xs font-bold text-slate-600">
                <Link href="/forgot" className="text-brand-600 hover:underline">
                  Mot de passe oublié ?
                </Link>
                <Link href="/register" className="text-slate-900 hover:underline">
                  Créer un compte
                </Link>
              </div>
            </div>

            <div className="absolute bottom-4 right-8 text-xs font-black text-slate-300">Page 1</div>
          </div>
        </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}












