import React, { useState } from 'react';
import { Lock, Unlock, ArrowRight } from 'lucide-react';
import Button from '../UI/Button';

interface PrivateEventGateProps {
  requiredCode: string;
  onUnlock: () => void;
  title: string;
}

const PrivateEventGate: React.FC<PrivateEventGateProps> = ({ requiredCode, onUnlock, title }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isShake, setIsShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.toUpperCase() === requiredCode.toUpperCase()) {
      onUnlock();
    } else {
      setError(true);
      setIsShake(true);
      setTimeout(() => setIsShake(false), 500);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-slate-900 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className={`relative z-10 w-full max-w-md bg-white rounded-3xl border-4 border-black shadow-[0_0_50px_rgba(255,255,255,0.2)] p-8 text-center ${isShake ? 'animate-bounce' : ''}`}>
        <div className="w-20 h-20 bg-slate-900 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-pop">
          <Lock size={32} className="text-yellow-400" strokeWidth={3} />
        </div>

        <h2 className="text-3xl font-black text-slate-900 font-display uppercase mb-2">Événement Privé</h2>
        <p className="text-slate-600 font-bold mb-8">
          L'accès à <span className="text-black bg-yellow-200 px-1 rounded">{title}</span> est restreint. Veuillez entrer votre code d'accès.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false); }}
              placeholder="CODE D'ACCÈS"
              className={`w-full py-4 text-center text-xl font-black uppercase tracking-widest border-2 rounded-xl focus:outline-none focus:shadow-pop transition-all ${error ? 'border-red-500 bg-red-50 placeholder-red-300' : 'border-black focus:border-brand-500'}`}
            />
            {error && (
              <p className="text-red-500 text-xs font-black mt-2 uppercase animate-pulse">Code incorrect</p>
            )}
          </div>

          <Button type="submit" fullWidth variant="secondary" className="py-4 text-lg" icon={<Unlock size={20} />}>
            Déverrouiller
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PrivateEventGate;