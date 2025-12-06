
'use client';

import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../lib/safe-navigation';
import { 
  Camera, 
  Mail, 
  Lock, 
  Save, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Shield,
  LogOut,
  LayoutGrid,
  Zap,
  Crown,
  Ticket,
  Gift
} from 'lucide-react';
import DeleteAccountModal from '../../components/UI/DeleteAccountModal';

export default function ProfilePage() {
  const { user, logout, isAuthenticated, login, isReady } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router, isReady]);

  const safeUser = user || { name: 'User', role: 'user', email: '' };
  const isOrganizer = safeUser.role === 'organizer';
  const initials = (safeUser.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  useEffect(() => {
    if (user?.avatarUrl) {
      setPhotoUrl(user.avatarUrl);
    } else {
      setPhotoUrl('');
    }
  }, [user?.avatarUrl]);

  if (!isReady || !isAuthenticated || !user) {
    return (
      <MainLayout showAnnouncement={false}>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('Image trop lourde (max 5Mo)');
        return;
      }

      const previous = photoUrl;
      const previewUrl = URL.createObjectURL(file);
      setPhotoUrl(previewUrl);
      setAvatarError(null);
      setAvatarUploading(true);

      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/profile/avatar', { method: 'POST', body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.url) {
          setPhotoUrl(previous);
          throw new Error(data.error || 'Upload impossible');
        }
        setPhotoUrl(data.url);
        if (login && user) {
          login({ ...user, avatarUrl: data.url });
        }
      } catch (err: any) {
        setAvatarError(err?.message || 'Upload impossible');
      } finally {
        setAvatarUploading(false);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setServerError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (passwords.new.length < 6) {
      setServerError("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }

    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword: passwords.current, newPassword: passwords.new }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setServerError(body.error || "Impossible de mettre à jour le mot de passe.");
      } else {
        setSuccessMsg("Mot de passe mis à jour avec succès !");
        setPasswords({ current: '', new: '', confirm: '' });
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      setServerError(err?.message || "Erreur réseau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeleted = async () => {
    setIsDeleteModalOpen(false);
    await logout();
  };

  const handleUpgradeToOrganizer = async () => {
    setUpgradeError(null);
    setUpgradeLoading(true);
    try {
      const res = await fetch('/api/auth/upgrade-to-organizer', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.user) {
        throw new Error(data.error || 'Impossible de basculer en organisateur');
      }
      if (login) login({ ...user, role: 'organizer' });
      router.push('/organizer');
    } catch (err: any) {
      setUpgradeError(err?.message || 'Impossible de basculer en organisateur');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const points = (user as any)?.points ?? 0;
  const tiers = [
    { name: 'Bronze', min: 0, gift: 'Badge Bronze + tirage surprise' },
    { name: 'Argent', min: 500, gift: '5% de réduction sur un ticket' },
    { name: 'Gold', min: 1000, gift: 'Accès anticipé aux ventes' },
    { name: 'Platinum', min: 2000, gift: 'Upgrade VIP sur un ticket' },
  ];
  const currentTier = tiers.reduce((acc, tier) => (points >= tier.min ? tier : acc), tiers[0]);
  const nextTier = tiers.find((tier) => tier.min > points) || null;
  const tierFloor = currentTier.min;
  const tierCeil = nextTier?.min ?? currentTier.min + 1;
  const progress = Math.min(100, ((points - tierFloor) / (tierCeil - tierFloor)) * 100);
  const vibesToNext = Math.max(0, (nextTier?.min ?? points) - points);

  return (
    <MainLayout showAnnouncement={false}>
      
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        email={user.email}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={handleAccountDeleted}
      />

      <div className="min-h-screen bg-black relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-white font-display uppercase tracking-tight">
              Mon Profil
            </h1>
            <p className="text-gray-400 font-bold mt-2">Gérez vos infos personnelles et votre sécurité.</p>
          </div>

          <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-orange-500/30 to-orange-600/30" />
              <div className="absolute -bottom-10 -right-8 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl" />
            </div>
            <div className="relative grid md:grid-cols-[auto,1fr,auto] items-center gap-6 md:gap-10 p-6 md:p-10">
              <div className="flex flex-col items-center gap-2">
                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                  <div className="w-32 h-32 rounded-full border-2 border-white/30 bg-white/10 overflow-hidden flex items-center justify-center text-white font-black text-2xl">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-full group-hover:scale-110 transition-transform">
                    <Camera size={18} />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="min-w-[200px] text-center">
                  {avatarUploading && (
                    <p className="text-[10px] font-bold text-gray-400">Upload en cours...</p>
                  )}
                  {avatarError && (
                    <p className="text-[10px] font-bold text-red-400">{avatarError}</p>
                  )}
                </div>
              </div>

              <div className="text-center md:text-left flex-1 mb-1">
                <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase mb-3">
                  {isOrganizer ? 'Organisateur' : 'Membre Vérifié'}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white font-display uppercase leading-tight">
                  {user.name}
                </h2>
                <div className="flex items-center justify-center md:justify-start text-gray-300 font-bold gap-2 mt-3">
                  <Mail size={16} />
                  {user.email}
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
                 <button 
                    onClick={logout}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all border border-white/10"
                 >
                    <LogOut size={14}/> Déconnexion
                 </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-6 text-white relative overflow-hidden border border-white/20">
             <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

             <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full border-2 border-orange-400 bg-black/50 flex flex-col items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                    <Crown size={32} className="text-orange-400 fill-orange-400 mb-1" />
                    <span className="text-[10px] font-black uppercase text-orange-400">{currentTier.name}</span>
                </div>

                <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl font-black font-display uppercase">TikeClub</h3>
                        <span className="text-sm font-bold text-orange-400">{points} Vibes</span>
                    </div>
                    
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 mb-2">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    <p className="text-[10px] font-bold text-gray-400 text-right">
                       {nextTier ? `Plus que ${vibesToNext} vibes pour ${nextTier.name}` : 'Dernier niveau atteint !'}
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-white/10 rounded-xl p-2 text-center border border-white/10 w-28">
                        <Gift size={16} className="mx-auto mb-1 text-orange-400" />
                        <p className="text-[9px] font-black">Cadeau actuel</p>
                        <p className="text-[9px] text-gray-400">{currentTier.gift}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2 text-center border border-white/10 w-28">
                        <Ticket size={16} className="mx-auto mb-1 text-white" />
                        <p className="text-[9px] font-black">{nextTier ? 'Prochain cadeau' : 'Tous débloqués'}</p>
                        <p className="text-[9px] text-gray-400">{nextTier ? nextTier.gift : 'Rien à débloquer'}</p>
                    </div>
                </div>
             </div>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <LayoutGrid size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black font-display uppercase text-white">Espace Pro</h3>
                      <p className="text-gray-400 text-sm font-bold">
                        {isOrganizer ? 'Gérez vos événements et ventes.' : 'Devenez organisateur pour publier vos événements.'}
                      </p>
                  </div>
              </div>
              {isOrganizer ? (
                <Link href="/organizer" className="relative z-10 w-full sm:w-auto">
                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                        <Zap size={18}/> Accéder au Dashboard
                    </button>
                </Link>
              ) : (
                <div className="relative z-10 w-full sm:w-auto flex flex-col gap-2 items-stretch sm:items-end">
                  <button
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
                    disabled={upgradeLoading}
                    onClick={handleUpgradeToOrganizer}
                  >
                    {upgradeLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <><Zap size={18}/> Devenir organisateur</>
                    )}
                  </button>
                  {upgradeError && (
                    <p className="text-[10px] font-bold text-red-400 text-right">{upgradeError}</p>
                  )}
                </div>
              )}
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 p-8 relative">
             <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-black text-white font-display uppercase">Sécurité</h3>
             </div>

             <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input 
                      type="password"
                      placeholder="********"
                      value={passwords.current}
                      onChange={e => setPasswords({...passwords, current: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Nouveau mot de passe</label>
                      <input 
                        type="password"
                        placeholder="Min 6 caractères"
                        value={passwords.new}
                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Confirmer</label>
                      <input 
                        type="password"
                        placeholder="Répéter"
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/10 disabled:opacity-50"
                    >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <><Save size={18} /> Mettre à jour</>
                        )}
                    </button>
                </div>

                {serverError && (
                    <div className="flex items-center bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
                        <span className="font-bold text-sm">{serverError}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="flex items-center bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
                        <CheckCircle size={20} className="mr-2" />
                        <span className="font-bold text-sm">{successMsg}</span>
                    </div>
                )}
             </form>
          </div>

          <div className="bg-red-500/10 backdrop-blur-2xl rounded-3xl border border-red-500/30 p-8 relative">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-black text-red-400 flex items-center mb-2 uppercase">
                        <AlertTriangle size={20} className="mr-2" /> Zone de danger
                    </h3>
                    <p className="text-sm font-bold text-red-400/70">
                        La suppression de votre compte est irréversible. Un code de confirmation sera envoyé par email.
                    </p>
                </div>
                <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl font-black text-sm transition-all flex items-center whitespace-nowrap"
                >
                    <Trash2 size={16} className="mr-2" /> Supprimer mon compte
                </button>
             </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
