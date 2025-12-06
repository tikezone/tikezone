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
    <header className={`sticky top-0 z-50 bg-white border-b-4 border-black transition-all ${isScrolled ? 'py-2 shadow-pop' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center cursor-pointer group z-50 mr-8">
            <span className="font-display font-black tracking-tight text-slate-900 text-3xl sm:text-4xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:drop-shadow-[3px_3px_0_rgba(0,0,0,1)] transition-all duration-200">
              TIKE<span className="text-brand-500">ZONE</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Publish */}
            <Link
              href={publishTarget}
              className="hidden md:flex items-center text-sm font-black text-white rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all duration-200 bg-brand-500 px-5 py-2.5 uppercase tracking-wide"
            >
              <Plus size={20} className="mr-2" strokeWidth={3} />
              Publier un evenement
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <Tooltip content="Notifications" position="bottom">
                  <button
                    onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                    aria-label="Notifications"
                    className={`p-2.5 bg-white border-2 border-black rounded-full hover:bg-yellow-100 transition-all relative shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${isNotifMenuOpen ? 'bg-yellow-100 shadow-none translate-x-[2px] translate-y-[2px]' : ''}`}
                  >
                    <Bell size={20} strokeWidth={2.5} />
                  </button>
                </Tooltip>
                {isNotifMenuOpen && (
                  <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl border-4 border-black shadow-pop overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="p-3 border-b-2 border-black bg-slate-900 text-white flex justify-between items-center">
                        <span className="font-black text-sm uppercase flex items-center"><Bell size={14} className="mr-2" /> Activite</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-900 bg-white px-2 py-0.5 rounded uppercase tracking-wide">{unreadCount} New</span>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[9px] font-black bg-white text-slate-900 px-2 py-0.5 rounded border border-white hover:bg-slate-100">
                              Tout lire
                            </button>
                          )}
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto bg-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs font-bold text-slate-500">Aucune notification</div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-3 border-b border-slate-200 hover:bg-white transition-colors cursor-pointer group">
                              <div className="flex gap-3 items-start">
                                  <div className={`mt-1 w-2 h-2 rounded-full border border-black shrink-0 ${!notif.is_read ? 'bg-brand-500' : 'bg-slate-300'}`}></div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-900 leading-snug group-hover:text-brand-600 transition-colors">{notif.title}</p>
                                      <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wide">
                                        {new Date(notif.created_at).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                      </p>
                                      <p className="text-[11px] font-medium text-slate-600 mt-1 leading-tight">{notif.body}</p>
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

            {/* Tickets */}
            {isAuthenticated && (
              <Tooltip content="Mes Tickets" position="bottom">
                <Link href="/my-events" className="hidden sm:flex p-2.5 bg-white border-2 border-black rounded-full hover:bg-green-100 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                  <Ticket size={20} strokeWidth={2.5} />
                </Link>
              </Tooltip>
            )}

            {/* Favorites */}
            <div className="hidden sm:block">
              <Tooltip content="Mes Favoris" position="bottom">
                <Link href="/favorites">
                  <button className="p-2.5 bg-white border-2 border-black rounded-full hover:bg-pink-100 transition-all relative group shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                    <Heart size={20} strokeWidth={2.5} className={favorites.length > 0 ? 'text-red-500 fill-current' : ''} />
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </Link>
              </Tooltip>
            </div>

            {/* Profile / Login */}
            {isAuthenticated && user ? (
              <Link href="/profile" className="flex items-center bg-yellow-300 pl-1 pr-4 py-1 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer group ml-2">
                <div className="w-8 h-8 bg-white rounded-full border-2 border-black flex items-center justify-center text-xs font-black mr-2 group-hover:scale-110 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-black text-slate-900 hidden lg:block truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className="ml-1 text-black opacity-50" strokeWidth={3} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 p-1.5 pl-2 pr-4 bg-white hover:bg-slate-50 rounded-full border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ml-2"
              >
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-black uppercase tracking-wide hidden md:block">Connexion</span>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2.5 ml-1 text-black bg-white border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-[88px] left-2 right-2 bg-white border-4 border-black rounded-3xl shadow-pop-lg animate-in slide-in-from-top-5 duration-300 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Link href={publishTarget} onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 border-2 border-black shadow-pop-sm transition-transform bg-brand-500 text-white">
                  <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center mb-2 bg-white text-brand-600">
                    <Plus size={24} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-black uppercase">Publier</span>
                </Link>

                {isAuthenticated ? (
                  <button onClick={logout} className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-2xl active:scale-95 border-2 border-black shadow-pop-sm transition-transform group">
                    <div className="w-12 h-12 bg-white border-2 border-black text-red-600 rounded-full flex items-center justify-center mb-2">
                      <LogOut size={24} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-slate-900 uppercase">Deconnexion</span>
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-2xl active:scale-95 border-2 border-black shadow-pop-sm transition-transform group">
                    <div className="w-12 h-12 bg-white border-2 border-black text-blue-600 rounded-full flex items-center justify-center mb-2">
                      <User size={24} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-slate-900 uppercase">Connexion</span>
                  </Link>
                )}
              </div>

              {isAuthenticated && user && (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 bg-yellow-300 border-2 border-black rounded-xl mb-2 hover:bg-yellow-400 transition-colors shadow-sm">
                  <div className="w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center mr-3 font-black text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-black text-slate-900 uppercase tracking-wide">Mon Profil</span>
                </Link>
              )}

              {isAuthenticated && (
                <Link href="/my-events" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 bg-white border-2 border-black hover:bg-slate-50 rounded-xl transition-colors w-full text-left shadow-pop-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                  <div className="w-8 h-8 rounded-full bg-green-200 border-2 border-black flex items-center justify-center mr-3 text-black">
                    <Ticket size={18} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-slate-900">Mes Tickets</span>
                </Link>
              )}

              <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 bg-white border-2 border-black hover:bg-slate-50 rounded-xl transition-colors w-full text-left shadow-pop-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                <div className="w-8 h-8 rounded-full bg-pink-200 border-2 border-black flex items-center justify-center mr-3 text-black">
                  <Heart size={18} strokeWidth={2.5} />
                </div>
                <span className="font-bold text-slate-900">Mes Favoris</span>
                {favorites.length > 0 && <span className="ml-auto bg-red-500 text-white border-2 border-black text-xs font-black px-2 py-0.5 rounded-full">{favorites.length}</span>}
              </Link>

              <div className="h-px bg-slate-200 w-full" />

              <nav className="space-y-2">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 font-black text-slate-900 bg-slate-50 border-2 border-transparent hover:border-black hover:bg-white rounded-xl transition-all uppercase text-sm">Accueil</Link>
                <Link href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 font-black text-slate-900 bg-slate-50 border-2 border-transparent hover:border-black hover:bg-white rounded-xl transition-all uppercase text-sm">Tous les evenements</Link>
                <Link href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 font-black text-slate-900 bg-slate-50 border-2 border-transparent hover:border-black hover:bg-white rounded-xl transition-all uppercase text-sm">Comment ca marche</Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
