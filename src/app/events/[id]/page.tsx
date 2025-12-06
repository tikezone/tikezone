import { notFound } from 'next/navigation';

async function loadEvent(id: string) {
  // Always use localhost for server-side fetches
  const baseUrl = 'http://localhost:5000';
  
  const res = await fetch(`${baseUrl}/api/events/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Erreur chargement evenement');
  return res.json();
}

export default async function PublicEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await loadEvent(id).catch(() => null);
  if (!event) return notFound();

  const date = new Date(event.date);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black"></div>
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <div className="rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-2xl">
          <div
            className="h-64 md:h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          </div>
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase">
              <span className="px-3 py-1 bg-white/10 border border-white/20 text-gray-300 rounded-full">{event.category}</span>
              <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full">
                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="px-3 py-1 bg-white/10 border border-white/20 text-white rounded-full">{event.location}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white font-display leading-tight">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-gray-300 font-bold leading-relaxed">{event.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] uppercase font-black text-gray-500 mb-1">Lieu</p>
                <p className="font-black text-white">{event.location}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] uppercase font-black text-gray-500 mb-1">Date</p>
                <p className="font-black text-white">
                  {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] uppercase font-black text-gray-500 mb-1">Heure</p>
                <p className="font-black text-white">
                  {event.time || date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-[11px] uppercase font-black text-gray-500 mb-1">Organisateur</p>
                <p className="font-black text-white truncate">{event.organizerName || 'TIKEZONE'}</p>
              </div>
            </div>
          </div>
        </div>

        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase text-white">Billets</h2>
            <div className="grid gap-3">
              {event.ticketTypes.map((t: any) => {
                const hasPromo = t.promoType && t.promoValue !== undefined && t.promoValue !== null;
                const promoPrice = hasPromo 
                  ? (t.promoType === 'percent' 
                      ? Math.round(t.price * (1 - (t.promoValue || 0) / 100))
                      : Math.max(0, t.price - (t.promoValue || 0)))
                  : t.price;
                const isFree = t.price === 0 || promoPrice === 0;
                const availableTickets = t.available ?? t.quantity;
                const isSoldOut = typeof availableTickets === 'number' && availableTickets === 0;
                const isAlmostSoldOut = typeof availableTickets === 'number' && availableTickets > 0 && availableTickets < 100;
                
                return (
                  <div key={t.id} className={`bg-white/10 backdrop-blur-2xl border rounded-2xl p-4 flex items-center justify-between relative overflow-hidden ${isSoldOut ? 'border-red-500/50 opacity-60' : 'border-white/20'}`}>
                    {hasPromo && !isSoldOut && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                        PROMO {t.promoType === 'percent' ? `-${t.promoValue}%` : `-${t.promoValue} F`}
                      </div>
                    )}
                    {isSoldOut && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase animate-pulse">
                        ÉPUISÉ
                      </div>
                    )}
                    {isAlmostSoldOut && !isSoldOut && (
                      <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-br-xl uppercase animate-pulse">
                        PRESQUE ÉPUISÉ
                      </div>
                    )}
                    <div className={isAlmostSoldOut && !isSoldOut ? 'pt-4' : ''}>
                      <p className="text-lg font-black text-white">{t.name}</p>
                      <p className="text-sm font-bold text-gray-400">
                        {t.description || 'Aucune description.'}
                      </p>
                    </div>
                    <div className="text-right">
                      {hasPromo && t.price > 0 ? (
                        <>
                          <p className="text-sm font-bold text-gray-500 line-through">
                            {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(t.price)} F CFA
                          </p>
                          <p className={`text-xl font-black ${isFree ? 'text-green-400' : 'text-orange-400'}`}>
                            {isFree ? 'GRATUIT' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(promoPrice)} F CFA`}
                          </p>
                        </>
                      ) : (
                        <p className={`text-xl font-black ${isFree ? 'text-green-400' : 'text-orange-400'}`}>
                          {isFree ? 'GRATUIT' : `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(t.price)} F CFA`}
                        </p>
                      )}
                      <p className={`text-xs font-bold ${isSoldOut ? 'text-red-400' : isAlmostSoldOut ? 'text-orange-400' : 'text-gray-500'}`}>
                        {isSoldOut ? 'Rupture de stock' : `${availableTickets} restants`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
