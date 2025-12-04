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
    <div className="bg-slate-50 p-4 rounded-xl border-2 border-black border-dashed space-y-4">
        <label className="text-xs font-black text-slate-900 uppercase ml-1 block">Visibilité de l'événement</label>
        
        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => onVisibilityChange('public')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${visibility === 'public' ? 'bg-white border-black shadow-pop-sm' : 'bg-transparent border-slate-200 text-slate-400 hover:bg-white hover:border-slate-300'}`}
            >
                <Globe size={24} strokeWidth={2.5} className={visibility === 'public' ? 'text-blue-500' : 'text-slate-300'} />
                <span className="font-black text-xs uppercase">Public</span>
            </button>
            <button
                type="button"
                onClick={() => onVisibilityChange('private')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${visibility === 'private' ? 'bg-slate-900 border-black shadow-pop-sm text-white' : 'bg-transparent border-slate-200 text-slate-400 hover:bg-white hover:border-slate-300'}`}
            >
                <Lock size={24} strokeWidth={2.5} className={visibility === 'private' ? 'text-yellow-400' : 'text-slate-300'} />
                <span className="font-black text-xs uppercase">Privé</span>
            </button>
        </div>

        {visibility === 'private' && (
            <div className="animate-in slide-in-from-top-2 pt-2">
                <label className="text-xs font-black text-slate-900 uppercase ml-1 block mb-2">Code d'accès secret</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            value={accessCode}
                            onChange={(e) => onAccessCodeChange(e.target.value)}
                            placeholder="Générer ou écrire..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-black font-black text-lg tracking-widest uppercase focus:shadow-pop-sm outline-none"
                        />
                    </div>
                    <button 
                        type="button"
                        onClick={generateCode}
                        className="p-3 bg-white border-2 border-black rounded-xl hover:bg-slate-100 transition-colors"
                        title="Générer un code"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
                <p className="text-[10px] font-bold text-slate-500 mt-2 ml-1">
                    Partagez ce code uniquement avec vos invités. Ils devront l'entrer pour voir l'événement.
                </p>
            </div>
        )}
    </div>
  );
};

export default PrivacySettings;