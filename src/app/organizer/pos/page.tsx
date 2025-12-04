'use client';

import React, { useEffect, useState } from 'react';
import OrganizerLayout from '../../../components/Layout/OrganizerLayout';
import Button from '../../../components/UI/Button';
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
import Input from '../../../components/UI/Input';

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
          color: ['bg-blue-100 border-blue-300', 'bg-yellow-100 border-yellow-300', 'bg-pink-100 border-pink-300', 'bg-slate-100 border-slate-300'][idx % 4],
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
              <h1>${data.eventTitle || 'Événement'}</h1>
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
                <p class="label">Quantité</p>
                <p class="value">${line.qty}</p>
              </div>
              <div>
                <p class="label">ID Complet</p>
                <p class="value mono">${line.bookingId || ''}</p>
              </div>
              <div>
                <p class="label">Client</p>
                <p class="value">${data.customer?.name || 'Invité'}</p>
                <p class="small">${data.customer?.phone || ''}</p>
              </div>
            </div>
            <div class="qr">
              <img src="${qrUrl}" alt="QR Code" />
              <p class="small">Scanner pour le check-in</p>
            </div>
          </div>
          <div class="bottom">
            <p class="small">Présentez ce QR code à l’entrée. Le check-in met à jour la présence en temps réel.</p>
          </div>
        </div>`;
      })
      .join('<div class="separator"></div>');

    return `
    <html>
      <head>
        <meta charSet="utf-8" />
        <style>
          body { font-family: 'Inter', Arial, sans-serif; padding: 16px; background:#f3f4f6; }
          .ticket { border:3px solid #000; border-radius:18px; padding:18px; background:#fff; max-width:440px; margin:0 auto; box-shadow:6px 6px 0 #000; }
          .top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
          h1 { font-size:22px; margin:2px 0 4px 0; line-height:1.15; }
          .code { font-weight:900; border:2px dashed #000; padding:8px 12px; border-radius:12px; font-size:12px; background:#ffe68a; }
          .eyebrow { font-size:11px; font-weight:900; margin:0; text-transform:uppercase; color:#555; letter-spacing:0.04em; }
          .small { font-size:12px; color:#555; margin:2px 0 0 0; }
          .middle { display:flex; gap:14px; align-items:center; }
          .info { flex:1; border:2px dashed #000; border-radius:14px; padding:12px; display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; background:#fafafa; }
          .label { font-size:10px; text-transform:uppercase; color:#666; margin:0; letter-spacing:0.02em; }
          .value { font-size:14px; font-weight:800; margin:0; }
          .value.mono { font-family: 'Courier New', monospace; font-size:12px; }
          .qr { width:170px; text-align:center; }
          .qr img { width:170px; height:170px; border:2px solid #000; border-radius:14px; }
          .bottom { margin-top:10px; padding-top:8px; border-top:1px solid #ddd; }
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
      setEmailStatus('Tickets envoyés par email (fichiers joints).');
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
              <h1 className="text-3xl font-black text-slate-900 font-display uppercase">Guichet / POS</h1>
              <p className="text-slate-500 font-bold text-sm">Encaisse tes ventes sur place.</p>
            </div>
            <Button
              variant="white"
              icon={<RefreshCw size={16} />}
              onClick={() => (selectedEvent ? loadTickets(selectedEvent) : loadEvents())}
              isLoading={loadingEvents || loadingTickets}
            >
              Rafraichir
            </Button>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase text-slate-600">Evenement</label>
              <select
                className="border-2 border-black rounded-xl px-3 py-2 font-bold bg-white shadow-sm min-w-[240px]"
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
            {error && <p className="text-sm font-bold text-red-600">{error}</p>}
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
            {tickets.length === 0 && !loadingTickets && (
              <div className="col-span-2 xl:col-span-3 text-sm font-bold text-slate-500">Aucun ticket pour cet evenement.</div>
            )}
            {loadingTickets && (
              <div className="col-span-2 xl:col-span-3 text-sm font-bold text-slate-500">Chargement des tickets...</div>
            )}
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => addToCart(ticket)}
                className={`relative p-6 rounded-2xl border-4 shadow-sm hover:shadow-pop-sm hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex flex-col items-center justify-center text-center ${ticket.color || 'bg-slate-100 border-slate-300'} border-black disabled:opacity-50`}
                disabled={!!ticket.available && ticket.available <= 0}
              >
                <span className="font-black text-lg uppercase mb-1">{ticket.name}</span>
                <span className="text-xl font-bold">{formatPrice(ticket.price)}</span>
                <span className="text-[10px] font-black text-slate-600 mt-2">Stock: {ticket.available ?? '—'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[420px] bg-white border-4 border-black rounded-3xl shadow-pop-lg flex flex-col overflow-hidden">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center sticky top-0 z-10">
            <span className="font-black uppercase flex items-center">
              <ShoppingCart className="mr-2" size={20} /> Panier
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-white text-black px-2 py-0.5 rounded text-xs font-bold">{cart.length} articles</span>
              <button
                onClick={resetCart}
                className="text-[10px] font-black uppercase bg-white/10 px-2 py-1 rounded border border-white/40 hover:bg-white/20"
              >
                Vider
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                <ShoppingCart size={48} className="mb-2" />
                <p className="font-bold text-sm">Panier vide</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border-2 border-slate-200">
                  <div>
                    <p className="font-black text-slate-900 text-sm">{item.name}</p>
                    <p className="text-xs font-bold text-slate-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded bg-white border border-black flex items-center justify-center hover:bg-red-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded bg-white border border-black flex items-center justify-center hover:bg-green-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 pb-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 gap-3">
              <Input
                label="Client"
                placeholder="Nom du client"
                icon={<UserIcon size={16} />}
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Telephone"
                  placeholder="+225 07 00 00 00"
                  icon={<Phone size={16} />}
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: normalizePhone(e.target.value) })}
                />
                <Input
                  label="Email (optionnel)"
                  placeholder="client@mail.com"
                  icon={<Mail size={16} />}
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-between items-end flex-wrap gap-3">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase">Total a payer</p>
                <p className="text-3xl font-black text-slate-900 font-display">{formatPrice(total)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`px-3 py-2 rounded-xl border-2 border-black text-xs font-black uppercase flex items-center gap-2 ${
                    paymentMethod === 'cash' ? 'bg-green-200' : 'bg-white'
                  }`}
                >
                  <Banknote size={14} /> Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`px-3 py-2 rounded-xl border-2 border-black text-xs font-black uppercase flex items-center gap-2 ${
                    paymentMethod === 'card' ? 'bg-blue-200' : 'bg-white'
                  }`}
                >
                  <CreditCard size={14} /> Mobile/CB
                </button>
              </div>
            </div>

            {receipt && (
              <div className="bg-green-50 border-2 border-green-500 rounded-xl p-3 text-sm font-bold text-green-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle size={18} /> Vente validee
                  </span>
                  <span className="text-[10px] text-green-800 uppercase">
                    #{receipt.items?.[0]?.bookingId?.slice(0, 6)}
                  </span>
                </div>
                <ul className="space-y-1 text-green-800">
                  {receipt.items?.map((line: any) => (
                    <li key={line.bookingId} className="flex justify-between">
                      <span>
                        {line.qty} x {line.tierName}
                      </span>
                      <span>{formatPrice(line.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between border-t border-green-200 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(receipt.totalAmount || total)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-green-800/80">
                  <span>Paiement: {paymentMethod === 'cash' ? 'Cash' : 'Mobile/CB'}</span>
                  <span>
                    {new Date(receipt.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    onClick={downloadTicket}
                    className="text-[11px] bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 border border-green-700 hover:bg-green-700"
                  >
                    <Printer size={12} /> Telecharger / Imprimer
                  </button>
                  <button
                    onClick={sendTicketsByEmail}
                    disabled={sendingEmail}
                    className="text-[11px] bg-white text-green-700 px-3 py-1 rounded-lg flex items-center gap-1 border border-green-600 hover:bg-green-50 disabled:opacity-60"
                  >
                    Envoyer par mail
                  </button>
                </div>
                {emailStatus && <p className="text-[11px] text-green-900">{emailStatus}</p>}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-400 text-red-700 rounded-xl p-3 text-sm font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCheckout}
                disabled={total === 0 || submitting}
                className="bg-green-500 text-white border-2 border-black rounded-xl py-3 font-black flex flex-col items-center justify-center shadow-sm hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50"
              >
                <Banknote size={20} className="mb-1" />
                Encaisser
              </button>
              <button
                onClick={handleCheckout}
                disabled={total === 0 || submitting}
                className="bg-blue-500 text-white border-2 border-black rounded-xl py-3 font-black flex flex-col items-center justify-center shadow-sm hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-50"
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
