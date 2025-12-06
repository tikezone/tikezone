'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '../../lib/safe-navigation';
import { User, Bell, Heart, Menu, X, Plus, LogOut, Ticket, ChevronDown } from 'lucide-react';
import Tooltip from '../UI/Tooltip';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; type: string; is_read: boolean; created_at: string }[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        // ignore
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
      // ignore
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center cursor-pointer group z-50 mr-8">
            <span className="font-display font-black tracking-tight text-white text-2xl sm:text-3xl transition-all duration-300">
              TIKE<span className="text-brand-500">ZONE</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href={publishTarget}
              className="hidden md:flex items-center text-sm font-bold text-white rounded-xl transition-all duration-300 bg-brand-500 hover:bg-brand-600 px-5 py-2.5 hover:scale-105 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40"
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
                    className={`p-2.5 rounded-xl transition-all duration-300 relative ${isNotifMenuOpen ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <Bell size={20} strokeWidth={2} className="text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </Tooltip>
                {isNotifMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <span className="font-bold text-white text-sm flex items-center"><Bell size={14} className="mr-2 text-brand-400" /> Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs font-bold text-brand-400 hover:text-brand-300">
                          Tout marquer lu
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-white/40">Aucune notification</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                            <div className="flex gap-3 items-start">
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-brand-500' : 'bg-white/20'}`}></div>
                              <div>
                                <p className="text-sm font-bold text-white leading-snug">{notif.title}</p>
                                <p className="text-xs text-white/40 mt-1">{new Date(notif.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</p>
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
                <Link href="/my-events" className="hidden sm:flex p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300">
                  <Ticket size={20} strokeWidth={2} className="text-white" />
                </Link>
              </Tooltip>
            )}

            <div className="hidden sm:block">
              <Tooltip content="Mes Favoris" position="bottom">
                <Link href="/favorites">
                  <button className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 relative">
                    <Heart size={20} strokeWidth={2} className={favorites.length > 0 ? 'text-brand-400 fill-current' : 'text-white'} />
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </Link>
              </Tooltip>
            </div>

            {isAuthenticated && user ? (
              <Link href="/profile" className="flex items-center bg-white/10 hover:bg-white/20 pl-1 pr-3 py-1 rounded-full transition-all duration-300 cursor-pointer group ml-1">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-white hidden lg:block truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className="ml-1 text-white/50" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
              >
                <User size={18} className="text-white" />
                <span className="text-sm font-bold text-white hidden md:block">Connexion</span>
              </Link>
            )}

            <button
              className="md:hidden p-2.5 text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-20 left-4 right-4 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Link href={publishTarget} onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                  <Plus size={24} className="mb-2" />
                  <span className="text-sm font-bold">Publier</span>
                </Link>

                {isAuthenticated ? (
                  <button onClick={logout} className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                    <LogOut size={24} className="text-white mb-2" />
                    <span className="text-sm font-bold text-white">Deconnexion</span>
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                    <User size={24} className="text-white mb-2" />
                    <span className="text-sm font-bold text-white">Connexion</span>
                  </Link>
                )}
              </div>

              {isAuthenticated && user && (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mr-3 font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-white">Mon Profil</span>
                </Link>
              )}

              <div className="border-t border-white/10 pt-4 space-y-2">
                {isAuthenticated && (
                  <Link href="/my-events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <Ticket size={20} className="text-brand-400 mr-3" />
                    <span className="font-bold text-white">Mes Tickets</span>
                  </Link>
                )}
                <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <Heart size={20} className="text-brand-400 mr-3" />
                  <span className="font-bold text-white">Mes Favoris</span>
                  {favorites.length > 0 && <span className="ml-auto bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{favorites.length}</span>}
                </Link>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-1">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Accueil</Link>
                <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 font-bold text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-colors">Comment ca marche</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
