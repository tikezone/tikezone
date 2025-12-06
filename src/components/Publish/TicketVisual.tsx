import React from 'react';
import { TicketTier } from '../../types';
import { TICKET_THEMES } from '../../constants/tickets';
import { QrCode, Trash2, Edit3, Tag, Sparkles } from 'lucide-react';

interface TicketVisualProps {
  ticket: TicketTier;
  onEdit?: () => void;
  onDelete?: () => void;
  index: number;
}

const TicketVisual: React.FC<TicketVisualProps> = ({ ticket, onEdit, onDelete, index }) => {
  const theme = TICKET_THEMES[ticket.style || 'standard'];
  const Icon = theme.icon;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 })
      .format(price)
      .replace('XOF', 'F');

  let finalPrice = ticket.price;
  let hasPromo = false;
  if (ticket.promoType && ticket.promoType !== 'none' && ticket.promoValue) {
    hasPromo = true;
    if (ticket.promoType === 'percentage') {
      finalPrice = ticket.price - (ticket.price * ticket.promoValue) / 100;
    } else if (ticket.promoType === 'fixed_price') {
      finalPrice = ticket.promoValue;
    }
  }

  return (
    <div className="relative group">
      <div className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:border-orange-400/50">
        <div className="p-4 md:p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/30 text-[10px] font-black uppercase shadow-sm ${theme.badge}`}
                >
                  <Icon size={10} strokeWidth={3} />
                  {ticket.tag || ticket.style}
                </span>
                {ticket.promoCode && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-yellow-400/50 text-[10px] font-black uppercase bg-yellow-500/20 text-yellow-400 shadow-sm">
                    <Tag size={10} strokeWidth={3} /> Code {ticket.promoCode}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-black font-display text-white">{ticket.name || 'Nom du ticket'}</span>
                <span className="text-2xl font-black font-display text-orange-400">
                  {formatPrice(hasPromo ? finalPrice : ticket.price)}
                </span>
                {hasPromo && (
                  <span className="text-sm font-black text-red-400 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full">
                    Promo {ticket.promoType === 'percentage' ? `-${ticket.promoValue}%` : 'Active'}
                  </span>
                )}
              </div>

              <p className="text-sm font-bold text-gray-400">{ticket.description || 'Aucune description.'}</p>

              <div className="flex flex-wrap gap-2 text-[11px] font-black uppercase">
                <span className="px-2 py-1 rounded-full bg-white/10 border border-white/20 text-gray-400">
                  Stock {ticket.quantity}
                </span>
                {!hasPromo && (
                  <span className="px-2 py-1 rounded-full bg-white/10 border border-white/20 text-gray-400">
                    Tarif standard
                  </span>
                )}
                {hasPromo && (
                  <span className="px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 inline-flex items-center gap-1">
                    <Sparkles size={12} /> Tarif promo
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="opacity-30 text-gray-500">
                <QrCode size={36} />
              </div>
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="bg-white/10 backdrop-blur-xl p-2 rounded-lg border border-white/20 hover:bg-white/20 hover:border-orange-400 transition-all"
                    title="Modifier"
                  >
                    <Edit3 size={16} className="text-gray-300" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="bg-red-500/20 p-2 rounded-lg border border-red-500/30 hover:bg-red-500/40 hover:border-red-400 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 border-white/30 shadow-lg shadow-orange-500/30 z-10">
        {index + 1}
      </div>
    </div>
  );
};

export default TicketVisual;
