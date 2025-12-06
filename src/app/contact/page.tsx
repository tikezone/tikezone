
'use client';

import React, { useState } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
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
    setTimeout(() => {
        setIsSubmitting(false);
        setIsSent(true);
        setFormData({ name: '', contact: '', subject: 'support', message: '' });
    }, 1500);
  };

  return (
    <MainLayout showAnnouncement={false}>
      <div className="min-h-screen bg-black relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white font-display mb-4 uppercase">
              Contactez-nous
            </h1>
            <p className="text-lg font-bold text-gray-400 max-w-xl mx-auto">
              Une question sur un billet ? Envie de devenir partenaire ? Notre équipe est là pour vous 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            <div className="bg-white/10 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/20 order-2 lg:order-1">
                {isSent ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                            <CheckCircle size={40} className="text-white" strokeWidth={3} />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase mb-2">Message Reçu !</h3>
                        <p className="text-gray-400 font-bold max-w-xs">
                            Merci, nous avons bien reçu votre demande. Une réponse vous sera envoyée sous 24h.
                        </p>
                        <button 
                            onClick={() => setIsSent(false)}
                            className="mt-8 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-bold transition-all border border-white/10"
                        >
                            Envoyer un autre message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <h3 className="font-black text-xl ml-auto uppercase text-white">Formulaire</h3>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Nom Complet</label>
                          <input 
                            type="text"
                            placeholder="Jean Kouassi" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-300 mb-2">Email ou Téléphone</label>
                          <input 
                            type="text"
                            placeholder="contact@exemple.com" 
                            value={formData.contact}
                            onChange={e => setFormData({...formData, contact: e.target.value})}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
                          />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Sujet</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                >
                                    <option value="support" className="bg-gray-900">Aide & Support Client</option>
                                    <option value="partner" className="bg-gray-900">Devenir Partenaire / Organisateur</option>
                                    <option value="refund" className="bg-gray-900">Remboursement</option>
                                    <option value="other" className="bg-gray-900">Autre demande</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Votre Message</label>
                            <textarea 
                                rows={5}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 resize-none"
                                placeholder="Dites-nous tout..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <><Send size={18}/> Envoyer le message</>
                            )}
                        </button>
                    </form>
                )}
            </div>

            <div className="space-y-6 order-1 lg:order-2">
                
                <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl text-white p-6 rounded-3xl border border-white/20">
                    <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl text-white shadow-lg shadow-orange-500/30">
                            <Handshake size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black font-display uppercase mb-1">Devenir Partenaire ?</h3>
                            <p className="text-sm font-medium text-gray-400 mb-3">
                                Vous organisez un événement ? Contactez-nous pour profiter de nos solutions de billetterie pro.
                            </p>
                            <button 
                                onClick={() => setFormData({...formData, subject: 'partner'})}
                                className="text-xs font-black bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/10 transition-all uppercase"
                            >
                                Faire une demande
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <a href="tel:+2250700000000" className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-5 hover:bg-white/15 transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Phone size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-500 uppercase">Appel Direct</p>
                            <p className="font-black text-lg text-white">+225 07 00 00 00</p>
                        </div>
                    </a>

                    <a href="https://wa.me/2250700000000" target="_blank" rel="noopener noreferrer" className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-5 hover:bg-green-500/20 transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl border border-green-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageCircle size={20} className="text-green-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-500 uppercase">WhatsApp</p>
                            <p className="font-black text-lg text-white">Chatter avec nous</p>
                        </div>
                    </a>

                    <a href="mailto:support@tikezone.com" className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-5 hover:bg-blue-500/20 transition-colors flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Mail size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-500 uppercase">Email</p>
                            <p className="font-black text-lg text-white">support@tikezone.com</p>
                        </div>
                    </a>
                </div>

                <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6">
                    <div className="flex items-start gap-3">
                        <MapPin className="text-orange-400 shrink-0 mt-1" />
                        <div>
                            <p className="font-bold text-white">Siège Social</p>
                            <p className="text-sm font-medium text-gray-400">Cocody, Riviera 2, Abidjan</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 mt-4 pt-4 border-t border-white/10">
                        <Clock className="text-orange-400 shrink-0 mt-1" />
                        <div>
                            <p className="font-bold text-white">Horaires d'ouverture</p>
                            <p className="text-sm font-medium text-gray-400">Lundi - Samedi : 08h00 - 20h00</p>
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
