'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headerColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  headerColor = 'bg-green-300',
  children,
  footer,
}) => {
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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-6">
      <div 
        className={`absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div 
        className={`
          relative w-full bg-white border-t-4 sm:border-4 border-black shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 sm:translate-y-10'}
          h-[92dvh] rounded-t-3xl
          sm:h-auto sm:max-h-[85vh] sm:rounded-3xl sm:max-w-lg sm:shadow-pop-lg
        `}
      >
        <div className={`px-6 py-4 border-b-2 border-black flex justify-between items-center ${headerColor} sticky top-0 z-10 shrink-0`}>
          <h2 className="text-xl font-black text-black font-display uppercase tracking-wide">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg text-white border-2 border-black shadow-pop-sm active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </div>

        {footer && (
          <div className="p-4 md:p-6 border-t-2 border-black bg-white shrink-0 pb-safe">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalWrapper;
