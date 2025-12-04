
'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import { 
  Sparkles, MapPin, Music, Heart, Users, Play, Info, Check, Ticket, 
  Trophy, Gift, Zap, Share2, Clock, Crown, AlertCircle, TrendingUp,
  Wallet, UserPlus, Lock
} from 'lucide-react';

// --- FEATURE 1: VIBE HUNTER COMPONENTS ---
const VibeCard = ({ icon, label, color, bg, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={`relative overflow-hidden p-6 rounded-3xl border-4 border-black transition-all duration-300 w-full text-left group ${active ? 'scale-105 shadow-pop-lg' : 'hover:scale-[1.02] hover:shadow-pop'} ${bg}`}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full border-4 border-black opacity-20 ${color}`}></div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center text-2xl mb-3 shadow-sm group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-black font-display uppercase leading-none text-slate-900">{label}</h3>
      <p className="text-xs font-bold text-slate-700 mt-1 opacity-80">Voir la sélection</p>
    </div>
    {active && (
        <div className="absolute top-3 right-3 bg-black text-white p-1 rounded-full animate-in zoom-in">
            <Check size={12} strokeWidth={4} />
        </div>
    )}
  </button>
);

// --- FEATURE 2: STADIUM MAP COMPONENTS ---
const StadiumZone = ({ name, price, color, available, onClick, selected }: any) => (
  <div 
    onClick={onClick}
    className={`
      cursor-pointer relative group border-4 border-black transition-all duration-300
      ${selected ? 'z-10 scale-105 shadow-xl' : 'hover:opacity-90'}
      ${name === 'Fosse' ? 'h-32 rounded-2xl mx-12 mb-4' : ''}
      ${name.includes('Gradin') ? 'h-full rounded-3xl' : ''}
      ${name === 'VIP' ? 'h-24 rounded-b-full w-2/3 mx-auto mb-4' : ''}
      ${color}
    `}
  >
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="font-black font-display uppercase text-slate-900 text-lg drop-shadow-sm">{name}</span>
        <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded border border-black text-xs font-black shadow-sm transform group-hover:scale-110 transition-transform">
            {price}
        </span>
    </div>
    {selected && (
        <div className="absolute -top-3 -right-3 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-in zoom-in">
            {available} places
        </div>
    )}
  </div>
);

// --- NEW FEATURE: LOYALTY CARD ---
const LoyaltyCard = () => {
    const [points, setPoints] = useState(1250);
    const progress = (points % 2000) / 2000 * 100;

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden border-4 border-black shadow-pop-lg max-w-md mx-auto">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl -mr-16 -mt-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl -ml-16 -mb-16 opacity-20"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-black uppercase tracking-wider flex items-center">
                        <Crown size={14} className="mr-1 text-yellow-400 fill-yellow-400" />
                        Membre Gold
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold uppercase">Mes Vibes</p>
                        <p className="text-3xl font-black font-display text-yellow-400">{points}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-xs font-bold uppercase">
                        <span>Niveau Actuel</span>
                        <span>Prochain: Platinum</span>
                    </div>
                    <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-brand-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium text-right">Plus que {2000 - (points % 2000)} vibes</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Gift size={20} className="mx-auto mb-2 text-brand-300" />
                        <p className="text-[10px] font-black leading-tight">Boisson Offerte</p>
                        <p className="text-[9px] text-slate-400 mt-1">500 pts</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Zap size={20} className="mx-auto mb-2 text-yellow-300" />
                        <p className="text-[10px] font-black leading-tight">Coupe File</p>
                        <p className="text-[9px] text-slate-400 mt-1">1000 pts</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 opacity-50 cursor-not-allowed">
                        <Ticket size={20} className="mx-auto mb-2 text-white" />
                        <p className="text-[10px] font-black leading-tight">Place VIP</p>
                        <p className="text-[9px] text-slate-400 mt-1">5000 pts</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW FEATURE: SPLIT PAY ---
const SplitPayWidget = () => {
    const [friends, setFriends] = useState([
        { name: 'Vous', paid: true, avatar: 'bg-brand-500' },
        { name: 'Sarah', paid: true, avatar: 'bg-blue-500' },
        { name: 'Marc', paid: false, avatar: 'bg-yellow-500' },
        { name: 'Awa', paid: false, avatar: 'bg-green-500' },
    ]);

    const handleSimulate = () => {
        setFriends(prev => prev.map(f => f.name === 'Marc' ? { ...f, paid: true } : f));
    };

    const paidCount = friends.filter(f => f.paid).length;
    const total = friends.length;

    return (
        <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-pop-lg max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black font-display text-xl uppercase">Paiement Groupé</h3>
                <div className="bg-slate-100 px-3 py-1 rounded-lg border-2 border-slate-200 text-xs font-bold">
                    Total: 40.000 F
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {friends.map((friend, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-white font-black text-xs ${friend.avatar}`}>
                                {friend.name.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{friend.name}</span>
                        </div>
                        {friend.paid ? (
                            <span className="text-xs font-black bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200 flex items-center">
                                <Check size={12} className="mr-1" strokeWidth={3} /> Payé
                            </span>
                        ) : (
                            <span className="text-xs font-black bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200 flex items-center animate-pulse">
                                <Clock size={12} className="mr-1" /> En attente
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border-2 border-black border-dashed text-center mb-4">
                <p className="text-xs font-bold text-slate-500 mb-2">{paidCount} / {total} participations validées</p>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${(paidCount/total)*100}%`}}></div>
                </div>
            </div>

            <button 
                onClick={handleSimulate}
                className="w-full py-3 bg-brand-500 text-white font-black rounded-xl border-2 border-black shadow-pop-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center uppercase text-sm"
            >
                <Share2 size={16} className="mr-2" /> Relancer les amis
            </button>
        </div>
    );
};

// --- NEW FEATURE: SMART WAITLIST ---
const SmartWaitlist = () => {
    const [position, setPosition] = useState(42);
    
    useEffect(() => {
        const interval = setInterval(() => {
            setPosition(prev => Math.max(1, prev - Math.floor(Math.random() * 3)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white p-0 rounded-3xl border-4 border-black shadow-pop-lg max-w-sm mx-auto overflow-hidden">
            <div className="bg-red-500 p-4 text-center border-b-4 border-black">
                <h3 className="text-white font-black font-display text-2xl uppercase tracking-wider">Sold Out</h3>
            </div>
            
            <div className="p-8 text-center relative">
                <div className="mb-6 relative inline-block">
                    <div className="w-32 h-32 rounded-full border-4 border-black flex items-center justify-center bg-slate-50 relative z-10">
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase">Position</p>
                            <p className="text-5xl font-black font-display text-slate-900">{position}</p>
                        </div>
                    </div>
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-brand-500 opacity-20 animate-ping"></div>
                </div>

                <p className="text-lg font-bold text-slate-900 mb-2">Vous êtes sur liste d'attente</p>
                <p className="text-sm font-medium text-slate-500 mb-6">
                    Dès qu'un billet se libère, vous aurez 10 minutes pour l'acheter.
                </p>

                <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200 text-left flex items-start gap-3">
                    <TrendingUp className="text-blue-600 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-xs font-black text-blue-800 uppercase">Probabilité : Élevée</p>
                        <p className="text-[10px] font-bold text-blue-600">3 billets libérés dans les 5 dernières minutes.</p>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t-2 border-black text-center">
                <button className="text-xs font-black text-slate-500 uppercase hover:text-red-500">Quitter la file</button>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---
export default function LabPage() {
  const [activeTab, setActiveTab] = useState<'visual' | 'client'>('client');
  
  // Visual Lab States
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  return (
    <MainLayout showAnnouncement={false}>
      <div className="bg-slate-50 min-h-screen pb-20">
        
        {/* Header */}
        <div className="bg-slate-900 text-white py-12 px-4 border-b-4 border-black relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
            <div className="max-w-5xl mx-auto relative z-10 text-center">
                <div className="inline-flex items-center bg-yellow-400 text-black px-4 py-1 rounded-full border-2 border-black font-black uppercase text-sm mb-6 shadow-pop-sm transform -rotate-2">
                    <Sparkles size={16} className="mr-2" /> Tikezone Labs
                </div>
                <h1 className="text-4xl md:text-6xl font-black font-display uppercase mb-4 leading-tight">
                    Le Futur est <span className="text-brand-500">Ici</span>
                </h1>
                
                {/* Tabs Switcher */}
                <div className="flex justify-center mt-8 gap-4">
                    <button 
                        onClick={() => setActiveTab('visual')}
                        className={`px-6 py-3 rounded-xl border-2 font-black text-sm uppercase transition-all ${activeTab === 'visual' ? 'bg-white text-black border-white shadow-pop-sm' : 'bg-transparent border-slate-600 text-slate-400 hover:text-white hover:border-white'}`}
                    >
                        Expérience Visuelle
                    </button>
                    <button 
                        onClick={() => setActiveTab('client')}
                        className={`px-6 py-3 rounded-xl border-2 font-black text-sm uppercase transition-all ${activeTab === 'client' ? 'bg-white text-black border-white shadow-pop-sm' : 'bg-transparent border-slate-600 text-slate-400 hover:text-white hover:border-white'}`}
                    >
                        Engagement Client
                    </button>
                </div>
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-12 space-y-16">

            {/* === TAB: CLIENT ENGAGEMENT === */}
            {activeTab === 'client' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 animate-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Idea 1: Loyalty */}
                    <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                            <div className="flex-1 text-center md:text-left">
                                <div className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg border border-yellow-200 text-xs font-black uppercase mb-2">Fidélité</div>
                                <h2 className="text-3xl font-black font-display text-slate-900 mb-3">TikeClub</h2>
                                <p className="text-slate-600 font-medium">
                                    Transformez chaque achat en jeu. Vos clients gagnent des points, montent de niveau et débloquent des récompenses exclusives.
                                </p>
                            </div>
                            <div className="flex-1 w-full">
                                <LoyaltyCard />
                            </div>
                        </div>
                    </div>

                    {/* Idea 2: Split Pay */}
                    <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-black transition-colors relative group">
                        <div className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                            <Users size={24} />
                        </div>
                        <div className="mb-6 pr-10">
                            <h3 className="text-2xl font-black font-display text-slate-900 mb-2">Split Pay</h3>
                            <p className="text-sm font-bold text-slate-500">
                                Plus besoin d'avancer l'argent. Invitez vos amis, chacun paie sa part, et les billets sont générés.
                            </p>
                        </div>
                        <SplitPayWidget />
                    </div>

                    {/* Idea 3: Smart Waitlist */}
                    <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 hover:border-black transition-colors relative group">
                        <div className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                            <Clock size={24} />
                        </div>
                        <div className="mb-6 pr-10">
                            <h3 className="text-2xl font-black font-display text-slate-900 mb-2">Smart Waitlist</h3>
                            <p className="text-sm font-bold text-slate-500">
                                Sold out ? Pas de panique. Une file d'attente intelligente qui redistribue les billets en temps réel.
                            </p>
                        </div>
                        <SmartWaitlist />
                    </div>

                </div>
            )}


            {/* === TAB: VISUAL EXPERIENCE (Old Lab) === */}
            {activeTab === 'visual' && (
                <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
                    {/* --- PROTOTYPE 1: VIBE HUNTER --- */}
                    <div className="bg-white rounded-[2.5rem] border-4 border-black p-8 md:p-10 shadow-pop-lg relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-6 py-2 rounded-xl border-2 border-black font-black uppercase shadow-sm">
                            Concept #1 : Vibe Hunter
                        </div>
                        
                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-3xl font-black text-slate-900 font-display">Quel est ton mood ?</h2>
                            <p className="text-slate-500 font-bold">Trouvez une sortie qui correspond à votre état d'esprit.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <VibeCard 
                                icon="🔥" 
                                label="Grosse Fête" 
                                bg="bg-red-100" 
                                color="bg-red-400"
                                active={activeVibe === 'party'}
                                onClick={() => setActiveVibe('party')}
                            />
                            <VibeCard 
                                icon="🍷" 
                                label="Chill / Date" 
                                bg="bg-purple-100" 
                                color="bg-purple-400"
                                active={activeVibe === 'chill'}
                                onClick={() => setActiveVibe('chill')}
                            />
                            <VibeCard 
                                icon="👨‍👩‍👧" 
                                label="En Famille" 
                                bg="bg-green-100" 
                                color="bg-green-400"
                                active={activeVibe === 'family'}
                                onClick={() => setActiveVibe('family')}
                            />
                            <VibeCard 
                                icon="🎓" 
                                label="Découverte" 
                                bg="bg-yellow-100" 
                                color="bg-yellow-400"
                                active={activeVibe === 'learn'}
                                onClick={() => setActiveVibe('learn')}
                            />
                        </div>

                        {activeVibe && (
                            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border-2 border-black border-dashed flex items-center justify-center animate-in slide-in-from-top-2">
                                <p className="font-bold text-slate-600 text-sm">
                                    ✨ L'interface afficherait ici 3-4 événements sélectionnés par IA pour le mood <span className="font-black uppercase text-black">{activeVibe}</span>.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* --- PROTOTYPE 2: STADIUM MAP --- */}
                    <div className="bg-white rounded-[2.5rem] border-4 border-black p-8 md:p-10 shadow-pop-lg relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-black px-6 py-2 rounded-xl border-2 border-black font-black uppercase shadow-sm">
                            Concept #2 : Plan Interactif
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mt-4">
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-slate-900 font-display mb-2">Choisissez votre place</h2>
                                <p className="text-slate-500 font-bold mb-6">Visualisez la salle et réservez la meilleure vue.</p>
                                
                                {/* Info Panel */}
                                <div className="bg-slate-50 p-5 rounded-2xl border-2 border-black space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b-2 border-slate-200">
                                        <span className="text-xs font-black uppercase text-slate-400">Zone sélectionnée</span>
                                        <span className="font-black text-xl">{selectedZone || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase text-slate-400">Prix unitaire</span>
                                        <span className="font-black text-xl text-brand-600">
                                            {selectedZone === 'VIP' ? '50.000 F' : selectedZone === 'Fosse' ? '15.000 F' : selectedZone ? '25.000 F' : '-'}
                                        </span>
                                    </div>
                                    <button disabled={!selectedZone} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl shadow-pop-sm disabled:opacity-50 disabled:shadow-none hover:bg-brand-600 transition-colors uppercase text-sm">
                                        Ajouter au panier
                                    </button>
                                </div>
                            </div>

                            {/* The Map Visual */}
                            <div className="w-full md:w-96 h-80 bg-slate-100 rounded-3xl border-4 border-black p-4 relative overflow-hidden flex flex-col">
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Scène</div>
                                
                                {/* Stage Area */}
                                <div className="w-2/3 h-8 bg-slate-800 mx-auto rounded-b-xl border-b-2 border-x-2 border-black mb-6 shadow-lg"></div>

                                {/* VIP */}
                                <StadiumZone 
                                    name="VIP" 
                                    price="50k" 
                                    color="bg-yellow-300" 
                                    available="12"
                                    selected={selectedZone === 'VIP'}
                                    onClick={() => setSelectedZone('VIP')}
                                />

                                {/* Fosse */}
                                <StadiumZone 
                                    name="Fosse" 
                                    price="15k" 
                                    color="bg-blue-300" 
                                    available="140"
                                    selected={selectedZone === 'Fosse'}
                                    onClick={() => setSelectedZone('Fosse')}
                                />

                                {/* Gradins */}
                                <div className="flex justify-between h-full gap-4">
                                    <div className="w-1/3">
                                        <StadiumZone 
                                            name="Gradin A" 
                                            price="25k" 
                                            color="bg-pink-300" 
                                            available="45"
                                            selected={selectedZone === 'Gradin A'}
                                            onClick={() => setSelectedZone('Gradin A')}
                                        />
                                    </div>
                                    <div className="w-1/3">
                                        <StadiumZone 
                                            name="Gradin B" 
                                            price="25k" 
                                            color="bg-pink-300" 
                                            available="32"
                                            selected={selectedZone === 'Gradin B'}
                                            onClick={() => setSelectedZone('Gradin B')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- PROTOTYPE 3: STORIES --- */}
                    <div className="bg-white rounded-[2.5rem] border-4 border-black p-8 md:p-10 shadow-pop-lg relative mb-20">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-400 text-black px-6 py-2 rounded-xl border-2 border-black font-black uppercase shadow-sm">
                            Concept #3 : Event Stories
                        </div>

                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-3xl font-black text-slate-900 font-display">Stories à la Une</h2>
                            <p className="text-slate-500 font-bold">Un format immersif pour découvrir les événements avant d'acheter.</p>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4 justify-center">
                            {[
                                { img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400', title: 'Afro Nation', views: '2.4k' },
                                { img: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=400', title: 'Fally Ipupa', views: '1.2k' },
                                { img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=400', title: 'Grillades', views: '850' },
                            ].map((story, i) => (
                                <div key={i} className="relative w-40 h-64 rounded-3xl border-4 border-black overflow-hidden shadow-pop hover:-translate-y-2 transition-transform cursor-pointer group flex-shrink-0">
                                    <img src={story.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Story" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
                                    
                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded border border-black animate-pulse">
                                        LIVE
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <div className="w-8 h-8 rounded-full border-2 border-white p-0.5 mb-2">
                                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-full h-full rounded-full" alt="Avatar" />
                                        </div>
                                        <p className="text-white font-black text-sm leading-tight drop-shadow-md">{story.title}</p>
                                        <p className="text-white/80 text-[10px] font-bold flex items-center mt-1">
                                            <Play size={10} className="mr-1 fill-white" /> {story.views} vues
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </MainLayout>
  );
}
