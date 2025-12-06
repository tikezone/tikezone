'use client';

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface SplitPaySectionProps {
  totalPrice: number;
  participants: string[];
  onParticipantsChange: (participants: string[]) => void;
  formatPrice: (price: number) => string;
}

const SplitPaySection: React.FC<SplitPaySectionProps> = ({
  totalPrice,
  participants,
  onParticipantsChange,
  formatPrice,
}) => {
  const [newParticipant, setNewParticipant] = useState('');

  const splitAmount = totalPrice / (participants.length + 1);

  const addParticipant = () => {
    if (newParticipant.trim()) {
      onParticipantsChange([...participants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (idx: number) => {
    const newP = [...participants];
    newP.splice(idx, 1);
    onParticipantsChange(newP);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-right-2">
      <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl text-center">
        <p className="text-xs font-bold text-orange-400 uppercase mb-1">Total a partager</p>
        <p className="text-2xl font-black text-white">{formatPrice(totalPrice)}</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-500 ml-1">Ajouter des amis</label>
        <div className="flex gap-2">
          <input 
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white placeholder-gray-600 outline-none focus:border-orange-500/50"
            placeholder="Nom ou Email..."
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
          />
          <button 
            onClick={addParticipant} 
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-white flex items-center justify-center text-sm font-black mr-3">V</div>
            <span className="font-bold text-white">Vous</span>
          </div>
          <span className="font-black text-orange-400">{formatPrice(splitAmount)}</span>
        </div>
        {participants.map((p, idx) => (
          <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/10 rounded-full text-white flex items-center justify-center text-sm font-black mr-3">{p.charAt(0).toUpperCase()}</div>
              <span className="font-bold text-white">{p}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black text-gray-400">{formatPrice(splitAmount)}</span>
              <button onClick={() => removeParticipant(idx)} className="text-gray-500 hover:text-red-400 transition-colors">
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SplitPaySection;
