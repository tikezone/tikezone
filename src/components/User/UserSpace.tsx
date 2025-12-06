'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../UI/GlassCard';
import { 
  X, 
  Ticket, 
  LayoutDashboard, 
  LogOut, 
  User, 
  Pencil, 
  Settings, 
  Star, 
  ArrowLeft, 
  Camera,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserSpaceProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWallet?: () => void;
}

const UserSpace: React.FC<UserSpaceProps> = ({ isOpen, onClose, onOpenWallet }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [dashboardView, setDashboardView] = useState<'home' | 'profile' | 'settings'>('home');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        login(data.user);
        setProfileData({ name: data.user.name, email: data.user.email });
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const ClientHeader = () => (
    <div className="relative h-64 w-full bg-gradient-to-br from-orange-600/20 via-black to-black border-b border-white/10 flex flex-col justify-end p-8">
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors z-20"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="flex items-end gap-6 z-10">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-orange-500 to-purple-600">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-3xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-white text-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-2">
          <h1 className="text-4xl font-black text-white tracking-tight">{user?.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/5 text-xs font-bold uppercase tracking-wider text-orange-400">
              {user?.role === 'organizer' ? 'Organisateur' : 'Membre VIP'}
            </span>
            <span className="flex items-center gap-1 text-sm text-yellow-400 font-bold">
              <Star className="w-4 h-4 fill-current" /> 250 Points
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardHome = () => (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="col-span-1 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <GlassCard className="p-4 rounded-3xl flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-black text-white">0</span>
          <span className="text-xs text-gray-500 font-bold uppercase">Tickets</span>
        </GlassCard>
        <GlassCard className="p-4 rounded-3xl flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-black text-white">250</span>
          <span className="text-xs text-gray-500 font-bold uppercase">Points</span>
        </GlassCard>
        <GlassCard className="p-4 rounded-3xl flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-black text-white">0</span>
          <span className="text-xs text-gray-500 font-bold uppercase">Coupons</span>
        </GlassCard>
        <GlassCard className="p-4 rounded-3xl flex flex-col items-center justify-center gap-1">
          <span className="text-3xl font-black text-white">CI</span>
          <span className="text-xs text-gray-500 font-bold uppercase">Pays</span>
        </GlassCard>
      </div>

      <GlassCard 
        onClick={onOpenWallet}
        className="h-40 rounded-[32px] p-6 flex flex-col justify-between cursor-pointer group bg-gradient-to-br from-blue-900/20 to-transparent hover:from-blue-900/40 border-blue-500/20"
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
          <Ticket className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">Mes Tickets</h3>
          <p className="text-sm text-blue-200/60">Gérez vos entrées et QR codes</p>
        </div>
      </GlassCard>

      <GlassCard 
        onClick={() => setDashboardView('profile')}
        className="h-40 rounded-[32px] p-6 flex flex-col justify-between cursor-pointer group bg-gradient-to-br from-purple-900/20 to-transparent hover:from-purple-900/40 border-purple-500/20"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">Mon Profil</h3>
          <p className="text-sm text-purple-200/60">Informations personnelles</p>
        </div>
      </GlassCard>

      {user?.role === 'organizer' && (
        <GlassCard className="h-40 rounded-[32px] p-6 flex flex-col justify-between cursor-pointer group bg-gradient-to-br from-orange-900/20 to-transparent hover:from-orange-900/40 border-orange-500/20">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">Organisateur</h3>
            <p className="text-sm text-orange-200/60">Gérer mes événements</p>
          </div>
        </GlassCard>
      )}

      <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-white/10 flex justify-center">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold px-6 py-3 rounded-xl hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );

  const ProfileView = () => (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in-up">
      <button onClick={() => setDashboardView('home')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Retour
      </button>

      <div className="bg-white/5 border border-white/10 rounded-[32px] p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">Informations Personnelles</h2>
          {!isEditingProfile && (
            <button onClick={() => setIsEditingProfile(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Pencil className="w-5 h-5 text-white" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nom Complet</label>
            {isEditingProfile ? (
              <input 
                type="text" 
                value={profileData.name || user?.name}
                onChange={e => setProfileData({...profileData, name: e.target.value})}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              />
            ) : (
              <p className="text-lg text-white font-medium">{user?.name}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email</label>
            {isEditingProfile ? (
              <input 
                type="email" 
                value={profileData.email || user?.email}
                onChange={e => setProfileData({...profileData, email: e.target.value})}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
              />
            ) : (
              <p className="text-lg text-white font-medium">{user?.email}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Rôle</label>
            <p className="text-lg text-gray-400 font-medium capitalize">{user?.role}</p>
          </div>

          {isEditingProfile && (
            <div className="flex gap-4 pt-4">
              <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-orange-500 hover:text-white transition-all">
                Enregistrer
              </button>
              <button onClick={() => setIsEditingProfile(false)} className="px-6 py-3 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all">
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isAuthenticated && user) {
    return (
      <div className="fixed inset-0 z-[80] bg-[#050505] overflow-y-auto animate-fade-in-up">
        <ClientHeader />
        {dashboardView === 'home' && <DashboardHome />}
        {dashboardView === 'profile' && <ProfileView />}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity" 
        onClick={onClose}
      />
      
      <GlassCard intensity="high" className="relative w-full max-w-[400px] rounded-[32px] p-8 overflow-hidden border border-white/20 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/20 transition-colors z-20"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {view === 'login' ? 'Connexion' : view === 'register' ? 'Inscription' : 'Mot de passe oublié'}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {view === 'login' ? 'Accédez à votre espace TIKEZONE' : view === 'register' ? 'Créez votre compte gratuitement' : 'Réinitialisez votre mot de passe'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {view === 'register' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Nom complet"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {view !== 'forgot-password' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Chargement...' : view === 'login' ? 'Se connecter' : view === 'register' ? "S'inscrire" : 'Réinitialiser'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {view === 'login' && (
            <>
              <button onClick={() => setView('forgot-password')} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                Mot de passe oublié ?
              </button>
              <p className="text-sm text-gray-500">
                Pas encore de compte ?{' '}
                <button onClick={() => setView('register')} className="text-orange-400 font-bold hover:text-orange-300 transition-colors">
                  S'inscrire
                </button>
              </p>
            </>
          )}
          {view === 'register' && (
            <p className="text-sm text-gray-500">
              Déjà un compte ?{' '}
              <button onClick={() => setView('login')} className="text-orange-400 font-bold hover:text-orange-300 transition-colors">
                Se connecter
              </button>
            </p>
          )}
          {view === 'forgot-password' && (
            <button onClick={() => setView('login')} className="text-sm text-orange-400 font-bold hover:text-orange-300 transition-colors">
              Retour à la connexion
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default UserSpace;
