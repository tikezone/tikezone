'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from '../../lib/safe-navigation';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, ArrowRight, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { registerUser, verifyEmail, resendVerification } from '../../services/authClient';
import { validatePasswordStrength, PASSWORD_MIN_LENGTH } from '../../lib/passwordPolicy';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const redirectPath = searchParams?.get('redirect') || '/';

  const passwordStrength = (() => {
    const pwd = formData.password || '';
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    const lenScore = Math.min(2, Math.floor(pwd.length / 4));
    const varietyScore = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
    const score = Math.min(4, lenScore + varietyScore);

    const levels = [
      { label: 'Faible', color: 'bg-red-500', width: '20%' },
      { label: 'Moyen', color: 'bg-orange-400', width: '45%' },
      { label: 'Acceptable', color: 'bg-yellow-400', width: '70%' },
      { label: 'Fort', color: 'bg-green-500', width: '100%' },
    ];

    const idx = Math.max(0, Math.min(3, score - 1));
    const missing: string[] = [];
    if (pwd.length < PASSWORD_MIN_LENGTH) missing.push(`${PASSWORD_MIN_LENGTH} caracteres`);
    if (!hasUpper) missing.push('majuscule');
    if (!hasLower) missing.push('minuscule');
    if (!hasDigit) missing.push('chiffre');
    if (!hasSymbol) missing.push('symbole');

    return {
      ...levels[idx],
      missing,
      isEmpty: pwd.length === 0,
    };
  })();

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
    if (!formData.firstName) newErrors.firstName = 'Prenom requis';
    if (!formData.lastName) newErrors.lastName = 'Nom requis';
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format invalide';

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else {
      const strength = validatePasswordStrength(formData.password, {
        email: formData.email,
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        minLength: PASSWORD_MIN_LENGTH,
      });
      if (!strength.ok) newErrors.password = strength.error;
    }

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerError(null);
    try {
      await registerUser(formData);
      setStep('verify');
    } catch (err: any) {
      setServerError(err?.message || 'Inscription impossible');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setErrors({ otp: 'Code requis' });
      return;
    }
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await verifyEmail(formData.email, otp);
      if (login && res?.user) {
        login({
          id: res.user.id,
          name: res.user.name || `${formData.firstName}`,
          email: res.user.email,
          role: res.user.role === 'customer' ? 'user' : res.user.role,
          avatarUrl: res.user.avatarUrl || null,
        });
      }
      await fetch('/api/auth/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, fullName: `${formData.firstName} ${formData.lastName}` }),
      }).catch(() => {});
      router.push(redirectPath === '/publish' ? '/organizer' : redirectPath);
    } catch (err: any) {
      setServerError(err?.message || 'Code invalide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email || cooldown > 0) return;
    setIsLoading(true);
    setServerError(null);
    try {
      await resendVerification(formData.email);
      setCooldown(30);
    } catch (err: any) {
      setServerError(err?.message || 'Envoi impossible');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden bg-black">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-black to-black pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <div className="relative w-full max-w-4xl z-10">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 flex flex-col md:flex-row overflow-hidden relative min-h-[650px] shadow-2xl">
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-white/10 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-green-600/20 via-black to-black">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-purple-500/20 rotate-12 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 mt-16">
              <Link href="/" className="inline-block text-4xl font-black font-display mb-4 transform rotate-1 hover:rotate-0 transition-transform">
                <span className="text-white">TIKE</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">ZONE</span>
              </Link>
              <h2 className="text-5xl font-black text-white font-display leading-[0.9] mt-4 uppercase">
                Rejoins <br /> le Club
              </h2>
              <p className="mt-6 text-lg font-medium text-gray-300 leading-tight">
                Cree ton compte, drop ton email et on te garde une place au premier rang.
              </p>
            </div>

            <div className="relative z-10 mt-12 flex items-center space-x-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-blue-500/30"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-orange-500/30"></div>
                <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-pink-500/30"></div>
              </div>
              <span className="text-sm font-bold text-gray-400">+2000 membres</span>
            </div>
          </div>

          <div className="w-full md:w-7/12 bg-white/5 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center relative">
            <div className="max-w-sm mx-auto w-full">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-white font-display">{step === 'form' ? 'Inscription' : 'Verifie ton email'}</h2>
                {step === 'verify' && (
                  <p className="text-sm font-medium text-gray-400 mt-2">Entre le code reçu par email</p>
                )}
              </div>

              {step === 'form' ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prénom</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                      {errors.firstName && <p className="text-xs text-red-400 font-bold">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nom</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                      </div>
                      {errors.lastName && <p className="text-xs text-red-400 font-bold">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type="email"
                        placeholder="vous@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
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
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-400 font-bold">{errors.password}</p>}
                  </div>

                  <div className="space-y-1 ml-1">
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength.color}`}
                        style={{ width: passwordStrength.isEmpty ? '0%' : passwordStrength.width }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-gray-300">{passwordStrength.label}</span>
                      {!passwordStrength.isEmpty && passwordStrength.missing.length > 0 && (
                        <span className="text-gray-500">Manque: {passwordStrength.missing.slice(0, 2).join(', ')}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirmer</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirme le mot de passe"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-400 font-bold">{errors.confirmPassword}</p>}
                  </div>

                  {serverError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-bold">
                      {serverError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 mt-2"
                  >
                    {isLoading ? 'Chargement...' : (
                      <>
                        <ArrowRight size={18} />
                        S'inscrire et vérifier
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Code OTP</label>
                    <input
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    {errors.otp && <p className="text-xs text-red-400 font-bold text-center">{errors.otp}</p>}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                    <span>Code envoyé à {formData.email}</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isLoading}
                      className="text-orange-400 hover:text-orange-300 disabled:opacity-50 transition-colors"
                    >
                      {cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer le code'}
                    </button>
                  </div>

                  {serverError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-bold">
                      {serverError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                  >
                    {isLoading ? 'Vérification...' : 'Valider le code'}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm font-medium text-gray-400">
                  Déjà membre ?{' '}
                  <Link href="/login" className="font-bold text-orange-400 hover:text-orange-300 transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 right-8 text-xs font-black text-gray-600">Page 2</div>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Chargement...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
