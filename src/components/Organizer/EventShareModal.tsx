
'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Share2, QrCode, Download, ExternalLink } from 'lucide-react';
import Button from '../UI/Button';

interface EventShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    title: string;
    slug?: string;
    id: string;
  };
}

const EventShareModal: React.FC<EventShareModalProps> = ({ isOpen, onClose, event }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // Construct subdomain link if slug exists, otherwise fallback to path
  const shareLink = event.slug 
    ? `https://${event.slug}.tikezone.com`
    : `https://tikezone.com/e/${event.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`
          relative bg-white w-full max-w-md rounded-3xl border-4 border-black shadow-pop-lg overflow-hidden transition-all duration-300 transform flex flex-col
          ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}
        `}
      >
        {/* Header */}
        <div className="bg-yellow-400 p-6 border-b-4 border-black flex justify-between items-center">
           <h3 className="text-2xl font-black text-slate-900 font-display uppercase tracking-wide">
             Partager
           </h3>
           <button 
             onClick={onClose}
             className="bg-white p-1.5 rounded-lg border-2 border-black hover:bg-slate-100 transition-colors shadow-sm active:translate-y-0.5 active:shadow-none"
           >
             <X size={20} strokeWidth={3} />
           </button>
        </div>

        <div className="p-6 space-y-6">
            
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-2xl border-4 border-black shadow-pop mb-4 relative group cursor-pointer hover:scale-105 transition-transform">
                    {/* Placeholder QR Code - In real app use 'qrcode.react' */}
                    <div className="relative">
                        <QrCode size={160} className="text-slate-900" />
                        {/* Logo overlay simulation */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white p-1 rounded-full border-2 border-black">
                                <div className="w-6 h-6 bg-brand-500 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="absolute -bottom-3 -right-3">
                        <button className="bg-slate-900 text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-brand-500 transition-colors">
                            <Download size={16} />
                        </button>
                    </div>
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanner pour réserver</p>
            </div>

            {/* Link Section */}
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase ml-1">Lien public</label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-slate-100 border-2 border-black rounded-xl px-3 py-3 text-sm font-bold text-slate-700 truncate select-all">
                        {shareLink}
                    </div>
                    <button 
                        onClick={handleCopy}
                        className={`
                            px-4 rounded-xl border-2 border-black font-black transition-all flex items-center justify-center shadow-sm
                            ${copied ? 'bg-green-500 text-white' : 'bg-white hover:bg-slate-50'}
                        `}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" icon={<ExternalLink size={16}/>} onClick={() => window.open(shareLink, '_blank')}>
                    Voir la page
                </Button>
                <Button variant="primary" icon={<Share2 size={16}/>}>
                    Autres options
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
};

export default EventShareModal;
