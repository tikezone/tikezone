import React, { useEffect, useState } from 'react';
import { QrCode, MapPin, Calendar, X } from 'lucide-react';

type PreviewEvent = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  date: string;
  location: string;
  ticketTypes?: { id: string; name: string; price: number; available?: number; quantity?: number }[];
};

interface Props {
  eventId: string;
  onClose: () => void;
}

const EventPreviewModal: React.FC<Props> = ({ eventId, onClose }) => {
  const [event, setEvent] = useState<PreviewEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/events/${eventId}`, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Evenement introuvable');
        setEvent(data);
      } catch (err: any) {
        setError(err?.message || 'Chargement impossible');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  const dateLabel = event?.date ? new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border-4 border-black shadow-pop-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b-2 border-black flex justify-between items-center">
          <h3 className="text-xl font-black uppercase">Apercu evenement</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 border-2 border-black">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-slate-500 font-bold">Chargement...</div>
          ) : error || !event ? (
            <div className="p-8 text-center text-red-600 font-bold">{error || 'Evenement introuvable'}</div>
          ) : (
            <div className="space-y-4">
              <div className="h-48 bg-slate-200 relative">
                {event.imageUrl && (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="px-6 pb-6 space-y-3">
                <h1 className="text-2xl font-black text-slate-900 font-display">{event.title}</h1>
                <div className="flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border-2 border-black rounded-full">
                    <Calendar size={14} /> {dateLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border-2 border-black rounded-full">
                    <MapPin size={14} /> {event.location}
                  </span>
                </div>
                {event.description && (
                  <p className="text-sm font-bold text-slate-700 leading-relaxed">{event.description}</p>
                )}

                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-sm font-black uppercase text-slate-500 mb-2">Billets</h4>
                    <div className="grid gap-2">
                      {event.ticketTypes.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between bg-slate-50 border-2 border-black rounded-xl px-3 py-2 text-sm font-bold"
                        >
                          <div>
                            <p className="text-slate-900 font-black">{t.name}</p>
                            <p className="text-slate-500 text-xs">
                              Stock {t.available ?? t.quantity ?? 0}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-slate-800">
                            <span>{new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(t.price)} F</span>
                            <QrCode size={18} className="text-slate-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPreviewModal;
