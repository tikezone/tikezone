import React, { useEffect, useState } from 'react';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  eventName: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  eventName,
  isLoading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const loading = isLoading || isDeleting;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={loading ? undefined : onClose}
      />

      <div 
        className={`
          relative bg-slate-900 w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 transform
          ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
      >
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center mb-3">
            <Trash2 size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">Supprimer ?</h3>
        </div>

        <div className="p-6 text-center">
          <p className="text-gray-400 font-bold mb-3">
            Etes-vous sur de vouloir supprimer :
          </p>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4">
            <span className="font-black text-white">{eventName}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg mb-6">
            <AlertTriangle size={14} />
            <span>Cette action est irreversible.</span>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-xl font-black text-gray-300 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Suppression...</span>
                </>
              ) : (
                'Supprimer'
              )}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 bg-white/10 text-white p-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
