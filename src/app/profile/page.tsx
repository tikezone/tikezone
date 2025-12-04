
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
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  
  // Photo State (no default image; user must upload)
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Redirect after mount to avoid setState during render
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

  // Sync avatar from user data
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
        <div className="flex items-center justify-center min-h-[60vh] p-8">
          <p className="font-bold text-slate-600">Chargement...</p>
        </div>
      </MainLayout>
    );
  }

  // Handlers
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

  // Loyalty info (placeholder until backend provides real values)
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

      <div className="bg-slate-50 min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display uppercase tracking-tight">
              Mon Profil
            </h1>
            <p className="text-slate-500 font-bold mt-2">Gérez vos infos personnelles et votre sécurité.</p>
          </div>

          {/* 1. IDENTITY CARD */}
          <div className="relative bg-white rounded-[32px] border-4 border-black shadow-[10px_10px_0_#000] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 right-0 h-20 bg-yellow-300 border-b-4 border-black" />
              <div className="absolute -bottom-10 -right-8 w-32 h-32 bg-brand-200 rounded-full border-4 border-black opacity-40" />
              <div className="absolute -top-8 -left-10 w-28 h-28 bg-slate-200 rounded-full border-4 border-black opacity-40" />
            </div>
            <div className="relative grid md:grid-cols-[auto,1fr,auto] items-center gap-6 md:gap-10 p-6 md:p-10">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
                  <div className="w-32 h-32 rounded-full border-4 border-black bg-white overflow-hidden shadow-[6px_6px_0_#000] flex items-center justify-center text-slate-600 font-black text-2xl">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-full border-3 border-white shadow-sm group-hover:scale-110 transition-transform">
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
                    <p className="text-[10px] font-bold text-slate-500">Upload en cours...</p>
                  )}
                  {avatarError && (
                    <p className="text-[10px] font-bold text-red-500">{avatarError}</p>
                  )}
                </div>
              </div>

              {/* Info Text */}
              <div className="text-center md:text-left flex-1 mb-1">
                <div className={`inline-block text-white text-[11px] font-black px-3 py-1 rounded border-3 border-black uppercase mb-3 shadow-[4px_4px_0_#000] ${
                  isOrganizer ? 'bg-slate-900' : 'bg-slate-900'
                }`}>
                  {isOrganizer ? 'Organisateur' : 'Membre Vérifié'}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 font-display uppercase leading-tight drop-shadow-[3px_3px_0_#00000018]">
                  {user.name}
                </h2>
                <div className="flex items-center justify-center md:justify-start text-slate-700 font-bold gap-2 mt-3">
                  <Mail size={16} />
                  {user.email}
                </div>
              </div>

              {/* Edit Actions */}
              <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
                 <Button variant="white" className="py-2 px-4 text-xs shadow-[4px_4px_0_#000]" onClick={logout} icon={<LogOut size={14}/>}>
                    Déconnexion
                 </Button>
              </div>
            </div>
          </div>

          {/* 2. LOYALTY CARD (TIKECLUB) */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden border-4 border-black shadow-pop transform hover:-translate-y-1 transition-transform">
             {/* Background Effects */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl -mr-16 -mt-16 opacity-10"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl -ml-16 -mb-16 opacity-10"></div>
             <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>

             <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
                {/* Level Badge */}
                <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-black flex flex-col items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                    <Crown size={32} className="text-yellow-400 fill-yellow-400 mb-1" />
                    <span className="text-[10px] font-black uppercase text-yellow-400">{currentTier.name}</span>
                </div>

                <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-2xl font-black font-display uppercase">TikeClub</h3>
                        <span className="text-sm font-bold text-yellow-400">{points} Vibes</span>
                    </div>
                    
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10 mb-2">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-brand-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    
                    <p className="text-[10px] font-bold text-slate-400 text-right">
                       {nextTier ? `Plus que ${vibesToNext} vibes pour ${nextTier.name}` : 'Dernier niveau atteint !'}
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-white/10 rounded-xl p-2 text-center border border-white/10 w-28">
                        <Gift size={16} className="mx-auto mb-1 text-brand-300" />
                        <p className="text-[9px] font-black">Cadeau actuel</p>
                        <p className="text-[9px] text-slate-300">{currentTier.gift}</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-2 text-center border border-white/10 w-28">
                        <Ticket size={16} className="mx-auto mb-1 text-white" />
                        <p className="text-[9px] font-black">{nextTier ? 'Prochain cadeau' : 'Tous débloqués'}</p>
                        <p className="text-[9px] text-slate-300">{nextTier ? nextTier.gift : 'Rien à débloquer'}</p>
                    </div>
                </div>
             </div>
          </div>

          {/* 3. ORGANIZER DASHBOARD SHORTCUT / UPGRADE */}
          <div className="bg-white rounded-3xl border-4 border-black shadow-pop p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
              <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-brand-500 rounded-2xl border-2 border-black text-white flex items-center justify-center shadow-lg">
                      <LayoutGrid size={32} />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black font-display uppercase text-slate-900">Espace Pro</h3>
                      <p className="text-slate-500 text-sm font-bold">
                        {isOrganizer ? 'Gérez vos événements et ventes.' : 'Devenez organisateur pour publier vos événements.'}
                      </p>
                  </div>
              </div>
              {isOrganizer ? (
                <Link href="/organizer" className="relative z-10 w-full sm:w-auto">
                    <Button variant="secondary" className="w-full sm:w-auto bg-slate-900 text-white border-black hover:bg-slate-800" icon={<Zap size={18}/>}>
                        Accéder au Dashboard
                    </Button>
                </Link>
              ) : (
                <div className="relative z-10 w-full sm:w-auto flex flex-col gap-2 items-stretch sm:items-end">
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto bg-slate-900 text-white border-black hover:bg-slate-800"
                    icon={<Zap size={18}/>}
                    isLoading={upgradeLoading}
                    onClick={handleUpgradeToOrganizer}
                  >
                    Devenir organisateur
                  </Button>
                  {upgradeError && (
                    <p className="text-[10px] font-bold text-red-500 text-right">{upgradeError}</p>
                  )}
                </div>
              )}
          </div>

          {/* 4. SECURITY VAULT */}
          <div className="bg-white rounded-3xl border-4 border-black shadow-pop p-8 relative">
             <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-100 pb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl border-2 border-black flex items-center justify-center">
                    <Shield size={20} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 font-display uppercase">Sécurité</h3>
             </div>

             <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <Input 
                    type="password"
                    label="Mot de passe actuel"
                    placeholder="********"
                    icon={<Lock size={18}/>}
                    value={passwords.current}
                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        type="password"
                        label="Nouveau mot de passe"
                        placeholder="Min 6 caractères"
                        value={passwords.new}
                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                    />
                    <Input 
                        type="password"
                        label="Confirmer"
                        placeholder="Répéter"
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    />
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        isLoading={isLoading} 
                        variant="secondary"
                        icon={<Save size={18} />}
                    >
                        Mettre à jour
                    </Button>
                </div>

                {serverError && (
                    <div className="flex items-center bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 rounded-xl animate-in slide-in-from-bottom-2">
                        <span className="font-bold text-sm">{serverError}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="flex items-center bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 rounded-xl animate-in slide-in-from-bottom-2">
                        <CheckCircle size={20} className="mr-2" />
                        <span className="font-bold text-sm">{successMsg}</span>
                    </div>
                )}
             </form>
          </div>

          {/* 5. DANGER ZONE */}
          <div className="bg-red-50 rounded-3xl border-4 border-red-200 border-dashed p-8 relative opacity-90 hover:opacity-100 transition-opacity">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-black text-red-600 flex items-center mb-2 uppercase">
                        <AlertTriangle size={20} className="mr-2" /> Zone de danger
                    </h3>
                    <p className="text-sm font-bold text-red-400">
                        La suppression de votre compte est irréversible. Un code de confirmation sera envoyé par email.
                    </p>
                </div>
                <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-white text-red-600 border-2 border-red-200 hover:border-red-600 hover:bg-red-600 hover:text-white px-6 py-3 rounded-xl font-black text-sm transition-all shadow-sm flex items-center whitespace-nowrap"
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
