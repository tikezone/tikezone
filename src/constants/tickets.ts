
import { TicketTier, TicketTierStyle } from '../types';
import { Crown, Star, User, Users, Zap, Clock } from 'lucide-react';

export const TICKET_THEMES: Record<TicketTierStyle, { bg: string, border: string, text: string, badge: string, icon: any }> = {
  'grand-public': {
    bg: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-900',
    badge: 'bg-slate-100 text-slate-600',
    icon: Users
  },
  'standard': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    badge: 'bg-blue-200 text-blue-800',
    icon: User
  },
  'early-bird': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    badge: 'bg-green-200 text-green-800',
    icon: Clock
  },
  'premium': {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    badge: 'bg-purple-200 text-purple-800',
    icon: Zap
  },
  'vip': {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
    badge: 'bg-yellow-300 text-black',
    icon: Star
  },
  'vvip': {
    bg: 'bg-slate-900',
    border: 'border-black',
    text: 'text-white',
    badge: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black',
    icon: Crown
  }
};

export const TICKET_PRESETS: Partial<TicketTier>[] = [
  {
    name: 'Grand Public',
    price: 5000,
    quantity: 500,
    description: 'Accès général à l\'événement.',
    style: 'grand-public',
    tag: 'PUBLIC'
  },
  {
    name: 'Standard',
    price: 10000,
    quantity: 200,
    description: 'Place assise standard.',
    style: 'standard',
    tag: 'STANDARD'
  },
  {
    name: 'Early Bird',
    price: 3000,
    quantity: 50,
    description: 'Tarif réduit pour les premiers acheteurs.',
    style: 'early-bird',
    tag: 'PROMO -40%'
  },
  {
    name: 'Premium',
    price: 25000,
    quantity: 100,
    description: 'Accès prioritaire et zone réservée.',
    style: 'premium',
    tag: 'PREMIUM'
  },
  {
    name: 'VIP',
    price: 50000,
    quantity: 50,
    description: 'Cocktail dinatoire, placement VIP.',
    style: 'vip',
    tag: 'VIP ACCESS'
  },
  {
    name: 'VVIP',
    price: 100000,
    quantity: 10,
    description: 'Loge privée, rencontre artistes, champagne.',
    style: 'vvip',
    tag: 'ULTRA EXCLUSIVE'
  }
];
