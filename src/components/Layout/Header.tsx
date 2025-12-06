'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '../../lib/safe-navigation';
import { User, Bell, Heart, Menu, X, Plus, LogOut, Ticket, ChevronDown } from 'lucide-react';
import Tooltip from '../UI/Tooltip';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import AuthWidget from '../Auth/AuthWidget';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; type: string; is_read: boolean; created_at: string }[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthWidget, setShowAuthWidget] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { favorites } = useFavorites();
  const { user, isAuthenticated, logout } = useAuth();

  const isOrganizer = user?.role === 'organizer';
  const publishTarget = isOrganizer ? '/publish' : isAuthenticated ? '/profile' : '/login';
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    };
    if (isNotifMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) setIsNotifMenuOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await fetch('/api/notifications?limit=10', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch {
      }
    };
    fetchNotifications();
  }, [isAuthenticated]);

  const markAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch {
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" className="flex items-center cursor-pointer group z-50">
            <span className="font-black tracking-tight text-white text-2xl sm:text-3xl hover:scale-105 transition-transform duration-300">
              TIKE<span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">ZONE</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={publishTarget}
              className="hidden md:flex items-center text-sm font-bold text-white rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 hover:scale-105 active:scale-95 transition-all duration-300 shadow-glow"
            >
              <Plus size={18} className="mr-2" strokeWidth={2.5} />
              Publier
            </Link>

            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <Tooltip content="Notifications" position="bottom">
                  <button
                    onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                    aria-label="Notifications"
                    className={`p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 relative ${isNotifMenuOpen ? 'bg-white/20' : ''}`}
                  >
                    <Bell size={18} className="text-white" strokeWidth={2} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </Tooltip>
                {isNotifMenuOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 bg-black/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-glass overflow-hidden animate-fade-in-up">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <span className="font-bold text-white text-sm flex items-center"><Bell size={14} className="mr-2 text-orange-500" /> Notifications</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <>
                            <span className="text-[10px] font-bold text-orange-500 bg-orange-500/20 px-2 py-1 rounded-full">{unreadCount} new</span>
                            <button onClick={markAllRead} className="text-[10px] font-bold text-gray-400 hover:text-white transition-colors">
                              Tout lire
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">Aucune notification</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex gap-3 items-start">
                              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-orange-500' : 'bg-gray-600'}`} />
                              <div>
                                <p className="text-sm font-medium text-white leading-snug">{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notif.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{notif.body}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && (
              <Tooltip content="Mes Tickets" position="bottom">
                <Link href="/my-events" className="hidden sm:flex p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
                  <Ticket size={18} className="text-white" strokeWidth={2} />
                </Link>
              </Tooltip>
            )}

            <div className="hidden sm:block">
              <Tooltip content="Mes Favoris" position="bottom">
                <Link href="/favorites">
                  <button className="p-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 relative">
                    <Heart size={18} className={favorites.length > 0 ? 'text-red-500 fill-current' : 'text-white'} strokeWidth={2} />
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </Link>
              </Tooltip>
            </div>

            {isAuthenticated && user ? (
              <Link href="/profile" className="flex items-center bg-white/10 backdrop-blur-xl border border-white/20 pl-1 pr-3 py-1 rounded-full hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-white hidden lg:block truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className="ml-1 text-gray-400" strokeWidth={2} />
              </Link>
            ) : (
              <button
                onClick={() => setShowAuthWidget(true)}
                className="flex items-center gap-2 p-1.5 pl-2 pr-4 bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 rounded-full hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white">
                  <User size={16} strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-white hidden md:block">Connexion</span>
              </button>
            )}

            <button
              className="md:hidden p-2.5 text-white bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 active:scale-95 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-20 left-4 right-4 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-glass-lg animate-fade-in-up max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Link href={publishTarget} onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-5 rounded-2xl active:scale-95 transition-all duration-300 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-glow">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-3">
                    <Plus size={24} strokeWidth={2} />
                  </div>
                  <span className="text-sm font-bold">Publier</span>
                </Link>

                {isAuthenticated ? (
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl active:scale-95 transition-all duration-300">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-3">
                      <LogOut size={24} className="text-red-500" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-bold text-white">Deconnexion</span>
                  </button>
                ) : (
                  <button onClick={() => { setIsMobileMenuOpen(false); setShowAuthWidget(true); }} className="flex flex-col items-center justify-center p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl active:scale-95 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                      <User size={24} className="text-blue-400" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-bold text-white">Connexion</span>
                  </button>
                )}
              </div>

              {isAuthenticated && user && (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mr-3 font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white">Mon Profil</span>
                </Link>
              )}

              <div className="space-y-2">
                {isAuthenticated && (
                  <Link href="/my-events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-2xl transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                      <Ticket size={18} className="text-green-400" strokeWidth={2} />
                    </div>
                    <span className="font-medium text-white">Mes Tickets</span>
                  </Link>
                )}

                <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 rounded-2xl transition-all duration-300">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                    <Heart size={18} className="text-pink-400" strokeWidth={2} />
                  </div>
                  <span className="font-medium text-white">Mes Favoris</span>
                  {favorites.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{favorites.length}</span>}
                </Link>
              </div>

              <div className="h-px bg-white/10 w-full" />

              <nav className="space-y-2">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 font-medium text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-2xl transition-all duration-300">Accueil</Link>
                <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 font-medium text-white bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-2xl transition-all duration-300">Comment ca marche</Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {showAuthWidget && (
        <AuthWidget onClose={() => setShowAuthWidget(false)} />
      )}
    </header>
  );
};

export default Header;