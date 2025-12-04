
import React from 'react';
import Link from 'next/link';
import { Home, Map } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4 font-sans text-center">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border-4 border-black shadow-pop-lg max-w-lg relative overflow-hidden">
        
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-4 bg-black"></div>
        <div className="absolute bottom-0 left-0 w-full h-4 bg-black"></div>
        
        <div className="mb-8 relative inline-block">
            <h1 className="text-9xl font-black font-display text-slate-900 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">404</h1>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-2 bg-yellow-400 rotate-12 border-2 border-black"></div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-4 uppercase">Oups ! Perdu ?</h2>
        <p className="text-lg font-bold text-slate-600 mb-8">
          On dirait que cette page est partie assister à un concert sans nous.
        </p>

        <div className="flex flex-col gap-4">
            <Link href="/" className="bg-brand-500 text-white font-black py-4 px-8 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center uppercase tracking-wide">
                <Home size={20} className="mr-2" /> Retour à l'accueil
            </Link>
            <Link href="/explore" className="bg-white text-slate-900 font-black py-4 px-8 rounded-xl border-2 border-black shadow-pop hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center uppercase tracking-wide">
                <Map size={20} className="mr-2" /> Explorer les events
            </Link>
        </div>
      </div>
    </div>
  );
}
