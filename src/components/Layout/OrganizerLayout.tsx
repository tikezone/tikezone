
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutGrid, 
  Calendar, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  PlusCircle,
  BarChart3,
  HelpCircle,
  Wallet,
  Users,
  MessageSquare,
  Store,
  ClipboardList
} from 'lucide-react';

interface OrganizerLayoutProps {
  children: React.ReactNode;
}

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-72 sm:w-80 h-80 sm:h-96 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 flex justify-between items-center">
                        <span className="font-black text-sm uppercase text-white">Messagerie Equipe</span>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X size={16} /></button>
                    </div>
                    <div className="flex-1 bg-black/50 p-4 overflow-y-auto space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-white/10 border border-white/10 rounded-xl rounded-tl-none p-2 max-w-[80%] text-xs font-bold text-white">
                                <p className="text-gray-500 text-[9px] mb-1">Agent Paul (Entree B)</p>
                                Salut Chef, il y a beaucoup de monde a l'entree B !
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-orange-500/20 border border-orange-500/30 text-white rounded-xl rounded-tr-none p-2 max-w-[80%] text-xs font-bold">
                                Recu, j'envoie du renfort. Continuez de scanner.
                            </div>
                        </div>
                    </div>
                    <div className="p-2 border-t border-white/10 bg-black/50">
                        <input className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-gray-500 outline-none focus:border-orange-500/50" placeholder="Ecrire un message..." />
                    </div>
                </div>
            )}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform text-white relative"
            >
                <MessageSquare size={20} fill="currentColor" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center">1</span>
            </button>
        </div>
    )
}

const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutGrid, label: 'Vue d\'ensemble', href: '/organizer' },
    { icon: Calendar, label: 'Mes Evenements', href: '/organizer/events' },
    { icon: Store, label: 'Guichet / POS', href: '/organizer/pos' },
    { icon: ClipboardList, label: 'Liste Invites', href: '/organizer/guests' },
    { icon: Users, label: 'Equipe & Scan', href: '/organizer/team' },
    { icon: Wallet, label: 'Portefeuille', href: '/organizer/wallet' },
    { icon: BarChart3, label: 'Rapports', href: '/organizer/reports' },
    { icon: Settings, label: 'Parametres', href: '/organizer/settings' },
  ];

  const bottomNavItems = [
    { icon: LayoutGrid, label: 'Accueil', href: '/organizer' },
    { icon: Calendar, label: 'Events', href: '/organizer/events' },
    { icon: Store, label: 'POS', href: '/organizer/pos' },
    { icon: ClipboardList, label: 'Invites', href: '/organizer/guests' },
    { icon: Settings, label: 'Plus', href: '/organizer/settings' },
  ];

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row font-sans">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/95 backdrop-blur-2xl text-white border-r border-white/10 transition-transform duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-black/95 backdrop-blur-xl z-10">
            <Link href="/" className="text-2xl font-black font-display tracking-tight text-white">
              TIKE<span className="text-orange-400">PRO</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
              <X size={24} />
            </button>
          </div>

          <div className="p-4 flex items-center gap-3 border-b border-white/10">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'O'}
             </div>
             <div className="overflow-hidden min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Organisateur</p>
             </div>
          </div>

          <nav className="p-4 space-y-2">
            <div className="mb-4">
                <Link href="/publish">
                    <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-black flex items-center justify-center shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all uppercase text-xs tracking-wide">
                        <PlusCircle size={18} className="mr-2" /> Creer Evenement
                    </button>
                </Link>
            </div>

            {menuItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl font-bold transition-all text-sm group text-gray-400 hover:text-white hover:bg-white/5"
              >
                <item.icon size={20} className="mr-3 text-gray-600 group-hover:text-orange-400" strokeWidth={2.5} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
           <Link href="/faq" className="flex items-center text-gray-500 hover:text-white mb-4 px-2 text-sm font-medium transition-colors">
              <HelpCircle size={18} className="mr-3" /> Aide & Support
           </Link>
           <button 
             onClick={logout} 
             className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold"
           >
             <LogOut size={18} className="mr-3" /> Deconnexion
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:h-screen overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 p-3 flex justify-between items-center sticky top-0 z-30 shrink-0">
           <div className="flex items-center min-w-0">
              <button onClick={() => setIsSidebarOpen(true)} className="mr-3 p-2 bg-white/10 rounded-lg border border-white/10 shrink-0">
                 <Menu size={18} className="text-white" />
              </button>
              <span className="font-black font-display text-lg text-white truncate">Espace Organisateur</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center font-black text-xs text-white shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'O'}
           </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 lg:pb-8 lg:p-8 bg-black relative">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-black to-black pointer-events-none"></div>
           
           <div className="max-w-6xl mx-auto relative z-10">
              {children}
           </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-2xl border-t border-white/10 z-50">
          <div className="flex justify-around items-center py-2 px-1">
            {bottomNavItems.map((item, idx) => (
              <Link 
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center py-1 px-2 text-gray-400 hover:text-orange-400 transition-colors min-w-0"
              >
                <item.icon size={20} strokeWidth={2} />
                <span className="text-[10px] font-bold mt-1 truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <ChatWidget />
      </div>

    </div>
  );
};

export default OrganizerLayout;
