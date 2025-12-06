'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '../../lib/safe-navigation';
import { User, Bell, Heart, Menu, X, Plus, LogOut, Ticket, ChevronDown, Search, Globe, Sun, Moon, HelpCircle, Users, Compass, Info } from 'lucide-react';
import Tooltip from '../UI/Tooltip';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; type: string; is_read: boolean; created_at: string }[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
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

  const navItems = [
    { label: 'Explorer', href: '/explore', icon: <Compass size={18} strokeWidth={2.5} /> },
    { label: 'Mes tickets', href: '/my-events', icon: <Ticket size={18} strokeWidth={2.5} />, authRequired: true },
    { label: 'Organisateurs', href: '/publish', icon: <Users size={18} strokeWidth={2.5} /> },
    { label: 'Comment ça marche', href: '/how-it-works', icon: <Info size={18} strokeWidth={2.5} /> },
    { label: 'Support', href: '/support', icon: <HelpCircle size={18} strokeWidth={2.5} /> },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-white border-b-4 border-black transition-all ${isScrolled ? 'py-2 shadow-pop' : 'py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center cursor-pointer group z-50">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-400 via-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300" />
              <span className="relative font-display font-black tracking-tight text-2xl sm:text-3xl">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]">TIKE</span>
                <span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent drop-shadow-[2px_2px_0_rgba(0,0,0,0.3)]">ZONE</span>
                <span className="absolute -top-1 -right-3 text-xs">✨</span>
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-yellow-100 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-0.5"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-black rounded-xl text-xs font-black uppercase tracking-wide hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
            >
              <Globe size={14} strokeWidth={3} className="text-blue-600" />
              <span>{language.toUpperCase()}</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden sm:flex p-2.5 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-black rounded-xl hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
              title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {isDarkMode ? (
                <Moon size={18} strokeWidth={2.5} className="text-indigo-600" />
              ) : (
                <Sun size={18} strokeWidth={2.5} className="text-amber-500" />
              )}
            </button>

            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <Tooltip content="Notifications" position="bottom">
                  <button
                    onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                    aria-label="Notifications"
                    className={`p-2.5 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-black rounded-xl hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all relative ${isNotifMenuOpen ? 'shadow-[2px_2px_0_rgba(0,0,0,1)] -translate-y-0.5' : ''}`}
                  >
                    <Bell size={18} strokeWidth={2.5} className="text-purple-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </Tooltip>
                {isNotifMenuOpen && (
                  <div className="absolute top-full right-0 mt-4 w-80 bg-white rounded-2xl border-4 border-black shadow-pop overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="p-3 border-b-2 border-black bg-gradient-to-r from-purple-500 to-pink-500 text-white flex justify-between items-center">
                      <span className="font-black text-sm uppercase flex items-center"><Bell size={14} className="mr-2" /> Activite</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-purple-600 bg-white px-2 py-0.5 rounded-full">{unreadCount} New</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[9px] font-black bg-white text-purple-600 px-2 py-0.5 rounded-full border border-white hover:bg-purple-50">
                            Tout lire
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto bg-gradient-to-b from-purple-50 to-white">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <div className="text-4xl mb-2">🔔</div>
                          <div className="text-xs font-bold text-slate-500">Aucune notification</div>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className="p-3 border-b border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer group">
                            <div className="flex gap-3 items-start">
                              <div className={`mt-1 w-3 h-3 rounded-full border-2 border-black shrink-0 ${!notif.is_read ? 'bg-brand-500' : 'bg-slate-200'}`}></div>
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

            <div className="hidden sm:block">
              <Tooltip content="Mes Favoris" position="bottom">
                <Link href="/favorites">
                  <button className="p-2.5 bg-gradient-to-r from-pink-100 to-red-100 border-2 border-black rounded-xl hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all relative group">
                    <Heart size={18} strokeWidth={2.5} className={favorites.length > 0 ? 'text-red-500 fill-current' : 'text-red-400'} />
                    {favorites.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                </Link>
              </Tooltip>
            </div>

            {!isAuthenticated && (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-black rounded-xl text-sm font-bold hover:bg-slate-50 hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
              >
                <User size={18} strokeWidth={2.5} />
                <span>Se connecter</span>
              </Link>
            )}

            <Link
              href={publishTarget}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white border-2 border-black rounded-xl text-sm font-black uppercase tracking-wide shadow-[3px_3px_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Créer un événement</span>
            </Link>

            {isAuthenticated && user && (
              <Link href="/profile" className="hidden md:flex items-center bg-gradient-to-r from-yellow-300 to-amber-300 pl-1 pr-4 py-1 rounded-xl border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="w-8 h-8 bg-white rounded-xl border-2 border-black flex items-center justify-center text-xs font-black mr-2 group-hover:scale-110 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-black text-slate-900 hidden lg:block truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className="ml-1 text-black opacity-50" strokeWidth={3} />
              </Link>
            )}

            <button
              className="lg:hidden p-2.5 text-black bg-gradient-to-r from-orange-100 to-yellow-100 border-2 border-black rounded-xl shadow-[2px_2px_0_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} strokeWidth={3} /> : <Menu size={22} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="absolute top-[80px] left-3 right-3 bg-gradient-to-b from-white to-yellow-50 border-4 border-black rounded-3xl shadow-pop-lg animate-in slide-in-from-top-5 duration-300 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Link href={publishTarget} onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 rounded-2xl active:scale-95 border-3 border-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-transform bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <div className="w-12 h-12 border-2 border-black rounded-xl flex items-center justify-center mb-2 bg-white text-brand-600">
                    <Plus size={24} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-black uppercase">Créer</span>
                </Link>

                {isAuthenticated ? (
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl active:scale-95 border-3 border-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-transform group">
                    <div className="w-12 h-12 bg-white border-2 border-black text-red-600 rounded-xl flex items-center justify-center mb-2">
                      <LogOut size={24} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-slate-900 uppercase">Déconnexion</span>
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl active:scale-95 border-3 border-black shadow-[3px_3px_0_rgba(0,0,0,1)] transition-transform group">
                    <div className="w-12 h-12 bg-white border-2 border-black text-blue-600 rounded-xl flex items-center justify-center mb-2">
                      <User size={24} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-slate-900 uppercase">Connexion</span>
                  </Link>
                )}
              </div>

              {isAuthenticated && user && (
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 bg-gradient-to-r from-yellow-200 to-amber-200 border-3 border-black rounded-xl hover:bg-yellow-300 transition-colors shadow-[2px_2px_0_rgba(0,0,0,1)]">
                  <div className="w-10 h-10 bg-white border-2 border-black rounded-xl flex items-center justify-center mr-3 font-black text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-black text-slate-900 block">{user.name}</span>
                    <span className="text-xs font-bold text-slate-600">Mon Profil</span>
                  </div>
                </Link>
              )}

              <nav className="space-y-2">
                {navItems.map((item) => {
                  if (item.authRequired && !isAuthenticated) return null;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 font-bold text-slate-900 bg-white border-2 border-black hover:bg-yellow-100 rounded-xl transition-all shadow-[2px_2px_0_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)]"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg border-2 border-black flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 font-bold text-slate-900 bg-gradient-to-r from-pink-100 to-red-100 border-2 border-black rounded-xl shadow-[2px_2px_0_rgba(0,0,0,1)]">
                <div className="w-8 h-8 bg-white rounded-lg border-2 border-black flex items-center justify-center">
                  <Heart size={18} strokeWidth={2.5} className="text-red-500" />
                </div>
                <span>Mes Favoris</span>
                {favorites.length > 0 && <span className="ml-auto bg-red-500 text-white border-2 border-black text-xs font-black px-2 py-0.5 rounded-full">{favorites.length}</span>}
              </Link>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-black rounded-xl font-black text-sm"
                >
                  <Globe size={18} strokeWidth={2.5} className="text-blue-600" />
                  <span>{language === 'fr' ? 'Français' : 'English'}</span>
                </button>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-black rounded-xl font-black text-sm"
                >
                  {isDarkMode ? <Moon size={18} className="text-indigo-600" /> : <Sun size={18} className="text-amber-500" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
