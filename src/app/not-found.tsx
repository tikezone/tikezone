
import React from 'react';
import Link from 'next/link';
import { Home, Map, Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4 font-sans text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-white/10 max-w-lg">
        
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Frown size={48} className="text-orange-400" />
        </div>
        
        <div className="mb-6 relative inline-block">
          <h1 className="text-8xl font-black font-display text-white">404</h1>
        </div>

        <h2 className="text-2xl font-black text-white mb-4 uppercase">Oups ! Perdu ?</h2>
        <p className="text-gray-400 font-bold mb-8 max-w-sm mx-auto">
          On dirait que cette page est partie assister à un concert sans nous.
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all flex items-center justify-center uppercase tracking-wide">
            <Home size={20} className="mr-2" /> Retour à l'accueil
          </Link>
          <Link href="/explore" className="bg-white/10 text-white font-black py-4 px-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center uppercase tracking-wide">
            <Map size={20} className="mr-2" /> Explorer les events
          </Link>
        </div>
      </div>
    </div>
  );
}
