
'use client';

import React, { useState } from 'react';
import { Coins, Target, Image as ImageIcon, Users, TrendingUp } from 'lucide-react';
import Input from '../UI/Input';

const MoneyPotSection: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="space-y-4 animate-in slide-in-from-right duration-500 delay-100">
        
        {/* Toggle Header */}
        <div 
            onClick={() => setIsActive(!isActive)}
            className={`cursor-pointer p-5 rounded-2xl border transition-all flex items-center justify-between ${isActive ? 'bg-yellow-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full border border-white/20 flex items-center justify-center ${isActive ? 'bg-yellow-500/20' : 'bg-white/10'}`}>
                    <Coins size={24} className={isActive ? 'text-yellow-400' : 'text-gray-400'} strokeWidth={2.5} />
                </div>
                <div>
                    <h3 className="text-lg font-black font-display uppercase text-white">Activer une Cagnotte</h3>
                    <p className="text-xs font-bold text-gray-400">Collecter des dons ou participations libres.</p>
                </div>
            </div>
            
            {/* Custom Switch Visual */}
            <div className={`w-14 h-8 rounded-full border flex items-center p-1 transition-colors ${isActive ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400' : 'bg-white/10 border-white/20'}`}>
                <div className={`w-5 h-5 rounded-full bg-white border border-white/30 transition-transform shadow-lg ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </div>
        </div>

        {/* Cagnotte Fields */}
        {isActive && (
            <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 shadow-xl animate-in slide-in-from-top-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
                
                <div className="space-y-5 relative z-10">
                    <Input label="Nom de la cagnotte" placeholder="Ex: Anniversaire Surprise, Projet Caritatif..." icon={<Target size={18}/>} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Objectif (FCFA)" placeholder="Ex: 500.000" type="number" />
                        <Input label="Date de fin" type="date" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Contribution Min." placeholder="Ex: 1000" type="number" />
                        <Input label="Montant Suggéré" placeholder="Ex: 5000" type="number" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase ml-1 text-gray-300">Description courte</label>
                        <textarea 
                            rows={3}
                            className="w-full p-3 rounded-xl border border-white/20 font-bold text-sm bg-white/5 focus:bg-white/10 outline-none resize-none focus:border-orange-400 text-white placeholder-gray-500"
                            placeholder="Pourquoi cette collecte ?"
                        />
                    </div>

                    {/* Visual Placeholders */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="border border-dashed border-white/20 bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-orange-400 hover:text-orange-400 transition-colors cursor-pointer h-24">
                            <ImageIcon size={24} className="mb-1" />
                            <span className="text-[10px] font-black uppercase">Ajouter Visuel</span>
                        </div>
                        <div className="border border-dashed border-white/10 bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-gray-600 h-24 opacity-50">
                            <Users size={24} className="mb-1" />
                            <span className="text-[10px] font-black uppercase">Liste Contributeurs</span>
                        </div>
                        <div className="border border-dashed border-white/10 bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-gray-600 h-24 opacity-50">
                            <TrendingUp size={24} className="mb-1" />
                            <span className="text-[10px] font-black uppercase">Carte Évolution</span>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default MoneyPotSection;
