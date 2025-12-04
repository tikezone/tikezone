import { notFound } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function loadEvent(id: string) {
  const res = await fetch(`${API_BASE}/api/events/${id}`, { cache: 'no-store' });
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
        <div className="rounded-3xl overflow-hidden border-4 border-black shadow-pop">
          <div
            className="h-64 md:h-96 bg-cover bg-center"
            style={{ backgroundImage: `url(${event.imageUrl})` }}
          />
          <div className="bg-white p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-black uppercase text-slate-500">
              <span className="px-3 py-1 bg-slate-100 border-2 border-black rounded-full">{event.category}</span>
              <span className="px-3 py-1 bg-yellow-200 border-2 border-black rounded-full">
                {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="px-3 py-1 bg-slate-900 text-white border-2 border-black rounded-full">{event.location}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 font-display leading-tight">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-slate-700 font-bold leading-relaxed">{event.description}</p>
            )}

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
              <div className="bg-slate-100 border-2 border-black rounded-2xl p-4">
                <p className="text-[11px] uppercase font-black text-slate-500 mb-1">Lieu</p>
                <p className="font-black text-slate-900">{event.location}</p>
              </div>
              <div className="bg-slate-100 border-2 border-black rounded-2xl p-4">
                <p className="text-[11px] uppercase font-black text-slate-500 mb-1">Date</p>
                <p className="font-black text-slate-900">
                  {date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-slate-100 border-2 border-black rounded-2xl p-4">
                <p className="text-[11px] uppercase font-black text-slate-500 mb-1">Organisateur</p>
                <p className="font-black text-slate-900 truncate">{event.organizer}</p>
              </div>
            </div>
          </div>
        </div>

        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-black uppercase">Billets</h2>
            <div className="grid gap-3">
              {event.ticketTypes.map((t: any) => (
                <div key={t.id} className="bg-white border-2 border-black rounded-2xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-lg font-black">{t.name}</p>
                    <p className="text-sm font-bold text-slate-500">
                      {t.description || 'Aucune description.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">
                      {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(t.price)} F CFA
                    </p>
                    <p className="text-xs font-bold text-slate-500">Stock: {t.available ?? t.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
