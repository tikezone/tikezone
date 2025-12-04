
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
                <div className="mb-4 w-80 h-96 bg-white border-4 border-black rounded-2xl shadow-pop-lg flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
                    <div className="bg-yellow-400 p-3 border-b-2 border-black flex justify-between items-center">
                        <span className="font-black text-sm uppercase">Messagerie Équipe</span>
                        <button onClick={() => setIsOpen(false)}><X size={16} /></button>
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 overflow-y-auto space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-white border-2 border-black rounded-xl rounded-tl-none p-2 max-w-[80%] text-xs font-bold shadow-sm">
                                <p className="text-slate-500 text-[9px] mb-1">Agent Paul (Entrée B)</p>
                                Salut Chef, il y a beaucoup de monde à l'entrée B !
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="bg-slate-900 text-white border-2 border-black rounded-xl rounded-tr-none p-2 max-w-[80%] text-xs font-bold shadow-sm">
                                Reçu, j'envoie du renfort. Continuez de scanner.
                            </div>
                        </div>
                    </div>
                    <div className="p-2 border-t-2 border-black bg-white">
                        <input className="w-full bg-slate-100 border-2 border-slate-300 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black" placeholder="Écrire un message..." />
                    </div>
                </div>
            )}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-brand-500 border-4 border-black rounded-full flex items-center justify-center shadow-pop hover:scale-110 transition-transform text-white"
            >
                <MessageSquare size={24} fill="currentColor" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full text-[9px] font-black flex items-center justify-center">1</span>
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
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white border-r-4 border-black transition-transform duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div>
          {/* Logo Area */}
          <div className="p-6 border-b-2 border-slate-700 flex justify-between items-center bg-black">
            <Link href="/" className="text-2xl font-black font-display tracking-tight text-white">
              TIKE<span className="text-yellow-400">PRO</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
              <X size={24} />
            </button>
          </div>

          {/* User Profile Mini */}
          <div className="p-6 flex items-center gap-3 border-b-2 border-slate-800 bg-slate-900">
             <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-black font-black text-sm">
                {user?.name.charAt(0).toUpperCase() || 'O'}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Organisateur</p>
             </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            <div className="mb-6">
                <Link href="/publish">
                    <button className="w-full bg-brand-500 hover:bg-brand-600 text-white border-2 border-white py-3 rounded-xl font-black flex items-center justify-center shadow-[4px_4px_0px_0px_#ffffff] active:translate-y-[2px] active:translate-x-[2px] active:shadow-none transition-all uppercase text-xs tracking-wide">
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
                    ? 'bg-white text-slate-900 border-2 border-black shadow-[4px_4px_0px_0px_#fbbf24]' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'}
                `}
              >
                <item.icon size={20} className={`mr-3 ${item.active ? 'text-brand-600' : 'text-slate-500 group-hover:text-white'}`} strokeWidth={2.5} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t-2 border-slate-800 bg-black">
           <Link href="/faq" className="flex items-center text-slate-400 hover:text-white mb-4 px-2 text-sm font-medium">
              <HelpCircle size={18} className="mr-3" /> Aide & Support
           </Link>
           <button 
             onClick={logout} 
             className="w-full flex items-center px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors text-sm font-bold"
           >
             <LogOut size={18} className="mr-3" /> Déconnexion
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Bar Mobile Only */}
        <header className="lg:hidden bg-white border-b-2 border-black p-4 flex justify-between items-center sticky top-0 z-30">
           <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(true)} className="mr-4 p-2 bg-slate-100 rounded-lg border-2 border-black">
                 <Menu size={20} />
              </button>
              <span className="font-black font-display text-xl">Espace Organisateur</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-xs">
              {user?.name.charAt(0).toUpperCase()}
           </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
           
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
