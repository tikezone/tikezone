
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
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
  User,
  Crown,
  Ticket,
  Gift,
  Heart,
  Bell,
  Settings,
  ChevronRight,
  Calendar,
  MapPin,
  Clock,
  Zap,
  LayoutGrid,
  Eye,
  EyeOff,
  Smartphone,
  Globe,
  HelpCircle,
  FileText,
  MessageCircle,
  QrCode,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import DeleteAccountModal from '../../components/UI/DeleteAccountModal';

interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventImage?: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  qrCode?: string;
  purchaseDate: string;
}

type TabKey = 'profile' | 'tikeclub' | 'tickets' | 'security' | 'settings';

interface MenuItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function ProfilePage() {
  const { user, logout, isAuthenticated, login, isReady } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [ticketFilter, setTicketFilter] = useState<'upcoming' | 'past'>('upcoming');

  const loadBookings = useCallback(async () => {
    setBookingsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const data = localStorage.getItem('tikezone_bookings');
      if (data) {
        setBookings(JSON.parse(data));
      } else {
        setBookings([]);
      }
    } catch (e) {
      console.error("Erreur de chargement des tickets", e);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tickets') {
      loadBookings();
    }
  }, [activeTab, loadBookings]);

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

  const menuItems: MenuItem[] = [
    { key: 'profile', label: 'Mon Profil', icon: <User size={20} />, description: 'Informations personnelles' },
    { key: 'tikeclub', label: 'TikeClub', icon: <Crown size={20} />, description: 'Programme de fidélité' },
    { key: 'tickets', label: 'Mes Billets', icon: <Ticket size={20} />, description: 'Historique des réservations' },
    { key: 'security', label: 'Sécurité', icon: <Shield size={20} />, description: 'Mot de passe et connexion' },
    { key: 'settings', label: 'Paramètres', icon: <Settings size={20} />, description: 'Préférences du compte' },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group cursor-pointer" onClick={handlePhotoClick}>
            <div className="w-24 h-24 rounded-full border-2 border-white/20 bg-white/10 overflow-hidden flex items-center justify-center text-white font-black text-xl">
              {photoUrl ? (
                <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-2 rounded-full group-hover:scale-110 transition-transform shadow-lg">
              <Camera size={14} />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2">
              {isOrganizer ? 'Organisateur' : 'Membre Vérifié'}
            </div>
            <h2 className="text-2xl font-black text-white">{user.name}</h2>
            <div className="flex items-center justify-center sm:justify-start text-gray-400 text-sm gap-2 mt-1">
              <Mail size={14} />
              {user.email}
            </div>
          </div>

          {avatarUploading && (
            <div className="text-xs text-gray-400">Upload en cours...</div>
          )}
          {avatarError && (
            <div className="text-xs text-red-400">{avatarError}</div>
          )}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Accès rapide</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/my-events">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Calendar size={20} className="text-orange-400" />
              </div>
              <p className="text-white font-bold text-sm">Mes Événements</p>
              <p className="text-gray-500 text-xs">Voir mes réservations</p>
            </div>
          </Link>
          
          <Link href="/favorites">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Heart size={20} className="text-pink-400" />
              </div>
              <p className="text-white font-bold text-sm">Favoris</p>
              <p className="text-gray-500 text-xs">Événements sauvegardés</p>
            </div>
          </Link>
          
          <Link href="/notifications">
            <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Bell size={20} className="text-blue-400" />
              </div>
              <p className="text-white font-bold text-sm">Notifications</p>
              <p className="text-gray-500 text-xs">Alertes et messages</p>
            </div>
          </Link>
          
          <div 
            onClick={() => setActiveTab('tikeclub')}
            className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Crown size={20} className="text-yellow-400" />
            </div>
            <p className="text-white font-bold text-sm">TikeClub</p>
            <p className="text-gray-500 text-xs">{points} Vibes</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <LayoutGrid size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Espace Pro</h3>
              <p className="text-gray-500 text-xs">
                {isOrganizer ? 'Gérez vos événements' : 'Publiez vos événements'}
              </p>
            </div>
          </div>
          
          {isOrganizer ? (
            <Link href="/organizer">
              <button className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                <Zap size={16}/> Dashboard
              </button>
            </Link>
          ) : (
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
              disabled={upgradeLoading}
              onClick={handleUpgradeToOrganizer}
            >
              {upgradeLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <><Zap size={16}/> Devenir Pro</>
              )}
            </button>
          )}
        </div>
        {upgradeError && (
          <p className="text-xs text-red-400 mt-2">{upgradeError}</p>
        )}
      </div>
    </div>
  );

  const renderTikeClubTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-orange-400 bg-black/50 flex flex-col items-center justify-center shadow-lg shadow-orange-500/20">
            <Crown size={28} className="text-orange-400 fill-orange-400 mb-1" />
            <span className="text-[9px] font-black uppercase text-orange-400">{currentTier.name}</span>
          </div>

          <div className="flex-1 w-full text-center sm:text-left">
            <h3 className="text-2xl font-black text-white mb-1">TikeClub</h3>
            <p className="text-orange-400 font-bold text-lg">{points} Vibes</p>
            
            <div className="mt-3">
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {nextTier ? `Plus que ${vibesToNext} vibes pour ${nextTier.name}` : 'Niveau maximum atteint !'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Mes Avantages</h3>
        <div className="grid gap-3">
          {tiers.map((tier, index) => {
            const isUnlocked = points >= tier.min;
            const isCurrent = tier.name === currentTier.name;
            
            return (
              <div 
                key={tier.name}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  isCurrent 
                    ? 'bg-orange-500/10 border-orange-500/30' 
                    : isUnlocked 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/[0.02] border-white/5 opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isUnlocked ? 'bg-orange-500/20' : 'bg-white/5'
                }`}>
                  {isUnlocked ? (
                    <CheckCircle size={20} className="text-orange-400" />
                  ) : (
                    <Lock size={16} className="text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{tier.name}</p>
                    {isCurrent && (
                      <span className="text-[9px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">ACTUEL</span>
                    )}
                  </div>
                  <p className={`text-xs ${isUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>{tier.gift}</p>
                </div>
                <p className={`text-sm font-bold ${isUnlocked ? 'text-orange-400' : 'text-gray-600'}`}>{tier.min} pts</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Comment gagner des Vibes ?</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Ticket size={16} className="text-green-400" />
            </div>
            <span className="text-gray-300">Achetez un billet</span>
            <span className="ml-auto text-orange-400 font-bold">+50 vibes</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Gift size={16} className="text-blue-400" />
            </div>
            <span className="text-gray-300">Parrainez un ami</span>
            <span className="ml-auto text-orange-400 font-bold">+100 vibes</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Heart size={16} className="text-purple-400" />
            </div>
            <span className="text-gray-300">Laissez un avis</span>
            <span className="ml-auto text-orange-400 font-bold">+25 vibes</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTicketsTab = () => {
    const filteredBookings = bookings.filter(booking => {
      const eventDate = new Date(booking.eventDate);
      const now = new Date();
      if (ticketFilter === 'upcoming') return eventDate >= now;
      return eventDate < now;
    });

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setTicketFilter('upcoming')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                ticketFilter === 'upcoming' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              A venir
            </button>
            <button
              onClick={() => setTicketFilter('past')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                ticketFilter === 'past' 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Passés
            </button>
          </div>
          <button
            onClick={loadBookings}
            className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw size={16} className={bookingsLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {bookingsLoading ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket size={32} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {ticketFilter === 'upcoming' ? 'Aucun billet à venir' : 'Aucun billet passé'}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {ticketFilter === 'upcoming' 
                ? "Explorez les événements et réservez vos places !" 
                : "Vos anciens billets apparaîtront ici."}
            </p>
            {ticketFilter === 'upcoming' && (
              <Link href="/">
                <button className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                  Explorer <ArrowRight size={16} />
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row">
                  {booking.eventImage && (
                    <div className="sm:w-32 h-24 sm:h-auto shrink-0">
                      <img 
                        src={booking.eventImage} 
                        alt={booking.eventTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-white font-bold mb-1">{booking.eventTitle}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(booking.eventDate)}
                          </span>
                          {booking.eventLocation && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {booking.eventLocation}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-lg font-bold">
                            {booking.ticketType}
                          </span>
                          <span className="text-xs text-gray-500">
                            x{booking.quantity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {booking.qrCode && (
                          <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0">
                            <QrCode size={40} className="text-black" />
                          </div>
                        )}
                        <span className="text-orange-400 font-bold text-sm">
                          {booking.totalPrice.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/my-events">
            <button className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-bold transition-all">
              Voir tous les détails <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    );
  };

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Lock size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Modifier le mot de passe</h3>
            <p className="text-gray-500 text-xs">Gardez votre compte sécurisé</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Mot de passe actuel</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type={showCurrentPassword ? "text" : "password"}
                placeholder="••••••••"
                value={passwords.current}
                onChange={e => setPasswords({...passwords, current: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />
              <button 
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Nouveau mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type={showNewPassword ? "text" : "password"}
                placeholder="Minimum 6 caractères"
                value={passwords.new}
                onChange={e => setPasswords({...passwords, new: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="password"
                placeholder="Répéter le mot de passe"
                value={passwords.confirm}
                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Save size={18} /> Mettre à jour</>
            )}
          </button>

          {serverError && (
            <div className="flex items-center bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
              <AlertTriangle size={16} className="mr-2 shrink-0" />
              <span className="font-bold text-sm">{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl">
              <CheckCircle size={16} className="mr-2 shrink-0" />
              <span className="font-bold text-sm">{successMsg}</span>
            </div>
          )}
        </form>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <Smartphone size={20} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Sessions actives</h3>
            <p className="text-gray-500 text-xs">Gérez vos connexions</p>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">Session actuelle</p>
              <p className="text-gray-500 text-xs">Connecté maintenant</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Préférences</h3>
        </div>
        
        <div className="divide-y divide-white/5">
          <Link href="/notifications">
            <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Notifications</p>
                <p className="text-gray-500 text-xs">Gérer les alertes email et push</p>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </Link>
          
          <Link href="/faq">
            <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <HelpCircle size={20} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Aide & FAQ</p>
                <p className="text-gray-500 text-xs">Questions fréquentes</p>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </Link>
          
          <Link href="/terms">
            <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-gray-500/20 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Conditions d'utilisation</p>
                <p className="text-gray-500 text-xs">Mentions légales</p>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </Link>
          
          <Link href="/contact">
            <div className="flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold">Nous contacter</p>
                <p className="text-gray-500 text-xs">Support et assistance</p>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">Compte</h3>
        </div>
        
        <div className="divide-y divide-white/5">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-all cursor-pointer text-left"
          >
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <LogOut size={20} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">Se déconnecter</p>
              <p className="text-gray-500 text-xs">Fermer votre session</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            Zone de danger
          </h3>
        </div>
        
        <div className="p-6">
          <p className="text-gray-400 text-sm mb-4">
            La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
          </p>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-all"
          >
            <Trash2 size={16} /> Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'tikeclub': return renderTikeClubTab();
      case 'tickets': return renderTicketsTab();
      case 'security': return renderSecurityTab();
      case 'settings': return renderSettingsTab();
      default: return renderProfileTab();
    }
  };

  return (
    <MainLayout showAnnouncement={false}>
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        email={user.email}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleted={handleAccountDeleted}
      />

      <div className="min-h-screen bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black pointer-events-none"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 lg:py-10">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-black text-white">Mon Compte</h1>
            <p className="text-gray-500 mt-1">Gérez votre profil et vos préférences</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="hidden lg:block w-64 shrink-0">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2 sticky top-6">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === item.key 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                      activeTab === item.key 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' 
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-0 pb-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
