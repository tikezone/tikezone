
import React from 'react';
import { Calendar, Clock, MapPin, Share2, Trash2, Download, QrCode, Send } from 'lucide-react';
import Button from '../UI/Button';

interface TicketCardProps {
  booking: any;
  onDelete: (booking: any) => void;
  onShare: (booking: any) => void;
  onTransfer?: (booking: any) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ booking, onDelete, onShare, onTransfer }) => {
  const eventDate = new Date(booking.eventDate);
  
  return (
    <div className="bg-white rounded-3xl border-2 border-black shadow-pop overflow-hidden relative group flex flex-col sm:flex-row h-auto sm:h-64 transition-transform hover:-translate-y-1 duration-300">
      
      {/* Left: Image (Visible on Desktop) */}
      <div className="hidden sm:block w-48 relative border-r-2 border-black border-dashed h-full">
        <img 
            src={booking.eventImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"} 
            alt={booking.eventTitle} 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-lg border-2 border-black text-[10px] font-black uppercase shadow-sm">
            Confirmé
        </div>
      </div>

      {/* Middle: Event Info */}
      <div className="p-6 flex-1 flex flex-col justify-between relative">
            {/* Perforation visual dots for mobile top */}
            <div className="absolute left-0 right-0 top-0 h-[2px] border-b-2 border-black border-dashed sm:hidden"></div>

            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display leading-tight uppercase line-clamp-2 pr-8">
                        {booking.eventTitle}
                    </h3>
                    {/* Mobile Options */}
                    <div className="sm:hidden">
                        <button onClick={() => onDelete(booking)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-1 text-sm font-bold text-slate-600 mb-4">
                    <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-black" strokeWidth={2.5} />
                        {eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="flex items-center">
                        <Clock size={14} className="mr-2 text-black" strokeWidth={2.5} />
                        {eventDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center">
                        <MapPin size={14} className="mr-2 text-black" strokeWidth={2.5} />
                        <span className="truncate max-w-[200px]">{booking.eventLocation}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-end justify-between">
                <div className="bg-slate-50 p-2 px-3 rounded-xl border-2 border-slate-200 group-hover:border-black transition-colors">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-0.5 tracking-wider">Ticket</p>
                    <p className="text-xs font-bold text-slate-900 whitespace-pre-line line-clamp-1">{booking.summary}</p>
                </div>

                {/* Actions Desktop */}
                <div className="hidden sm:flex gap-2">
                    {onTransfer && (
                        <button 
                            onClick={() => onTransfer(booking)}
                            className="flex items-center px-3 py-2 rounded-lg border-2 border-transparent bg-slate-100 hover:border-black hover:bg-white transition-all text-slate-600 hover:text-black text-xs font-black uppercase"
                            title="Transférer à un ami"
                        >
                            <Send size={14} className="mr-2" strokeWidth={2.5} /> Transférer
                        </button>
                    )}
                    <button 
                        onClick={() => onShare(booking)}
                        className="p-2 rounded-lg border-2 border-transparent hover:border-black hover:bg-slate-100 transition-all text-slate-500 hover:text-black"
                        title="Partager"
                    >
                        <Share2 size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                        onClick={() => onDelete(booking)}
                        className="p-2 rounded-lg border-2 border-transparent hover:border-black hover:bg-red-50 transition-all text-slate-500 hover:text-red-500"
                        title="Supprimer"
                    >
                        <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
            
            {/* Mobile Download Button */}
            <div className="flex gap-2 mt-4 sm:hidden">
                 {onTransfer && (
                    <Button onClick={() => onTransfer(booking)} variant="white" className="flex-1 py-2 text-xs" icon={<Send size={14} />}>
                        Transférer
                    </Button>
                 )}
                 <Button onClick={() => onShare(booking)} variant="primary" className="flex-1 py-2 text-xs" icon={<Share2 size={14} />}>
                    Partager
                 </Button>
            </div>
      </div>

      {/* Right: QR Code */}
      <div className="bg-yellow-300 p-6 sm:w-48 flex flex-col items-center justify-center border-t-2 sm:border-t-0 sm:border-l-2 border-black border-dashed relative shrink-0 overflow-hidden">
            {/* Perforation visual notches */}
            <div className="absolute left-[-8px] top-[-8px] w-4 h-4 bg-slate-50 rounded-full border-2 border-black hidden sm:block"></div>
            <div className="absolute left-[-8px] bottom-[-8px] w-4 h-4 bg-slate-50 rounded-full border-2 border-black hidden sm:block"></div>

            <div className="relative bg-white p-2 rounded-xl border-2 border-black shadow-sm mb-3 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <QrCode size={80} className="text-black" />
                {/* Scanning Laser Effect */}
                <div className="absolute left-0 right-0 h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-scan opacity-0 group-hover:opacity-100 pointer-events-none"></div>
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center mb-2">Scanner</span>
            
            <div className="hidden sm:flex flex-col gap-2 w-full mt-auto">
                <Button variant="white" fullWidth className="py-1.5 text-[10px] h-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" icon={<Download size={14} />}>
                    Ticket
                </Button>
            </div>
      </div>
    </div>
  );
};

export default TicketCard;
