import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, eventName }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`
          relative bg-white w-full max-w-sm rounded-3xl border-4 border-black shadow-pop-lg overflow-hidden transition-all duration-300 transform
          ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
      >
        <div className="bg-red-500 p-6 border-b-4 border-black flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-white rounded-full border-4 border-black flex items-center justify-center mb-3 shadow-pop-sm">
              <Trash2 size={32} className="text-red-500" strokeWidth={3} />
           </div>
           <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide drop-shadow-md">Supprimer ?</h3>
        </div>

        <div className="p-6 text-center">
          <p className="text-slate-700 font-bold mb-2">
            Êtes-vous sûr de vouloir supprimer :
          </p>
          <div className="bg-yellow-100 border-2 border-black rounded-xl p-3 mb-6 transform -rotate-1">
             <span className="font-black text-slate-900">{eventName}</span>
          </div>
          <p className="text-xs text-slate-500 font-bold bg-slate-100 inline-block px-2 py-1 rounded border border-slate-300 mb-6">
             ⚠️ Cette action est irréversible.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white border-2 border-black rounded-xl font-black text-slate-900 shadow-pop-sm hover:shadow-none hover:translate-y-[2px] transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-red-500 border-2 border-black rounded-xl font-black text-white shadow-pop-sm hover:shadow-none hover:translate-y-[2px] transition-all"
            >
              Supprimer
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-black p-1 rounded-lg border-2 border-black shadow-sm hover:scale-110 transition-transform"
        >
           <X size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;