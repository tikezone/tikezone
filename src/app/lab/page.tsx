
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
    className={`relative overflow-hidden p-6 rounded-3xl border border-white/20 transition-all duration-300 w-full text-left group backdrop-blur-xl ${active ? 'scale-105 shadow-lg shadow-orange-500/30 bg-white/20' : 'hover:scale-[1.02] hover:bg-white/15 bg-white/10'}`}
  >
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-30 ${color}`}></div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl mb-3 group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-black font-display uppercase leading-none text-white">{label}</h3>
      <p className="text-xs font-bold text-gray-400 mt-1">Voir la sélection</p>
    </div>
    {active && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-1 rounded-full animate-in zoom-in">
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
      cursor-pointer relative group border border-white/20 transition-all duration-300 backdrop-blur-xl
      ${selected ? 'z-10 scale-105 shadow-xl shadow-orange-500/30' : 'hover:opacity-90'}
      ${name === 'Fosse' ? 'h-32 rounded-2xl mx-12 mb-4' : ''}
      ${name.includes('Gradin') ? 'h-full rounded-3xl' : ''}
      ${name === 'VIP' ? 'h-24 rounded-b-full w-2/3 mx-auto mb-4' : ''}
      ${color}
    `}
  >
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
        <span className="font-black font-display uppercase text-white text-lg drop-shadow-sm">{name}</span>
        <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-xs font-black text-white transform group-hover:scale-110 transition-transform">
            {price}
        </span>
    </div>
    {selected && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg animate-in zoom-in">
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
        <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 text-white relative overflow-hidden border border-white/20 max-w-md mx-auto">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full blur-3xl -mr-16 -mt-16 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600 rounded-full blur-3xl -ml-16 -mb-16 opacity-20"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-black uppercase tracking-wider flex items-center">
                        <Crown size={14} className="mr-1 text-orange-400 fill-orange-400" />
                        Membre Gold
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase">Mes Vibes</p>
                        <p className="text-3xl font-black font-display text-orange-400">{points}</p>
                    </div>
                </div>

                <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-xs font-bold uppercase">
                        <span className="text-gray-400">Niveau Actuel</span>
                        <span className="text-gray-400">Prochain: Platinum</span>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium text-right">Plus que {2000 - (points % 2000)} vibes</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Gift size={20} className="mx-auto mb-2 text-orange-400" />
                        <p className="text-[10px] font-black leading-tight text-white">Boisson Offerte</p>
                        <p className="text-[9px] text-gray-500 mt-1">500 pts</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                        <Zap size={20} className="mx-auto mb-2 text-orange-300" />
                        <p className="text-[10px] font-black leading-tight text-white">Coupe File</p>
                        <p className="text-[9px] text-gray-500 mt-1">1000 pts</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center border border-white/10 opacity-50 cursor-not-allowed">
                        <Ticket size={20} className="mx-auto mb-2 text-white" />
                        <p className="text-[10px] font-black leading-tight text-white">Place VIP</p>
                        <p className="text-[9px] text-gray-500 mt-1">5000 pts</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- NEW FEATURE: SPLIT PAY ---
const SplitPayWidget = () => {
    const [friends, setFriends] = useState([
        { name: 'Vous', paid: true, avatar: 'bg-orange-500' },
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
        <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black font-display text-xl uppercase text-white">Paiement Groupé</h3>
                <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/20 text-xs font-bold text-white">
                    Total: 40.000 F
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {friends.map((friend, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white font-black text-xs ${friend.avatar}`}>
                                {friend.name.charAt(0)}
                            </div>
                            <span className="font-bold text-white">{friend.name}</span>
                        </div>
                        {friend.paid ? (
                            <span className="text-xs font-black bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30 flex items-center">
                                <Check size={12} className="mr-1" strokeWidth={3} /> Payé
                            </span>
                        ) : (
                            <span className="text-xs font-black bg-white/10 text-gray-400 px-2 py-1 rounded border border-white/20 flex items-center animate-pulse">
                                <Clock size={12} className="mr-1" /> En attente
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 border-dashed text-center mb-4">
                <p className="text-xs font-bold text-gray-400 mb-2">{paidCount} / {total} participations validées</p>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500" style={{width: `${(paidCount/total)*100}%`}}></div>
                </div>
            </div>

            <button 
                onClick={handleSimulate}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all flex items-center justify-center uppercase text-sm"
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
        <div className="bg-white/10 backdrop-blur-2xl p-0 rounded-3xl border border-white/20 max-w-sm mx-auto overflow-hidden">
            <div className="bg-red-500/80 backdrop-blur-md p-4 text-center border-b border-white/20">
                <h3 className="text-white font-black font-display text-2xl uppercase tracking-wider">Sold Out</h3>
            </div>
            
            <div className="p-8 text-center relative">
                <div className="mb-6 relative inline-block">
                    <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-xl relative z-10">
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase">Position</p>
                            <p className="text-5xl font-black font-display text-white">{position}</p>
                        </div>
                    </div>
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-orange-500 opacity-20 animate-ping"></div>
                </div>

                <p className="text-lg font-bold text-white mb-2">Vous êtes sur liste d'attente</p>
                <p className="text-sm font-medium text-gray-400 mb-6">
                    Dès qu'un billet se libère, vous aurez 10 minutes pour l'acheter.
                </p>

                <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30 text-left flex items-start gap-3">
                    <TrendingUp className="text-blue-400 shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-xs font-black text-blue-300 uppercase">Probabilité : Élevée</p>
                        <p className="text-[10px] font-bold text-blue-400">3 billets libérés dans les 5 dernières minutes.</p>
                    </div>
                </div>
            </div>
            
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
                <button className="text-xs font-black text-gray-500 uppercase hover:text-red-400 transition-colors">Quitter la file</button>
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
      <div className="min-h-screen pb-20 bg-black bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black">
        
        {/* Header */}
        <div className="py-12 px-4 border-b border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="max-w-5xl mx-auto relative z-10 text-center">
                <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full font-black uppercase text-sm mb-6 shadow-lg shadow-orange-500/30 transform -rotate-2">
                    <Sparkles size={16} className="mr-2" /> Tikezone Labs
                </div>
                <h1 className="text-4xl md:text-6xl font-black font-display uppercase mb-4 leading-tight text-white">
                    Le Futur est <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Ici</span>
                </h1>
                
                {/* Tabs Switcher */}
                <div className="flex justify-center mt-8 gap-4">
                    <button 
                        onClick={() => setActiveTab('visual')}
                        className={`px-6 py-3 rounded-2xl border font-black text-sm uppercase transition-all ${activeTab === 'visual' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30' : 'bg-white/10 backdrop-blur-xl border-white/20 text-gray-400 hover:text-white hover:border-white/40'}`}
                    >
                        Expérience Visuelle
                    </button>
                    <button 
                        onClick={() => setActiveTab('client')}
                        className={`px-6 py-3 rounded-2xl border font-black text-sm uppercase transition-all ${activeTab === 'client' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/30' : 'bg-white/10 backdrop-blur-xl border-white/20 text-gray-400 hover:text-white hover:border-white/40'}`}
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
                                <div className="inline-block bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg border border-orange-500/30 text-xs font-black uppercase mb-2">Fidélité</div>
                                <h2 className="text-3xl font-black font-display text-white mb-3">TikeClub</h2>
                                <p className="text-gray-400 font-medium">
                                    Transformez chaque achat en jeu. Vos clients gagnent des points, montent de niveau et débloquent des récompenses exclusives.
                                </p>
                            </div>
                            <div className="flex-1 w-full">
                                <LoyaltyCard />
                            </div>
                        </div>
                    </div>

                    {/* Idea 2: Split Pay */}
                    <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-colors relative group">
                        <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors text-gray-400">
                            <Users size={24} />
                        </div>
                        <div className="mb-6 pr-10">
                            <h3 className="text-2xl font-black font-display text-white mb-2">Split Pay</h3>
                            <p className="text-sm font-bold text-gray-400">
                                Plus besoin d'avancer l'argent. Invitez vos amis, chacun paie sa part, et les billets sont générés.
                            </p>
                        </div>
                        <SplitPayWidget />
                    </div>

                    {/* Idea 3: Smart Waitlist */}
                    <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-colors relative group">
                        <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-full group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors text-gray-400">
                            <Clock size={24} />
                        </div>
                        <div className="mb-6 pr-10">
                            <h3 className="text-2xl font-black font-display text-white mb-2">Smart Waitlist</h3>
                            <p className="text-sm font-bold text-gray-400">
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
                    <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 p-8 md:p-10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-xl font-black uppercase shadow-lg shadow-blue-500/30">
                            Concept #1 : Vibe Hunter
                        </div>
                        
                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-3xl font-black text-white font-display">Quel est ton mood ?</h2>
                            <p className="text-gray-400 font-bold">Trouvez une sortie qui correspond à votre état d'esprit.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <VibeCard 
                                icon="🔥" 
                                label="Grosse Fête" 
                                bg="bg-red-500/20" 
                                color="bg-red-400"
                                active={activeVibe === 'party'}
                                onClick={() => setActiveVibe('party')}
                            />
                            <VibeCard 
                                icon="🍷" 
                                label="Chill / Date" 
                                bg="bg-purple-500/20" 
                                color="bg-purple-400"
                                active={activeVibe === 'chill'}
                                onClick={() => setActiveVibe('chill')}
                            />
                            <VibeCard 
                                icon="👨‍👩‍👧" 
                                label="En Famille" 
                                bg="bg-green-500/20" 
                                color="bg-green-400"
                                active={activeVibe === 'family'}
                                onClick={() => setActiveVibe('family')}
                            />
                            <VibeCard 
                                icon="🎓" 
                                label="Découverte" 
                                bg="bg-yellow-500/20" 
                                color="bg-yellow-400"
                                active={activeVibe === 'learn'}
                                onClick={() => setActiveVibe('learn')}
                            />
                        </div>

                        {activeVibe && (
                            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 border-dashed flex items-center justify-center animate-in slide-in-from-top-2">
                                <p className="font-bold text-gray-400 text-sm">
                                    ✨ L'interface afficherait ici 3-4 événements sélectionnés par IA pour le mood <span className="font-black uppercase text-white">{activeVibe}</span>.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* --- PROTOTYPE 2: STADIUM MAP --- */}
                    <div className="bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 p-8 md:p-10 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-xl font-black uppercase shadow-lg shadow-orange-500/30">
                            Concept #2 : Plan Interactif
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 mt-4">
                            <div className="flex-1">
                                <h2 className="text-3xl font-black text-white font-display mb-2">Choisissez votre place</h2>
                                <p className="text-gray-400 font-bold mb-6">Visualisez la salle et réservez la meilleure vue.</p>
                                
                                {/* Info Panel */}
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/20 space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-xs font-black uppercase text-gray-500">Zone sélectionnée</span>
                                        <span className="font-black text-xl text-white">{selectedZone || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black uppercase text-gray-500">Prix unitaire</span>
                                        <span className="font-black text-xl text-orange-400">
                                            {selectedZone === 'VIP' ? '50.000 F' : selectedZone === 'Fosse' ? '15.000 F' : selectedZone ? '25.000 F' : '-'}
                                        </span>
                                    </div>
                                    <button disabled={!selectedZone} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-3 rounded-2xl shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:shadow-none hover:shadow-xl transition-all uppercase text-sm">
                                        Ajouter au panier
                                    </button>
                                </div>
                            </div>

                            {/* The Map Visual */}
                            <div className="w-full md:w-96 h-80 bg-white/5 rounded-3xl border border-white/20 p-4 relative overflow-hidden flex flex-col">
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">Scène</div>
                                
                                {/* Stage Area */}
                                <div className="w-2/3 h-8 bg-white/20 mx-auto rounded-b-xl border-b border-x border-white/20 mb-6 shadow-lg"></div>

                                {/* VIP */}
                                <StadiumZone 
                                    name="VIP" 
                                    price="50.000 F" 
                                    color="bg-orange-500/30"
                                    available={12}
                                    selected={selectedZone === 'VIP'}
                                    onClick={() => setSelectedZone('VIP')}
                                />

                                {/* Fosse */}
                                <StadiumZone 
                                    name="Fosse" 
                                    price="15.000 F" 
                                    color="bg-green-500/30"
                                    available={120}
                                    selected={selectedZone === 'Fosse'}
                                    onClick={() => setSelectedZone('Fosse')}
                                />
                                
                                {/* Gradins */}
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <StadiumZone 
                                        name="Gradin G" 
                                        price="25.000 F" 
                                        color="bg-blue-500/30"
                                        available={80}
                                        selected={selectedZone === 'Gradin G'}
                                        onClick={() => setSelectedZone('Gradin G')}
                                    />
                                    <StadiumZone 
                                        name="Gradin D" 
                                        price="25.000 F" 
                                        color="bg-purple-500/30"
                                        available={65}
                                        selected={selectedZone === 'Gradin D'}
                                        onClick={() => setSelectedZone('Gradin D')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </MainLayout>
  );
}
