'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from '../../lib/safe-navigation';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
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
    const lenScore = Math.min(2, Math.floor(pwd.length / 4)); // 0..2
    const varietyScore = [hasUpper, hasLower, hasDigit, hasSymbol].filter(Boolean).length;
    const score = Math.min(4, lenScore + varietyScore);

    const levels = [
      { label: 'Faible', color: 'bg-red-500', width: '20%', help: 'Ajoute lettres, chiffres, symboles.' },
      { label: 'Moyen', color: 'bg-orange-400', width: '45%', help: 'Ajoute majuscules + symboles.' },
      { label: 'Acceptable', color: 'bg-yellow-400', width: '70%', help: 'Encore un caractere special ou chiffre.' },
      { label: 'Fort', color: 'bg-green-500', width: '100%', help: 'C est bon, continue.' },
    ];

    const idx = Math.max(0, Math.min(3, score - 1));
    const missing: string[] = [];
    if (pwd.length < PASSWORD_MIN_LENGTH) missing.push(`Au moins ${PASSWORD_MIN_LENGTH} caracteres`);
    if (!hasUpper) missing.push('Une majuscule');
    if (!hasLower) missing.push('Une minuscule');
    if (!hasDigit) missing.push('Un chiffre');
    if (!hasSymbol) missing.push('Un symbole');

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
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

      <div className="relative w-full max-w-4xl perspective-1000">
        <div className="absolute top-4 left-4 right-0 bottom-0 bg-slate-900 rounded-[2.5rem] -z-10"></div>

        <div className="bg-white rounded-[2rem] border-4 border-black flex flex-col md:flex-row overflow-hidden relative min-h-[600px]">
          <div className="w-full md:w-5/12 bg-green-400 border-b-4 md:border-b-0 md:border-r-4 border-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-yellow-300 rounded-full border-4 border-black"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-pink-400 rotate-12 border-4 border-black rounded-full"></div>
            </div>

            <div className="relative z-10 mt-16">
              <Link href="/" className="inline-block text-4xl font-black text-slate-900 font-display mb-4 bg-white px-4 py-2 border-4 border-black shadow-pop-sm transform rotate-1 hover:rotate-0 transition-transform">
                TIKE<span className="text-brand-500">ZONE</span>
              </Link>
              <h2 className="text-5xl font-black text-slate-900 font-display leading-[0.9] mt-4 drop-shadow-sm uppercase">
                Rejoins <br /> le Club
              </h2>
              <p className="mt-6 text-lg font-bold text-slate-900 leading-tight">
                Cree ton compte, drop ton email et on te garde une place au premier rang.
              </p>
            </div>

            <div className="relative z-10 mt-12 flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-black bg-blue-200"></div>
                <div className="w-8 h-8 rounded-full border-2 border-black bg-yellow-200"></div>
                <div className="w-8 h-8 rounded-full border-2 border-black bg-pink-200"></div>
              </div>
              <span className="text-xs font-black text-slate-900">+2000 membres</span>
            </div>
          </div>

          <div className="w-full md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center relative">
            <div className="max-w-sm mx-auto w-full">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-slate-900 font-display">{step === 'form' ? 'Inscription' : 'Verifie ton email'}</h2>
                <p className="text-sm font-bold text-slate-500 mt-2">
                  {step === 'form' ? 'Prénom, nom, email, mot de passe – mode héros activé' : 'Entre le code reçu par email'}
                </p>
              </div>

              {step === 'form' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Prénom"
                      icon={<User className="h-5 w-5" />}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={errors.firstName}
                    />
                    <Input
                      label="Nom"
                      icon={<User className="h-5 w-5" />}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={errors.lastName}
                    />
                  </div>

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
                  <div className="space-y-1 ml-1">
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength.color}`}
                        style={{ width: passwordStrength.isEmpty ? '0%' : passwordStrength.width }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span className="text-slate-900">{passwordStrength.label}</span>
                      {!passwordStrength.isEmpty && <span className="text-slate-500">{passwordStrength.help}</span>}
                    </div>
                    {!passwordStrength.isEmpty && passwordStrength.missing.length > 0 && (
                      <div className="text-[11px] font-bold text-slate-500">
                        Manque : {passwordStrength.missing.slice(0, 2).join(', ')}
                      </div>
                    )}
                    {passwordStrength.isEmpty && (
                      <div className="text-[11px] font-bold text-slate-500">Minimum 8 caracteres, majuscule, minuscule, chiffre et symbole.</div>
                    )}
                  </div>

                  <Input
                    label="Confirmer le mot de passe"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirme le mot de passe"
                    icon={<Lock className="h-5 w-5" />}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    error={errors.confirmPassword}
                  />

                  {serverError && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold">
                      {serverError}
                    </div>
                  )}

                  <Button type="submit" variant="secondary" fullWidth isLoading={isLoading} icon={!isLoading ? <ArrowRight size={18} /> : undefined} className="mt-2">
                    S'inscrire et vérifier
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4">
                  <Input
                    label="Code OTP"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    error={errors.otp}
                    maxLength={6}
                  />
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                    <span>Un code a été envoyé à {formData.email}</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={cooldown > 0 || isLoading}
                      className="text-brand-600 hover:text-brand-700 disabled:opacity-50"
                    >
                      {cooldown > 0 ? `Renvoyer (${cooldown}s)` : 'Renvoyer le code'}
                    </button>
                  </div>
                  {serverError && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm font-bold">
                      {serverError}
                    </div>
                  )}
                  <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
                    Valider le code
                  </Button>
                  <p className="text-xs font-bold text-slate-500 text-center">Un code a été envoyé à {formData.email}</p>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm font-bold text-slate-600">
                  Déjà membre ?{' '}
                  <Link href="/login" className="font-black text-slate-900 hover:underline decoration-2 underline-offset-2">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>

            <div className="absolute bottom-4 right-8 text-xs font-black text-slate-300">Page 2</div>
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

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}













