
'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, MessageCircle, Send, CheckCircle, Smartphone, ArrowRight } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: 'account' | 'email' | 'whatsapp', recipient: string) => void;
  ticketTitle: string;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onConfirm, ticketTitle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [method, setMethod] = useState<'account' | 'email' | 'whatsapp'>('account');
  const [recipient, setRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setIsSuccess(false);
        setRecipient('');
        setMethod('account');
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirm(method, recipient);
      }, 1500);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal Content */}
      <div 
        className={`
          relative w-full max-w-md bg-white rounded-3xl border-4 border-black shadow-pop-lg overflow-hidden transition-all duration-300 transform
          ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}
        `}
      >
        {/* Header */}
        <div className="bg-blue-500 p-6 border-b-4 border-black flex justify-between items-center text-white">
           <div className="flex items-center gap-3">
              <div className="bg-white text-blue-600 p-2 rounded-lg border-2 border-black shadow-sm">
                <Send size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-xl font-black font-display uppercase tracking-wide leading-none">Transférer</h3>
                <p className="text-xs font-bold text-blue-100 opacity-90 truncate max-w-[200px]">{ticketTitle}</p>
              </div>
           </div>
           <button 
             onClick={onClose}
             className="bg-white text-black p-1.5 rounded-lg border-2 border-black hover:bg-slate-100 transition-colors shadow-sm active:translate-y-0.5 active:shadow-none"
           >
             <X size={20} strokeWidth={3} />
           </button>
        </div>

        <div className="p-6">
            {isSuccess ? (
                <div className="text-center py-8 animate-in zoom-in">
                    <div className="w-20 h-20 bg-green-400 rounded-full border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-pop">
                        <CheckCircle size={40} className="text-white" strokeWidth={3} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase mb-2">Ticket Envoyé !</h2>
                    <p className="text-slate-600 font-bold text-sm">
                        Le destinataire a reçu les instructions pour récupérer son billet.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Method Selector */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setMethod('account')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'account' ? 'bg-slate-900 border-black text-white shadow-pop-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-black hover:text-black'}`}
                        >
                            <User size={20} />
                            <span className="text-[10px] font-black uppercase">Compte</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMethod('email')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'email' ? 'bg-blue-100 border-black text-blue-800 shadow-pop-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-black hover:text-black'}`}
                        >
                            <Mail size={20} />
                            <span className="text-[10px] font-black uppercase">Email</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMethod('whatsapp')}
                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${method === 'whatsapp' ? 'bg-green-100 border-black text-green-800 shadow-pop-sm' : 'bg-white border-slate-200 text-slate-400 hover:border-black hover:text-black'}`}
                        >
                            <MessageCircle size={20} />
                            <span className="text-[10px] font-black uppercase">WhatsApp</span>
                        </button>
                    </div>

                    {/* Input Field based on Method */}
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-black border-dashed">
                        {method === 'account' && (
                            <Input 
                                label="Identifiant Tikezone" 
                                placeholder="@pseudo ou ID" 
                                icon={<User size={18}/>}
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                autoFocus
                            />
                        )}
                        {method === 'email' && (
                            <Input 
                                label="Adresse Email" 
                                type="email"
                                placeholder="ami@exemple.com" 
                                icon={<Mail size={18}/>}
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                autoFocus
                            />
                        )}
                        {method === 'whatsapp' && (
                            <Input 
                                label="Numéro WhatsApp" 
                                type="tel"
                                placeholder="+225 07..." 
                                icon={<Smartphone size={18}/>}
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                autoFocus
                            />
                        )}
                        
                        <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-start">
                            <span className="bg-yellow-400 text-black px-1.5 rounded mr-1.5 text-[9px] border border-black">INFO</span>
                            Une fois transféré, ce billet ne sera plus accessible depuis votre compte.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} fullWidth>Annuler</Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            fullWidth 
                            disabled={!recipient} 
                            isLoading={isSending}
                            icon={<ArrowRight size={18} />}
                        >
                            Envoyer
                        </Button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
