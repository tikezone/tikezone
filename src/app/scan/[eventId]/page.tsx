'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '../../../lib/safe-navigation';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { ArrowLeft, CheckCircle, AlertTriangle, RefreshCcw, Loader2, QrCode, Camera } from 'lucide-react';
import Button from '../../../components/UI/Button';

type EventView = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl?: string;
  totalBookings: number;
  checkedIn: number;
};

type ScanResult =
  | { status: 'success'; booking: any }
  | { status: 'already'; booking: any }
  | { status: 'error'; message: string };

export default function ScannerPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const eventId = typeof params?.eventId === 'string' ? params.eventId : '';

  const SCAN_COOLDOWN_MS = 1200;
  const RESTART_DELAY_MS = 600;

  const [event, setEvent] = useState<EventView | null>(null);
  const [stats, setStats] = useState<{ total: number; scanned: number }>({ total: 0, scanned: 0 });
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<any>(null);
  const lastCodeRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const loadEvent = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/scan/events/${eventId}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push('/scan/login');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Evenement introuvable');
      setEvent(data.event);
      setStats({ total: data.event.totalBookings || 0, scanned: data.event.checkedIn || 0 });
    } catch (err) {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    const cleaned = code.trim();
    if (!cleaned) return;
    await handleCheckWithValue(cleaned);
  };

  const handleCheckWithValue = async (value: string) => {
    if (!value) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch('/api/scan/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push('/scan/login');
        return;
      }
      if (!res.ok) {
        setResult({ status: 'error', message: data.error || 'Billet invalide' });
        return;
      }
      if (data.stats) {
        setStats({ total: data.stats.total || 0, scanned: data.stats.scanned || 0 });
      }
      setResult({
        status: data.status === 'already' ? 'already' : 'success',
        booking: data.booking,
      });
      setCode('');
    } catch (err) {
      setResult({ status: 'error', message: 'Check-in impossible' });
    } finally {
      setChecking(false);
      // relance rapide de la camera apres traitement
      if (!cameraError) {
        setTimeout(() => {
          startScanner();
        }, RESTART_DELAY_MS);
      }
    }
  };

  const handleCheckFromScan = async (scannedCode: string) => {
    setCode(scannedCode);
    await handleCheckWithValue(scannedCode);
  };

  const stopScanner = async () => {
    setScanning(false);
    try {
      await controlsRef.current?.stop();
    } catch {
      // ignore
    }
    controlsRef.current = null;
  };

  const startScanner = async () => {
    if (controlsRef.current) return; // deja actif
    setCameraError(null);
    setScanning(true);
    if (!videoRef.current) return;
    try {
      const reader = new BrowserMultiFormatReader();
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (res, err) => {
          if (res) {
            const text = res.getText();
            const now = Date.now();
            if (lastCodeRef.current === text && now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) {
              return;
            }
            lastCodeRef.current = text;
            lastScanTimeRef.current = now;
            stopScanner();
            handleCheckFromScan(text);
          } else if (err && (err as any).name && (err as any).name !== 'NotFoundException') {
            setCameraError('Flux camera indisponible');
          }
        }
      );
      controlsRef.current = controls;
    } catch (err) {
      setCameraError('Impossible d acceder a la camera');
      setScanning(false);
    }
  };

  const resetResult = () => setResult(null);

  useEffect(() => {
    loadEvent();
    const interval = setInterval(() => {
      fetch('/api/scan/ping', { method: 'POST' }).catch(() => {});
    }, 45000);
    return () => clearInterval(interval);
  }, [eventId]);

  useEffect(() => {
    if (loading || !event) return;
    const t = setTimeout(() => {
      startScanner();
    }, 200);
    return () => {
      clearTimeout(t);
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, loading]);

  const eventDate = useMemo(() => {
    if (!event?.date) return '';
    return new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [event?.date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-white animate-spin" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4 text-center">
        <AlertTriangle size={48} className="text-yellow-500 mb-4" />
        <h2 className="text-2xl font-black uppercase mb-2">Evenement introuvable</h2>
        <button onClick={() => router.push('/scan/dashboard')} className="mt-4 px-6 py-2 bg-white text-black font-bold rounded-lg">
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={() => router.back()} className="text-white p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
          <ArrowLeft size={24} />
        </button>
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex flex-col items-center max-w-[60%]">
          <p className="text-white text-xs font-black uppercase tracking-widest text-center truncate w-full">{event.title}</p>
          <p className="text-brand-400 text-center text-xs font-bold">
            {stats.scanned} / {stats.total} entrees
          </p>
        </div>
        <div className="text-white p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
          <QrCode size={24} />
        </div>
      </div>

      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-xl mx-auto space-y-6 mt-20">
          <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur-sm text-white shadow-xl">
            <p className="text-[11px] uppercase font-black text-white/60 mb-2">Evenement</p>
            <h1 className="text-2xl font-black leading-tight mb-1">{event.title}</h1>
            <p className="text-sm font-bold text-white/70">{eventDate}</p>
            <p className="text-sm font-bold text-white/70">{event.location}</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border-4 border-black shadow-pop space-y-4">
            <div>
              <p className="text-xs font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
                <Camera size={16} /> Scan en direct
              </p>
              <div className="relative w-full overflow-hidden rounded-2xl border-2 border-black bg-slate-900 aspect-[4/3]">
                <video ref={videoRef} className="w-full h-full object-cover" muted />
                {!scanning && (
                  <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center text-sm font-bold">
                    Camera a l arret
                  </div>
                )}
              </div>
              {cameraError && (
                <p className="text-red-600 text-sm font-bold mt-2">{cameraError}</p>
              )}
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="white" onClick={startScanner} icon={<RefreshCcw size={14} />}>
                  Relancer la camera
                </Button>
                {scanning && (
                  <Button type="button" variant="ghost" onClick={stopScanner}>
                    Stop
                  </Button>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase text-slate-500 mb-2">Scanner / saisir le code du billet</p>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCheck();
                    }
                  }}
                  className="w-full bg-slate-50 border-2 border-black rounded-2xl py-4 px-4 text-lg font-black tracking-wide focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Coller le code du QR ou le code booking"
                  autoFocus
                />
                <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleCheck} fullWidth isLoading={checking} icon={<RefreshCcw size={16} />}>
                Valider le check-in
              </Button>
              {result && (
                <Button variant="ghost" onClick={resetResult} fullWidth>
                  Reinitialiser
                </Button>
              )}
            </div>

            {result?.status === 'error' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-700 font-bold flex items-center gap-3">
                <AlertTriangle size={20} /> {result.message}
              </div>
            )}

            {result?.status === 'success' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-green-700 font-bold">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={20} /> Check-in valide
                </div>
                <p className="text-slate-800 font-black text-lg">{result.booking?.name || 'Invite'}</p>
                <p className="text-slate-600 text-sm">Ticket: {result.booking?.ticket}</p>
              </div>
            )}

            {result?.status === 'already' && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 text-orange-700 font-bold">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={20} /> Deja scanne
                </div>
                <p className="text-slate-800 font-black text-lg">{result.booking?.name || 'Invite'}</p>
                <p className="text-slate-600 text-sm">Ticket: {result.booking?.ticket}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
