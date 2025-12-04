'use client';

import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import CheckoutModal from '../../components/Booking/CheckoutModal';
import { Gift, CreditCard, Sparkles, CheckCircle, Copy, Mail } from 'lucide-react';
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
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 bg-slate-50">
                <div className="bg-green-400 rounded-full p-6 mb-6 border-4 border-black shadow-pop animate-bounce">
                    <Gift className="w-16 h-16 text-black" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display uppercase mb-4 text-center">Cadeau Envoyé !</h1>
                <div className="bg-white border-2 border-black rounded-2xl p-6 max-w-md w-full shadow-pop-lg text-center">
                    <p className="text-lg font-bold text-slate-600 mb-6">
                        Une carte cadeau de <span className="text-brand-600 font-black bg-brand-50 px-2 rounded border border-brand-200">{formatPrice(amount)}</span> a été envoyée à <span className="text-slate-900 font-black">{formData.toEmail}</span>.
                    </p>
                    <div className="bg-slate-100 p-4 rounded-xl border-2 border-slate-200 border-dashed mb-6">
                        <p className="text-xs font-black uppercase text-slate-400 mb-1">Code de la carte</p>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-xl font-mono font-black text-slate-900">GIFT-{Math.random().toString(36).substr(2, 4).toUpperCase()}-{Math.random().toString(36).substr(2, 4).toUpperCase()}</code>
                            <button className="text-slate-400 hover:text-black" onClick={() => alert('Copié !')}><Copy size={16}/></button>
                        </div>
                    </div>
                    <Link href="/">
                        <Button fullWidth variant="primary">Retour à l'accueil</Button>
                    </Link>
                </div>
            </div>
        </MainLayout>
      )
  }

  return (
    <MainLayout showAnnouncement={true}>
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        totalPrice={amount}
        ticketSummary={`Carte Cadeau ${formatPrice(amount)} pour ${formData.toName}`}
      />

      <div className="bg-slate-50 min-h-screen py-12 px-4 font-sans">
        <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-12">
                <span className="inline-block bg-purple-500 text-white px-3 py-1 rounded-lg border-2 border-black font-black text-xs uppercase mb-4 shadow-pop-sm transform -rotate-2">
                    <Sparkles size={14} className="inline mr-1" /> Le cadeau parfait
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 font-display uppercase drop-shadow-sm mb-4">
                    Offrez du <span className="text-purple-600">Bonheur</span>
                </h1>
                <p className="text-lg font-bold text-slate-600 max-w-xl mx-auto">
                    Laissez-les choisir leur prochaine expérience inoubliable parmi des centaines d'événements.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                {/* LEFT: PREVIEW */}
                <div className="lg:sticky lg:top-24 order-2 lg:order-1">
                    <div className="relative group perspective-1000">
                        {/* Card Visual */}
                        <div className="relative w-full aspect-[1.586/1] bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl border-4 border-black shadow-pop-lg overflow-hidden text-white flex flex-col justify-between p-6 md:p-10 transition-transform duration-500 hover:rotate-1 hover:scale-[1.02]">
                            
                            {/* Texture Overlay */}
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

                            {/* Bottom Bar */}
                            <div className="relative z-10 flex justify-between items-end mt-4">
                                <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                                    Valable 1 an • Tous événements
                                </div>
                                <CreditCard size={32} className="opacity-80" />
                            </div>
                        </div>
                    </div>

                    {/* Preview Message */}
                    {formData.message && (
                        <div className="mt-6 bg-white p-6 rounded-2xl border-2 border-black shadow-pop transform rotate-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <span className="text-xs font-black uppercase text-slate-400 ml-auto">Votre message</span>
                            </div>
                            <p className="font-handwriting text-slate-800 text-lg leading-relaxed font-bold italic">
                                "{formData.message}"
                            </p>
                        </div>
                    )}
                </div>

                {/* RIGHT: FORM */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border-4 border-black shadow-pop order-1 lg:order-2">
                    <h3 className="text-2xl font-black font-display text-slate-900 mb-6 uppercase flex items-center">
                        <span className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-black flex items-center justify-center mr-3 text-sm">1</span>
                        Choisissez le montant
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {PRESETS.map((val) => (
                            <button
                                key={val}
                                onClick={() => handleAmountSelect(val)}
                                className={`
                                    py-3 rounded-xl border-2 font-black text-sm transition-all
                                    ${amount === val && !customAmount 
                                        ? 'bg-slate-900 text-white border-black shadow-pop-sm' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-black hover:text-black'}
                                `}
                            >
                                {formatPrice(val)}
                            </button>
                        ))}
                    </div>
                    <div className="relative mb-8">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Autre montant</span>
                        <input 
                            type="number"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                            className="w-full pl-32 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-black outline-none font-black text-right transition-all focus:bg-yellow-50"
                            placeholder="0"
                        />
                        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">FCFA</span>
                    </div>

                    <h3 className="text-2xl font-black font-display text-slate-900 mb-6 uppercase flex items-center">
                        <span className="w-8 h-8 bg-blue-400 rounded-full border-2 border-black flex items-center justify-center mr-3 text-sm">2</span>
                        Personnalisation
                    </h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                label="De la part de" 
                                placeholder="Votre nom" 
                                value={formData.from}
                                onChange={e => setFormData({...formData, from: e.target.value})}
                            />
                            <Input 
                                label="Pour" 
                                placeholder="Son nom" 
                                value={formData.toName}
                                onChange={e => setFormData({...formData, toName: e.target.value})}
                            />
                        </div>
                        <Input 
                            label="Email du destinataire" 
                            type="email"
                            placeholder="ami@exemple.com" 
                            icon={<Mail size={16} />}
                            value={formData.toEmail}
                            onChange={e => setFormData({...formData, toEmail: e.target.value})}
                        />
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase ml-1 block">Petit mot doux (Optionnel)</label>
                            <textarea 
                                className="w-full p-3 rounded-xl border-2 border-black font-bold text-sm resize-none focus:shadow-pop-sm outline-none bg-slate-50 focus:bg-white transition-all"
                                rows={3}
                                placeholder="Joyeux anniversaire ! Profite bien..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-slate-500 uppercase text-xs">Total à payer</span>
                            <span className="font-black text-3xl font-display">{formatPrice(amount)}</span>
                        </div>
                        <Button 
                            onClick={handleBuy} 
                            fullWidth 
                            variant="secondary" 
                            className="py-4 text-lg shadow-pop hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                            icon={<CheckCircle size={20} />}
                        >
                            Offrir cette carte
                        </Button>
                        <p className="text-center text-[10px] font-bold text-slate-400 mt-3 uppercase">
                            Carte valable 1 an sur tous les événements
                        </p>
                    </div>

                </div>

            </div>

        </div>
      </div>
    </MainLayout>
  );
}