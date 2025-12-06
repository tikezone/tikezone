'use client';

import { useState } from 'react';

type AuthView = 'login' | 'register' | 'forgot';
type UserRole = 'client' | 'organizer';

interface AuthWidgetProps {
  onClose: () => void;
  initialView?: AuthView;
}

export default function AuthWidget({ onClose, initialView = 'login' }: AuthWidgetProps) {
  const [view, setView] = useState<AuthView>(initialView);
  const [role, setRole] = useState<UserRole>('client');
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [forgotData, setForgotData] = useState({ email: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setView('login');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[350px] rounded-[32px] p-6 border border-white/20 shadow-2xl bg-black/80 backdrop-blur-xl overflow-hidden transition-all duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300"
        >
          <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Bon retour !</h2>
              <p className="text-sm text-gray-400">Connectez-vous pour continuer</p>
            </div>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setView('forgot')}
              className="text-xs text-gray-400 hover:text-white hover:underline transition-all duration-300"
            >
              Mot de passe oublié ?
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>

            <p className="text-center text-sm text-gray-400">
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => setView('register')}
                className="text-white hover:underline transition-all duration-300"
              >
                S'inscrire
              </button>
            </p>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white mb-1">Créer un compte</h2>
              <p className="text-sm text-gray-400">Rejoignez la communauté</p>
            </div>

            <div className="p-1 bg-white/10 rounded-full flex mb-4">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  role === 'client'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Client
              </button>
              <button
                type="button"
                onClick={() => setRole('organizer')}
                className={`flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  role === 'organizer'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Organisateur
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom complet"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                required
              />
              <input
                type="password"
                placeholder="Mot de passe"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                required
              />
              <input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Création...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>

            <p className="text-center text-sm text-gray-400">
              Déjà un compte ?{' '}
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-white hover:underline transition-all duration-300"
              >
                Se connecter
              </button>
            </p>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Mot de passe oublié</h2>
              <p className="text-sm text-gray-400">Entrez votre email pour réinitialiser</p>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={forgotData.email}
              onChange={(e) => setForgotData({ email: e.target.value })}
              className="w-full px-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-all duration-300"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:shadow-lg hover:shadow-white/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Envoi...
                </span>
              ) : (
                'Envoyer le lien'
              )}
            </button>

            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full text-center text-sm text-gray-400 hover:text-white transition-all duration-300"
            >
              ← Retour à la connexion
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
