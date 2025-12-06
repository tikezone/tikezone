'use client';

import React, { useState } from 'react';
import { Link } from '../../lib/safe-navigation';
import { ShoppingCart, User, Heart, Bell, Menu, X, Plus } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenUserSpace?: () => void;
  onOpenCart?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenUserSpace, onOpenCart }) => {
  const { favorites } = useFavorites();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isOrganizer = user?.role === 'organizer';
  const publishTarget = isOrganizer ? '/publish' : isAuthenticated ? '/profile' : '/login';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 sm:pt-6 pointer-events-none">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        
        <Link 
          href="/"
          className="pointer-events-auto cursor-pointer"
        >
          <GlassCard intensity="low" className="rounded-[20px] px-4 sm:px-6 py-2.5 sm:py-3 flex items-center hover:bg-white/10 transition-colors">
            <span className="text-xl sm:text-2xl font-black tracking-tighter">
              <span className="text-white">TIKE</span>
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">ZONE</span>
            </span>
          </GlassCard>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          
          <Link href={publishTarget} className="hidden md:block">
            <GlassCard 
              intensity="medium"
              className="rounded-full px-5 py-2.5 flex items-center cursor-pointer hover:scale-105 transition-transform bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500/30"
            >
              <Plus className="w-4 h-4 text-white mr-2" strokeWidth={2.5} />
              <span className="text-sm font-bold text-white">Publier</span>
            </GlassCard>
          </Link>

          <Link href="/favorites" className="hidden sm:block">
            <GlassCard 
              intensity="medium"
              className="rounded-full w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform group"
            >
              <div className="relative">
                <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'text-red-500 fill-current' : 'text-white'} group-hover:text-red-400 transition-colors`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] bg-red-500 flex items-center justify-center text-[10px] font-bold rounded-full text-white shadow-lg">
                    {favorites.length}
                  </span>
                )}
              </div>
            </GlassCard>
          </Link>

          {onOpenCart && (
            <GlassCard 
              intensity="medium"
              onClick={onOpenCart}
              className="rounded-full w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform group"
            >
              <ShoppingCart className="w-5 h-5 text-white group-hover:text-purple-400 transition-colors" />
            </GlassCard>
          )}

          <GlassCard 
            intensity="medium" 
            onClick={onOpenUserSpace}
            className="rounded-full w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform group"
          >
            {isAuthenticated && user ? (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <User className="w-5 h-5 text-white group-hover:text-orange-400 transition-colors" />
            )}
          </GlassCard>

          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <GlassCard 
              intensity="medium"
              className="rounded-xl w-11 h-11 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </GlassCard>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden pointer-events-auto mt-4 animate-fade-in-up">
          <GlassCard intensity="high" className="rounded-[24px] p-4 mx-4">
            <div className="space-y-2">
              <Link 
                href={publishTarget} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white"
              >
                <Plus className="w-5 h-5" />
                <span className="font-bold">Publier un événement</span>
              </Link>
              
              <Link 
                href="/favorites" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
              >
                <Heart className={favorites.length > 0 ? 'w-5 h-5 text-red-500 fill-current' : 'w-5 h-5'} />
                <span className="font-medium">Mes Favoris</span>
                {favorites.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{favorites.length}</span>
                )}
              </Link>

              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
              >
                <span className="font-medium">Accueil</span>
              </Link>

              <Link 
                href="/how-it-works" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white"
              >
                <span className="font-medium">Comment ça marche</span>
              </Link>
            </div>
          </GlassCard>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
