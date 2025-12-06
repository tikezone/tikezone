'use client';

import React, { useEffect, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import {
  ShoppingCart,
  CreditCard,
  Banknote,
  Printer,
  CheckCircle,
  Plus,
  Minus,
  User as UserIcon,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';

type EventOption = { id: string; title: string };
type TicketOption = { id: string; name: string; price: number; available?: number; color?: string };
type CartLine = { id: string; name: string; price: number; qty: number; color?: string };

export default function PosPage() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [tickets, setTickets] = useState<TicketOption[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const phonePrefix = '+225 ';
  const [customer, setCustomer] = useState({ name: '', phone: phonePrefix, email: '' });
  const [receipt, setReceipt] = useState<any | null>(null);

  const addToCart = (ticket: TicketOption) => {
    if (ticket.available !== undefined && ticket.available <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === ticket.id);
      const nextQty = (existing?.qty || 0) + 1;
      const stock = tickets.find((t) => t.id === ticket.id)?.available;
      if (stock !== undefined && nextQty > stock) {
        setError('Stock maximum atteint pour ce ticket');
        return prev;
      }
      setError(null);
      return existing
        ? prev.map((item) => (item.id === ticket.id ? { ...item, qty: nextQty } : item))
        : [...prev, { ...ticket, qty: 1 }];
    });
    setReceipt(null);
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    setError(null);
    try {
      const res = await fetch('/api/organizer/events', { cache: 'no-store', credentials: 'include' });
      if (!res.ok) throw new Error('Impossible de charger les evenements');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err?.message || 'Erreur chargement evenements');
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadTickets = async (eventId: string) => {
    if (!eventId) return;
    setLoadingTickets(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizer/events/${eventId}/tickets`, { cache: 'no-store', credentials: 'include' });
      if (!res.ok) throw new Error('Impossible de charger les tickets');
      const data = await res.json();
      setTickets(
        (data.tickets || []).map((t: any, idx: number) => ({
          id: t.id,
          name: t.name,
          price: t.price,
          available: t.available ?? t.quantity,
          color: ['bg-blue-500/30 border-blue-500/30', 'bg-yellow-500/30 border-yellow-500/30', 'bg-pink-500/30 border-pink-500/30', 'bg-gray-500/30 border-gray-500/30'][idx % 4],
        }))
      );
    } catch (err: any) {
      setError(err?.message || 'Erreur chargement tickets');
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const normalizePhone = (val: string) => {
    if (!val) return phonePrefix;
    const clean = val.replace(/^\+?225\s*/, '').trim();
    return `${phonePrefix}${clean}`;
  };

  useEffect(() => {
    if (selectedEvent) {
      loadTickets(selectedEvent);
      setCart([]);
      setReceipt(null);
    }
  }, [selectedEvent]);

  const updateQty = (id: string, delta: number) => {
    const stock = tickets.find((t) => t.id === id)?.available;
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = Math.max(0, item.qty + delta);
            if (stock !== undefined && nextQty > stock) return item;
            return { ...item, qty: nextQty };
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const formatPrice = (p: number) => `${new Intl.NumberFormat('fr-FR').format(p)} F`;

  const handleCheckout = async () => {
    if (!selectedEvent) {
      setError('Choisis un evenement avant de vendre');
      return;
    }
    if (cart.length === 0) {
      setError('Ajoute au moins un ticket');
      return;
    }
    setSubmitting(true);
    setError(null);
    setReceipt(null);
    try {
      const normalizedPhone = normalizePhone(customer.phone);
      const res = await fetch(`/api/organizer/events/${selectedEvent}/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: cart.map((c) => ({ ticketId: c.id, qty: c.qty })),
          customer: { ...customer, phone: normalizedPhone },
          paymentMethod,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Vente impossible');
      setReceipt({ ...data, createdAt: new Date().toISOString() });
      setCart([]);
      setCustomer({ name: '', phone: phonePrefix, email: '' });
      await loadTickets(selectedEvent);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors du paiement');
    } finally {
      setSubmitting(false);
    }
  };

  const buildTicketHtml = (data: any) => {
    const items = data?.items || [];
    const tickets = items
      .map((line: any) => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(line.bookingId || '')}`;
        return `
        <div class="ticket">
          <div class="top">
            <div>
              <p class="eyebrow">Ticket officiel</p>
              <h1>${data.eventTitle || 'Evenement'}</h1>
              <p class="small">Paiement : ${data.paymentMethod === 'card' ? 'Mobile/CB' : 'Cash'} · Total ${formatPrice(line.lineTotal || 0)}</p>
            </div>
            <div class="code">#${(line.bookingId || '').slice(0, 8)}</div>
          </div>
          <div class="middle">
            <div class="info">
              <div>
                <p class="label">Type</p>
                <p class="value">${line.tierName || 'Ticket'}</p>
              </div>
              <div>
                <p class="label">Quantite</p>
                <p class="value">${line.qty}</p>
              </div>
              <div>
                <p class="label">ID Complet</p>
                <p class="value mono">${line.bookingId || ''}</p>
              </div>
              <div>
                <p class="label">Client</p>
                <p class="value">${data.customer?.name || 'Invite'}</p>
                <p class="small">${data.customer?.phone || ''}</p>
              </div>
            </div>
            <div class="qr">
              <img src="${qrUrl}" alt="QR Code" />
              <p class="small">Scanner pour le check-in</p>
            </div>
          </div>
          <div class="bottom">
            <p class="small">Presentez ce QR code a l'entree. Le check-in met a jour la presence en temps reel.</p>
          </div>
        </div>`;
      })
      .join('<div class="separator"></div>');

    return `
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>
          body { font-family: 'Inter', Arial, sans-serif; padding: 16px; background:#1a1a1a; }
          .ticket { border:2px solid #333; border-radius:18px; padding:18px; background:#222; max-width:440px; margin:0 auto; color:#fff; }
          .top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
          h1 { font-size:22px; margin:2px 0 4px 0; line-height:1.15; color:#fff; }
          .code { font-weight:900; border:2px dashed #f97316; padding:8px 12px; border-radius:12px; font-size:12px; background:#f97316; color:#000; }
          .eyebrow { font-size:11px; font-weight:900; margin:0; text-transform:uppercase; color:#888; letter-spacing:0.04em; }
          .small { font-size:12px; color:#888; margin:2px 0 0 0; }
          .middle { display:flex; gap:14px; align-items:center; }
          .info { flex:1; border:2px dashed #333; border-radius:14px; padding:12px; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; background:#1a1a1a; }
          .label { font-size:10px; text-transform:uppercase; color:#666; margin:0; letter-spacing:0.02em; }
          .value { font-size:14px; font-weight:800; margin:0; color:#fff; }
          .value.mono { font-family: 'Courier New', monospace; font-size:12px; }
          .qr { width:170px; text-align:center; }
          .qr img { width:170px; height:170px; border:2px solid #333; border-radius:14px; }
          .bottom { margin-top:10px; padding-top:8px; border-top:1px solid #333; }
          .separator { height:24px; }
        </style>
      </head>
      <body>
        ${tickets}
      </body>
    </html>`;
  };

  const downloadTicket = () => {
    if (!receipt) return;
    const items = receipt.items || [];
    items.forEach((line: any) => {
      const ticketData = { ...receipt, items: [line] };
      const html = buildTicketHtml(ticketData);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) return;
      win.onload = () => {
        win.focus();
        win.print();
      };
    });
  };

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const sendTicketsByEmail = async () => {
    if (!receipt) return;
    const targetEmail = receipt.customer?.email || customer.email;
    if (!targetEmail) {
      setEmailStatus('Ajoute un email pour envoyer le ticket.');
      return;
    }
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const bookingIds = (receipt.items || []).map((l: any) => l.bookingId).filter(Boolean);
      const res = await fetch('/api/organizer/bookings/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bookingIds, email: targetEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Envoi impossible');
      setEmailStatus('Tickets envoyes par email (fichiers joints).');
    } catch (e: any) {
      setEmailStatus(e?.message || 'Erreur envoi email');
    } finally {
      setSendingEmail(false);
    }
  };

  const resetCart = () => {
    setCart([]);
    setReceipt(null);
  };

  return (
    <OrganizerLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-white font-display uppercase">Guichet / POS</h1>
              <p className="text-gray-400 font-bold text-sm">Encaisse tes ventes sur place.</p>
            </div>
            <button
              onClick={() => (selectedEvent ? loadTickets(selectedEvent) : loadEvents())}
              disabled={loadingEvents || loadingTickets}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={loadingEvents || loadingTickets ? 'animate-spin' : ''} />
              Rafraichir
            </button>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-gray-400">Evenement</label>
              <select
                className="border border-white/20 bg-white/5 rounded-xl px-3 py-2 font-bold text-white min-w-[240px] focus:border-orange-500/50 outline-none"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                disabled={loadingEvents}
              >
                <option value="">{loadingEvents ? 'Chargement...' : 'Choisir un evenement'}</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm font-bold text-red-400">{error}</p>}
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr flex-1 overflow-y-auto">
            {tickets.length === 0 && !loadingTickets && (
              <div className="col-span-2 xl:col-span-3 text-sm font-bold text-gray-500">Aucun ticket pour cet evenement.</div>
            )}
            {loadingTickets && (
              <div className="col-span-2 xl:col-span-3 text-sm font-bold text-gray-500">Chargement des tickets...</div>
            )}
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => addToCart(ticket)}
                className={`relative p-6 rounded-2xl border backdrop-blur-xl hover:-translate-y-1 active:translate-y-0 transition-all flex flex-col items-center justify-center text-center ${ticket.color || 'bg-white/10 border-white/20'} disabled:opacity-50`}
                disabled={!!ticket.available && ticket.available <= 0}
              >
                <span className="font-black text-lg uppercase mb-1 text-white">{ticket.name}</span>
                <span className="text-xl font-bold text-white">{formatPrice(ticket.price)}</span>
                <span className="text-[10px] font-black text-gray-400 mt-2">Stock: {ticket.available ?? '—'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[420px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white flex justify-between items-center sticky top-0 z-10">
            <span className="font-black uppercase flex items-center">
              <ShoppingCart className="mr-2" size={20} /> Panier
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-white text-black px-2 py-0.5 rounded text-xs font-bold">{cart.length} articles</span>
              <button
                onClick={resetCart}
                className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded border border-white/40 hover:bg-white/30"
              >
                Vider
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                <ShoppingCart size={48} className="mb-2" />
                <p className="font-bold text-sm">Panier vide</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                  <div>
                    <p className="font-black text-white text-sm">{item.name}</p>
                    <p className="text-xs font-bold text-gray-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center hover:bg-red-500/30 text-white"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-black text-sm w-4 text-center text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded bg-white/10 border border-white/20 flex items-center justify-center hover:bg-green-500/30 text-white"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-gray-400">Client</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder-gray-500 focus:border-orange-500/50 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Telephone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      placeholder="+225 07 00 00 00"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: normalizePhone(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder-gray-500 focus:border-orange-500/50 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400">Email (optionnel)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      placeholder="client@mail.com"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-bold placeholder-gray-500 focus:border-orange-500/50 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end flex-wrap gap-3">
              <div>
                <p className="text-xs font-black text-gray-500 uppercase">Total a payer</p>
                <p className="text-3xl font-black text-white font-display">{formatPrice(total)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`px-3 py-2 rounded-xl border text-xs font-black uppercase flex items-center gap-2 ${
                    paymentMethod === 'cash' ? 'bg-green-500/30 border-green-500/30 text-green-400' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <Banknote size={14} /> Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`px-3 py-2 rounded-xl border text-xs font-black uppercase flex items-center gap-2 ${
                    paymentMethod === 'card' ? 'bg-blue-500/30 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  <CreditCard size={14} /> Mobile/CB
                </button>
              </div>
            </div>

            {receipt && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 text-sm font-bold text-green-400 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle size={18} /> Vente validee
                  </span>
                  <span className="text-[10px] text-green-300 uppercase">
                    #{receipt.items?.[0]?.bookingId?.slice(0, 6)}
                  </span>
                </div>
                <ul className="space-y-1 text-green-300">
                  {receipt.items?.map((line: any) => (
                    <li key={line.bookingId} className="flex justify-between">
                      <span>
                        {line.qty} x {line.tierName}
                      </span>
                      <span>{formatPrice(line.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between border-t border-green-500/30 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(receipt.totalAmount || total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-green-300/80">
                  <span>Paiement: {paymentMethod === 'cash' ? 'Cash' : 'Mobile/CB'}</span>
                  <span>
                    {new Date(receipt.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={downloadTicket}
                    className="text-[11px] bg-green-500 text-white px-3 py-1 rounded-lg flex items-center gap-1 border border-green-400 hover:bg-green-600"
                  >
                    <Printer size={12} /> Telecharger / Imprimer
                  </button>
                  <button
                    onClick={sendTicketsByEmail}
                    disabled={sendingEmail}
                    className="text-[11px] bg-white/10 text-green-400 px-3 py-1 rounded-lg flex items-center gap-1 border border-green-500/30 hover:bg-white/20 disabled:opacity-60"
                  >
                    Envoyer par mail
                  </button>
                </div>
                {emailStatus && <p className="text-[11px] text-green-300">{emailStatus}</p>}
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCheckout}
                disabled={total === 0 || submitting}
                className="bg-green-500/30 text-green-400 border border-green-500/30 rounded-xl py-3 font-black flex flex-col items-center justify-center hover:bg-green-500/50 transition-all disabled:opacity-50"
              >
                <Banknote size={20} className="mb-1" />
                Encaisser
              </button>
              <button
                onClick={handleCheckout}
                disabled={total === 0 || submitting}
                className="bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-xl py-3 font-black flex flex-col items-center justify-center hover:bg-blue-500/50 transition-all disabled:opacity-50"
              >
                <CreditCard size={20} className="mb-1" />
                Payer {paymentMethod === 'card' ? 'Mobile/CB' : 'Cash'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
