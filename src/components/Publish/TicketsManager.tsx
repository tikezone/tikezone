
'use client';

import React, { useState } from 'react';
import { TicketTier, TicketTierStyle, PromoType } from '../../types';
import { TICKET_PRESETS, TICKET_THEMES } from '../../constants/tickets';
import TicketVisual from './TicketVisual';
import Button from '../UI/Button';
import Input from '../UI/Input';
import { Plus, X, Save, Sparkles, Tag, Percent, DollarSign, Key } from 'lucide-react';
import MoneyPotSection from './MoneyPotSection';

interface TicketsManagerProps {
  tickets: TicketTier[];
  onChange: (tickets: TicketTier[]) => void;
}

const TicketsManager: React.FC<TicketsManagerProps> = ({ tickets, onChange }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TicketTier | null>(null);

  // Add a ticket from preset
  const addPreset = (preset: Partial<TicketTier>) => {
    const newTicket: TicketTier = {
      id: Math.random().toString(36).substr(2, 9),
      name: preset.name || 'Nouveau Ticket',
      price: preset.price || 0,
      quantity: preset.quantity || 100,
      description: preset.description || '',
      style: preset.style || 'standard',
      tag: preset.tag || 'STANDARD',
      promoType: 'none',
      promoValue: 0,
      promoCode: ''
    };
    onChange([...tickets, newTicket]);
  };

  // Delete ticket
  const removeTicket = (index: number) => {
    const newTickets = [...tickets];
    newTickets.splice(index, 1);
    onChange(newTickets);
  };

  // Start editing
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...tickets[index] });
  };

  // Save changes
  const saveEdit = () => {
    if (editingIndex !== null && editForm) {
      const newTickets = [...tickets];
      newTickets[editingIndex] = editForm;
      onChange(newTickets);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  // Create Custom
  const addCustom = () => {
    const newTicket: TicketTier = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Mon Ticket',
      price: 0,
      quantity: 100,
      description: '',
      style: 'standard',
      tag: 'PERSO',
      promoType: 'none',
      promoValue: 0,
      promoCode: ''
    };
    onChange([...tickets, newTicket]);
    startEdit(tickets.length); // Start editing the new ticket immediately
  };

  // Calculate final price for preview
  const calculateFinalPrice = (ticket: TicketTier) => {
    const basePrice = ticket.price || 0;
    if (!ticket.promoType || ticket.promoType === 'none') return basePrice;
    
    const value = ticket.promoValue || 0;

    if (ticket.promoType === 'percentage') {
      const discount = basePrice * (value / 100);
      return Math.max(0, basePrice - discount);
    }
    
    if (ticket.promoType === 'fixed_price') {
      return Math.max(0, value);
    }
    
    return basePrice;
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      
      {/* Header */}
      <div className="text-center">
         <h3 className="text-2xl font-black font-display text-white">La Billetterie</h3>
         <p className="text-gray-400 font-bold text-xs mt-1">Configurez vos offres et promotions.</p>
      </div>

      {/* 1. Quick Add Presets */}
      {!editingIndex && editingIndex !== 0 && (
        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 border-dashed">
            <p className="text-xs font-black text-gray-400 uppercase mb-3 flex items-center">
                <Sparkles size={14} className="mr-1 text-orange-400" /> Ajout Rapide
            </p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {TICKET_PRESETS.map((preset, idx) => {
                    const theme = TICKET_THEMES[preset.style as TicketTierStyle];
                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => addPreset(preset)}
                            className={`
                                flex-shrink-0 px-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl hover:border-orange-400 hover:bg-white/20 transition-all text-xs font-bold whitespace-nowrap flex flex-col items-start gap-1 group min-w-[120px]
                            `}
                        >
                            <span className={`px-1.5 rounded text-[9px] font-black uppercase border border-current ${theme.text}`}>
                                {preset.style}
                            </span>
                            <span className="text-white group-hover:text-orange-400 font-black">{preset.name}</span>
                        </button>
                    )
                })}
                <button
                    type="button"
                    onClick={addCustom}
                    className="flex-shrink-0 px-4 py-2 rounded-xl border border-dashed border-white/20 hover:border-orange-400 hover:bg-white/10 transition-all text-xs font-bold text-gray-400 hover:text-orange-400 flex items-center justify-center min-w-[100px]"
                >
                    <Plus size={16} className="mr-1" /> Custom
                </button>
            </div>
        </div>
      )}

      {/* 2. Edit Form (Overlay or Inline) */}
      {editingIndex !== null && editForm && (
        <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-white/20 shadow-2xl relative z-20">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h4 className="text-lg font-black font-display uppercase text-white">Modifier le ticket</h4>
                <button onClick={() => setEditingIndex(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input 
                    label="Nom du ticket" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Ex: VIP Gold"
                />
                
                <div className="space-y-2">
                    <label className="text-xs font-black text-gray-300 uppercase ml-1 block">Style Visuel</label>
                    <select 
                        className="w-full px-4 py-3 rounded-xl border border-white/20 font-bold text-sm focus:border-orange-400 outline-none bg-white/5 text-white appearance-none cursor-pointer"
                        value={editForm.style}
                        onChange={(e) => setEditForm({...editForm, style: e.target.value as TicketTierStyle})}
                    >
                        {Object.keys(TICKET_THEMES).map(key => (
                            <option key={key} value={key} className="bg-gray-900 text-white">{key.toUpperCase().replace('-', ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <Input 
                    label="Tag / Badge (Optionnel)"
                    icon={<Tag size={16} />}
                    value={editForm.tag || ''}
                    onChange={(e) => setEditForm({...editForm, tag: e.target.value})}
                    placeholder="Ex: SOLD OUT, EARLY BIRD..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <Input 
                    label="Prix de base" 
                    type="number"
                    rightElement={<span className="text-xs font-black text-gray-400">FCFA</span>}
                    value={editForm.price} 
                    onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value) || 0})}
                />
                <Input 
                    label="Quantité" 
                    type="number"
                    value={editForm.quantity} 
                    onChange={(e) => setEditForm({...editForm, quantity: parseInt(e.target.value) || 0})}
                />
            </div>

            {/* --- PROMOTION SECTION --- */}
            <div className="bg-orange-500/10 p-4 rounded-xl border border-orange-500/30 border-dashed mb-6 relative">
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                    Offre Spéciale
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-300 uppercase ml-1 block">Type de Promo</label>
                        <select 
                            className="w-full px-4 py-3 rounded-xl border border-white/20 font-bold text-sm focus:border-orange-400 outline-none bg-white/5 text-white appearance-none cursor-pointer"
                            value={editForm.promoType || 'none'}
                            onChange={(e) => setEditForm({...editForm, promoType: e.target.value as PromoType, promoValue: 0})}
                        >
                            <option value="none" className="bg-gray-900 text-white">Aucune</option>
                            <option value="percentage" className="bg-gray-900 text-white">Pourcentage (%)</option>
                            <option value="fixed_price" className="bg-gray-900 text-white">Nouveau Prix Fixe</option>
                        </select>
                    </div>

                    {editForm.promoType !== 'none' && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-300 uppercase ml-1 block">
                                {editForm.promoType === 'percentage' ? 'Pourcentage de réduction' : 'Nouveau Prix'}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-400">
                                    {editForm.promoType === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                                </div>
                                <input 
                                    type="number"
                                    className="w-full pl-10 px-4 py-3 rounded-xl border border-white/20 font-bold text-sm focus:border-orange-400 outline-none bg-white/5 text-white"
                                    value={editForm.promoValue || ''}
                                    placeholder="0"
                                    onChange={(e) => setEditForm({...editForm, promoValue: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {editForm.promoType !== 'none' && (
                    <div className="mt-4 animate-in slide-in-from-top-2">
                        <Input 
                            label="Code Promo (Optionnel)" 
                            icon={<Key size={16} />}
                            placeholder="Ex: VIP2025 (Laisser vide pour appliquer à tous)"
                            value={editForm.promoCode || ''}
                            onChange={(e) => setEditForm({...editForm, promoCode: e.target.value})}
                            containerClassName="bg-white/5 rounded-xl"
                        />
                        <p className="text-[10px] text-gray-500 font-bold mt-1 ml-1">
                            Ce code sera demandé à l'acheteur pour débloquer le tarif spécial.
                        </p>
                        <div className="mt-3 text-right">
                            <span className="text-xs font-bold text-gray-400 mr-2">Prix final :</span>
                            <span className="text-xl font-black text-green-400 bg-green-500/20 px-2 py-1 rounded-lg border border-green-500/30">
                                {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(calculateFinalPrice(editForm))} F
                            </span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-6">
                <label className="text-xs font-black text-gray-300 uppercase ml-1 block mb-2">Avantages & Description</label>
                <textarea 
                    className="w-full p-3 rounded-xl border border-white/20 font-bold text-sm resize-none focus:border-orange-400 outline-none bg-white/5 text-white placeholder-gray-500"
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    placeholder="Dites à vos fans ce qu'ils obtiennent..."
                />
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setEditingIndex(null)}>Annuler</Button>
                <Button variant="primary" onClick={saveEdit} icon={<Save size={16}/>}>Enregistrer</Button>
            </div>
        </div>
      )}

      {/* 3. List of Added Tickets */}
      <div className="space-y-4">
        {tickets.length === 0 ? (
            <div className="text-center py-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 border-dashed">
                <p className="text-gray-400 font-bold text-sm">Aucun ticket créé. Utilisez les modèles ci-dessus !</p>
            </div>
        ) : (
            tickets.map((ticket, idx) => (
                <div key={ticket.id || `ticket-${idx}`} className={editingIndex === idx ? 'opacity-50 pointer-events-none blur-[1px]' : ''}>
                    <TicketVisual 
                        index={idx}
                        ticket={ticket} 
                        onEdit={() => startEdit(idx)} 
                        onDelete={() => removeTicket(idx)}
                    />
                </div>
            ))
        )}
      </div>

      {/* 4. Money Pot / Cagnotte Option */}
      <div className="pt-8 border-t border-white/10 border-dashed">
         <MoneyPotSection />
      </div>

    </div>
  );
};

export default TicketsManager;
