
'use client';

import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, CheckCircle, Handshake } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    subject: 'support',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) return;

    setIsSubmitting(true);
    // Simulation API
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSent(true);
        setFormData({ name: '', contact: '', subject: 'support', message: '' });
    }, 1500);
  };

  return (
    <MainLayout showAnnouncement={false}>
      <div className="bg-brand-50 min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 font-display mb-4 uppercase drop-shadow-sm">
              Contactez-nous
            </h1>
            <p className="text-lg font-bold text-slate-600 max-w-xl mx-auto">
              Une question sur un billet ? Envie de devenir partenaire ? Notre équipe est là pour vous 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* LEFT: FORM */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border-4 border-black shadow-pop order-2 lg:order-1">
                {isSent ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in">
                        <div className="w-20 h-20 bg-green-400 rounded-full border-4 border-black flex items-center justify-center mb-6 shadow-pop-sm">
                            <CheckCircle size={40} className="text-white" strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase mb-2">Message Reçu !</h3>
                        <p className="text-slate-600 font-bold max-w-xs">
                            Merci {formData.name}, nous avons bien reçu votre demande. Une réponse vous sera envoyée sous 24h.
                        </p>
                        <Button 
                            variant="white" 
                            className="mt-8" 
                            onClick={() => setIsSent(false)}
                        >
                            Envoyer un autre message
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-black"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black"></div>
                            <h3 className="font-black text-xl ml-auto uppercase">Formulaire</h3>
                        </div>

                        <Input 
                            label="Nom Complet" 
                            placeholder="Jean Kouassi" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                        <Input 
                            label="Email ou Téléphone" 
                            placeholder="contact@exemple.com" 
                            value={formData.contact}
                            onChange={e => setFormData({...formData, contact: e.target.value})}
                            required
                        />
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-900 uppercase ml-1 block">Sujet</label>
                            <div className="relative">
                                <select 
                                    className="w-full px-4 py-3 rounded-xl border-2 border-black font-bold text-sm bg-white focus:shadow-pop-sm outline-none appearance-none cursor-pointer"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                >
                                    <option value="support">Aide & Support Client</option>
                                    <option value="partner">🤝 Devenir Partenaire / Organisateur</option>
                                    <option value="refund">Remboursement</option>
                                    <option value="other">Autre demande</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-900 uppercase ml-1 block">Votre Message</label>
                            <textarea 
                                rows={5}
                                className="w-full p-4 rounded-xl border-2 border-black font-bold text-sm bg-slate-50 focus:bg-white focus:shadow-pop-sm outline-none resize-none placeholder-slate-400 transition-all"
                                placeholder="Dites-nous tout..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                required
                            />
                        </div>

                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="secondary" 
                            isLoading={isSubmitting} 
                            icon={<Send size={18}/>}
                            className="py-4 text-lg"
                        >
                            Envoyer le message
                        </Button>
                    </form>
                )}
            </div>

            {/* RIGHT: INFO CARDS */}
            <div className="space-y-6 order-1 lg:order-2">
                
                {/* Partner Callout */}
                <div className="bg-slate-900 text-white p-6 rounded-2xl border-4 border-black shadow-pop transform rotate-1 hover:rotate-0 transition-transform">
                    <div className="flex items-start gap-4">
                        <div className="bg-yellow-400 p-3 rounded-xl border-2 border-black text-black">
                            <Handshake size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black font-display uppercase mb-1">Devenir Partenaire ?</h3>
                            <p className="text-sm font-medium opacity-90 mb-3">
                                Vous organisez un événement ? Contactez-nous pour profiter de nos solutions de billetterie pro.
                            </p>
                            <button 
                                onClick={() => setFormData({...formData, subject: 'partner'})}
                                className="text-xs font-black bg-white text-black px-3 py-1.5 rounded-lg border-2 border-transparent hover:border-white hover:bg-black hover:text-white transition-all uppercase"
                            >
                                Faire une demande
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <a href="tel:+2250700000000" className="bg-white rounded-2xl border-2 border-black p-5 hover:bg-brand-50 transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white rounded-xl border-2 border-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Phone size={20} className="text-slate-900" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase">Appel Direct</p>
                            <p className="font-black text-lg text-slate-900">+225 07 00 00 00</p>
                        </div>
                    </a>

                    <a href="https://wa.me/2250700000000" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl border-2 border-black p-5 hover:bg-green-50 transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white rounded-xl border-2 border-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <MessageCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase">WhatsApp</p>
                            <p className="font-black text-lg text-slate-900">Chatter avec nous</p>
                        </div>
                    </a>

                    <a href="mailto:support@tikezone.com" className="bg-white rounded-2xl border-2 border-black p-5 hover:bg-blue-50 transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white rounded-xl border-2 border-black flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <Mail size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase">Email</p>
                            <p className="font-black text-lg text-slate-900">support@tikezone.com</p>
                        </div>
                    </a>
                </div>

                <div className="bg-white rounded-2xl border-2 border-black p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <MapPin className="text-black shrink-0 mt-1" />
                        <div>
                            <p className="font-bold text-slate-900">Siège Social</p>
                            <p className="text-sm font-medium text-slate-600">Cocody, Riviera 2, Abidjan</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-100">
                        <Clock className="text-black shrink-0 mt-1" />
                        <div>
                            <p className="font-bold text-slate-900">Horaires d'ouverture</p>
                            <p className="text-sm font-medium text-slate-600">Lundi - Samedi : 08h00 - 20h00</p>
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}
