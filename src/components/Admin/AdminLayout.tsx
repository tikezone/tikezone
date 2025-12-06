'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Eye, LayoutDashboard, Ticket, Calendar, Users, 
  CreditCard, Bell, Shield, Settings, LogOut,
  Menu, X, ChevronRight, Megaphone, Coins
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/tickets', icon: Ticket, label: 'Tickets' },
  { href: '/admin/events', icon: Calendar, label: 'Evenements' },
  { href: '/admin/cagnottes', icon: Coins, label: 'Cagnottes' },
  { href: '/admin/organizers', icon: Users, label: 'Organisateurs' },
  { href: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { href: '/admin/payments', icon: CreditCard, label: 'Paiements' },
  { href: '/admin/content', icon: Megaphone, label: 'Contenu' },
  { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { href: '/admin/security', icon: Shield, label: 'Securite' },
  { href: '/admin/settings', icon: Settings, label: 'Parametres' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data?.user) {
          if (data.user.role !== 'admin') {
            router.push('/');
            return;
          }
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700
        transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                <Eye size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">L&apos;oeil de Dieu</h1>
                <p className="text-xs text-gray-400">Admin TIKEZONE</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${active 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  {active && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-700">
            {user && (
              <div className="mb-3 px-4 py-2">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Deconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-gray-800 border-b border-gray-700 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white hover:bg-gray-700 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
