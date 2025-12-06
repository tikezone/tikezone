import React from 'react';
import { Globe, Lock, Key, RefreshCw } from 'lucide-react';

interface PrivacySettingsProps {
  visibility: 'public' | 'private';
  accessCode: string;
  onVisibilityChange: (visibility: 'public' | 'private') => void;
  onAccessCodeChange: (code: string) => void;
}

const PrivacySettings: React.FC<PrivacySettingsProps> = ({ 
  visibility, 
  accessCode, 
  onVisibilityChange, 
  onAccessCodeChange 
}) => {
  
  const generateCode = () => {
    const code = 'PRIV-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    onAccessCodeChange(code);
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/10 border-dashed space-y-4">
        <label className="text-xs font-black text-gray-300 uppercase ml-1 block">Visibilité de l'événement</label>
        
        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => onVisibilityChange('public')}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${visibility === 'public' ? 'bg-white/10 backdrop-blur-xl border-orange-400 shadow-lg shadow-orange-500/20' : 'bg-transparent border-white/20 text-gray-500 hover:bg-white/5 hover:border-white/30'}`}
            >
                <Globe size={24} strokeWidth={2.5} className={visibility === 'public' ? 'text-blue-400' : 'text-gray-500'} />
                <span className={`font-black text-xs uppercase ${visibility === 'public' ? 'text-white' : 'text-gray-500'}`}>Public</span>
            </button>
            <button
                type="button"
                onClick={() => onVisibilityChange('private')}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${visibility === 'private' ? 'bg-white/10 backdrop-blur-xl border-orange-400 shadow-lg shadow-orange-500/20' : 'bg-transparent border-white/20 text-gray-500 hover:bg-white/5 hover:border-white/30'}`}
            >
                <Lock size={24} strokeWidth={2.5} className={visibility === 'private' ? 'text-yellow-400' : 'text-gray-500'} />
                <span className={`font-black text-xs uppercase ${visibility === 'private' ? 'text-white' : 'text-gray-500'}`}>Privé</span>
            </button>
        </div>

        {visibility === 'private' && (
            <div className="animate-in slide-in-from-top-2 pt-2">
                <label className="text-xs font-black text-gray-300 uppercase ml-1 block mb-2">Code d'accès secret</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            value={accessCode}
                            onChange={(e) => onAccessCodeChange(e.target.value)}
                            placeholder="Générer ou écrire..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 font-black text-lg tracking-widest uppercase focus:border-orange-400 outline-none bg-white/5 text-white placeholder-gray-500"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={generateCode}
                        className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/20 hover:border-orange-400 transition-all text-gray-400 hover:text-orange-400"
                        title="Générer un code"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
                <p className="text-[10px] font-bold text-gray-500 mt-2 ml-1">
                    Partagez ce code uniquement avec vos invités. Ils devront l'entrer pour voir l'événement.
                </p>
            </div>
        )}
    </div>
  );
};

export default PrivacySettings;
