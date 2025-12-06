'use client';

import React from 'react';
import { Link } from '../../lib/safe-navigation';
import { Facebook, Instagram } from 'lucide-react';

const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 group-hover:text-white transition-colors">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-6">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
            <span className="text-gray-700">|</span>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
            <span className="text-gray-700">|</span>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Confidentialité</Link>
            <span className="text-gray-700">|</span>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">CGV</Link>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#" className="group p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-300">
              <Facebook size={16} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={2} />
            </a>
            <a href="#" className="group p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-300">
              <Instagram size={16} className="text-gray-400 group-hover:text-white transition-colors" strokeWidth={2} />
            </a>
            <a href="#" className="group p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg hover:bg-white/10 hover:scale-110 active:scale-95 transition-all duration-300">
              <TikTokIcon />
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span className="w-2 h-2 rounded-full bg-orange-300"></span>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} <span className="text-orange-400 font-semibold">TIKEZONE</span>. Tous droits réservés.
            </p>
            <p className="text-[10px] text-gray-600">
              Conçu avec passion pour sublimer vos événements
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
