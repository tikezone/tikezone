
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 h-96 bg-black/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 flex justify-between items-center">
                        <span className="font-black text-sm uppercase text-white">Messagerie Équipe</span>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X size={16} /></button>
                    </div>
                    <div className="flex-1 bg-black/50 p-4 overflow-y-auto space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-white/10 border border-white/10 rounded-xl rounded-tl-none p-2 max-w-[80%] text-xs font-bold text-white">
                                <p className="text-gray-500 text-[9px] mb-1">Agent Paul (Entrée B)</p>
                                Salut Chef, il y a beaucoup de monde à l'entrée B !
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-orange-500/20 border border-orange-500/30 text-white rounded-xl rounded-tr-none p-2 max-w-[80%] text-xs font-bold">
                                Reçu, j'envoie du renfort. Continuez de scanner.
                            </div>
                        </div>
                    </div>
                    <div className="p-2 border-t border-white/10 bg-black/50">
                        <input className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-white placeholder-gray-500 outline-none focus:border-orange-500/50" placeholder="Écrire un message..." />
                    </div>
                </div>
            )}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform text-white"
            >
                <MessageSquare size={24} fill="currentColor" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-black flex items-center justify-center">1</span>
            </button>
        </div>
    )
}

const OrganizerLayout: React.FC<OrganizerLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutGrid, label: 'Vue d\'ensemble', href: '/organizer', active: true },
    { icon: Calendar, label: 'Mes Événements', href: '/organizer/events', active: false },
    { icon: Store, label: 'Guichet / POS', href: '/organizer/pos', active: false },
    { icon: ClipboardList, label: 'Liste Invités', href: '/organizer/guests', active: false },
    { icon: Users, label: 'Équipe & Scan', href: '/organizer/team', active: false },
    { icon: Wallet, label: 'Portefeuille', href: '/organizer/wallet', active: false },
    { icon: BarChart3, label: 'Rapports', href: '/organizer/reports', active: false },
    { icon: Settings, label: 'Paramètres', href: '/organizer/settings', active: false },
  ];

  return (
    <div className="min-h-screen bg-black flex font-sans">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black/95 backdrop-blur-2xl text-white border-r border-white/10 transition-transform duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div>
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <Link href="/" className="text-2xl font-black font-display tracking-tight text-white">
              TIKE<span className="text-orange-400">PRO</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 flex items-center gap-3 border-b border-white/10">
             <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-sm">
                {user?.name.charAt(0).toUpperCase() || 'O'}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Organisateur</p>
             </div>
          </div>

          <nav className="p-4 space-y-2">
            <div className="mb-6">
                <Link href="/publish">
                    <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-black flex items-center justify-center shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all uppercase text-xs tracking-wide">
                        <PlusCircle size={18} className="mr-2" /> Créer Événement
                    </button>
                </Link>
            </div>

            {menuItems.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href}
                className={`
                  flex items-center px-4 py-3 rounded-xl font-bold transition-all text-sm group
                  ${item.active 
                    ? 'bg-white/10 text-white border border-orange-500/50' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon size={20} className={`mr-3 ${item.active ? 'text-orange-400' : 'text-gray-600 group-hover:text-white'}`} strokeWidth={2.5} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
           <Link href="/faq" className="flex items-center text-gray-500 hover:text-white mb-4 px-2 text-sm font-medium transition-colors">
              <HelpCircle size={18} className="mr-3" /> Aide & Support
           </Link>
           <button 
             onClick={logout} 
             className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold"
           >
             <LogOut size={18} className="mr-3" /> Déconnexion
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        <header className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-30">
           <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(true)} className="mr-4 p-2 bg-white/10 rounded-lg border border-white/10">
                 <Menu size={20} className="text-white" />
              </button>
              <span className="font-black font-display text-xl text-white">Espace Organisateur</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center font-black text-xs text-white">
              {user?.name.charAt(0).toUpperCase()}
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black relative">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-black to-black pointer-events-none"></div>
           
           <div className="max-w-6xl mx-auto relative z-10">
              {children}
           </div>
        </main>

        <ChatWidget />
      </div>

    </div>
  );
};

export default OrganizerLayout;
