'use client';

import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import CheckoutModal from '../../components/Booking/CheckoutModal';
import { Gift, CreditCard, Sparkles, CheckCircle, Copy, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GiftCardsPage() {
  const [amount, setAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [formData, setFormData] = useState({
    from: '',
    toName: '',
    toEmail: '',
    message: ''
  });
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const PRESETS = [5000, 10000, 25000, 50000];

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCustomAmount(e.target.value);
    if (!isNaN(val)) setAmount(val);
  };

  const handleBuy = () => {
    if (!formData.toName || !formData.toEmail || !formData.from) {
        alert("Veuillez remplir tous les champs obligatoires (De, Pour, Email).");
        return;
    }
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    setIsCheckoutOpen(false);
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
      .format(price)
      .replace('XOF', 'F');

  if (success) {
      return (
        <MainLayout showAnnouncement={false}>
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
                <div className="relative z-10 text-center">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6 mb-6 shadow-lg shadow-green-500/30 inline-block animate-bounce">
                        <Gift className="w-16 h-16 text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white font-display uppercase mb-4 text-center">Cadeau Envoye !</h1>
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 max-w-md w-full mx-auto">
                        <p className="text-lg font-bold text-gray-300 mb-6">
                            Une carte cadeau de <span className="text-orange-400 font-black">{formatPrice(amount)}</span> a ete envoyee a <span className="text-white font-black">{formData.toEmail}</span>.
                        </p>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-6">
                            <p className="text-xs font-black uppercase text-gray-400 mb-1">Code de la carte</p>
                            <div className="flex items-center justify-center gap-2">
                                <code className="text-xl font-mono font-black text-white">GIFT-{Math.random().toString(36).substr(2, 4).toUpperCase()}-{Math.random().toString(36).substr(2, 4).toUpperCase()}</code>
                                <button className="text-gray-400 hover:text-orange-400" onClick={() => alert('Copie !')}><Copy size={16}/></button>
                            </div>
                        </div>
                        <Link href="/">
                            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all">
                                Retour a l'accueil
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </MainLayout>
      )
  }

  return (
    <MainLayout showAnnouncement={false}>
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        totalPrice={amount}
        ticketSummary={`Carte Cadeau ${formatPrice(amount)} pour ${formData.toName}`}
      />

      <div className="bg-black min-h-screen py-12 px-4 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
        
        <div className="relative z-10 max-w-6xl mx-auto">
            
            <div className="text-center mb-12">
                <span className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase mb-4 shadow-lg shadow-purple-500/30">
                    <Sparkles size={14} className="inline mr-1" /> Le cadeau parfait
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white font-display uppercase drop-shadow-sm mb-4">
                    Offrez du <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Bonheur</span>
                </h1>
                <p className="text-lg font-bold text-gray-400 max-w-xl mx-auto">
                    Laissez-les choisir leur prochaine experience inoubliable parmi des centaines d'evenements.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                <div className="lg:sticky lg:top-24 order-2 lg:order-1">
                    <div className="relative group">
                        <div className="relative w-full aspect-[1.586/1] bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl border border-white/20 shadow-2xl overflow-hidden text-white flex flex-col justify-between p-6 md:p-10 transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]">
                            
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30">
                                        <Gift size={24} />
                                    </div>
                                    <span className="font-black text-lg tracking-widest font-display">TIKEZONE</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Montant</p>
                                    <p className="text-3xl md:text-4xl font-black font-display">{formatPrice(amount)}</p>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <p className="text-2xl md:text-3xl font-black font-display mb-1 uppercase tracking-wide truncate">
                                    {formData.toName || 'Destinataire'}
                                </p>
                                <p className="font-medium opacity-80 text-sm flex items-center">
                                    <span className="mr-2">De la part de :</span> 
                                    <span className="font-bold bg-white/20 px-2 py-0.5 rounded">{formData.from || 'Vous'}</span>
                                </p>
                            </div>

                            <div className="relative z-10 flex justify-between items-end mt-4">
                                <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                                    Valable 1 an - Tous evenements
                                </div>
                                <CreditCard size={32} className="opacity-80" />
                            </div>
                        </div>
                    </div>

                    {formData.message && (
                        <div className="mt-6 bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                <span className="text-xs font-black uppercase text-gray-400 ml-auto">Votre message</span>
                            </div>
                            <p className="text-white text-lg leading-relaxed font-bold italic">
                                "{formData.message}"
                            </p>
                        </div>
                    )}
                </div>

                <div className="bg-white/10 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/20 order-1 lg:order-2">
                    <h3 className="text-2xl font-black font-display text-white mb-6 uppercase flex items-center">
                        <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mr-3 text-sm shadow-lg shadow-orange-500/30">1</span>
                        Choisissez le montant
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {PRESETS.map((val) => (
                            <button
                                key={val}
                                onClick={() => handleAmountSelect(val)}
                                className={`
                                    py-3 rounded-2xl border font-black text-sm transition-all
                                    ${amount === val && !customAmount 
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30' 
                                        : 'bg-white/5 text-gray-300 border-white/10 hover:border-orange-500 hover:text-white'}
                                `}
                            >
                                {formatPrice(val)}
                            </button>
                        ))}
                    </div>
                    <div className="relative mb-8">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Autre montant</span>
                        <input 
                            type="number"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className="w-full pl-32 pr-16 py-3 rounded-2xl bg-white/5 border border-white/10 focus:border-orange-500 outline-none font-black text-right text-white transition-all"
                            placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">FCFA</span>
                    </div>

                    <h3 className="text-2xl font-black font-display text-white mb-6 uppercase flex items-center">
                        <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 text-sm shadow-lg shadow-blue-500/30">2</span>
                        Personnalisation
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400 ml-1">De la part de</label>
                                <input
                                    placeholder="Votre nom"
                                    value={formData.from}
                                    onChange={e => setFormData({...formData, from: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white font-bold text-sm focus:outline-none focus:border-orange-500 placeholder-gray-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-gray-400 ml-1">Pour</label>
                                <input
                                    placeholder="Son nom"
                                    value={formData.toName}
                                    onChange={e => setFormData({...formData, toName: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white font-bold text-sm focus:outline-none focus:border-orange-500 placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Email du destinataire</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="ami@exemple.com"
                                    value={formData.toEmail}
                                    onChange={e => setFormData({...formData, toEmail: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white font-bold text-sm focus:outline-none focus:border-orange-500 placeholder-gray-500"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 ml-1">Petit mot doux (Optionnel)</label>
                            <textarea 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold text-sm resize-none focus:outline-none focus:border-orange-500 placeholder-gray-500"
                                rows={3}
                                placeholder="Joyeux anniversaire ! Profite bien..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-gray-400 uppercase text-xs">Total a payer</span>
                            <span className="font-black text-3xl text-white font-display">{formatPrice(amount)}</span>
                        </div>
                        <button 
                            onClick={handleBuy} 
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
                        >
                            <CheckCircle size={20} />
                            Offrir cette carte
                        </button>
                        <p className="text-center text-[10px] font-bold text-gray-500 mt-3 uppercase">
                            Carte valable 1 an sur tous les evenements
                        </p>
                    </div>

                </div>

            </div>

        </div>
      </div>
    </MainLayout>
  );
}
