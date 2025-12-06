'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '../../../lib/safe-navigation';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { ArrowLeft, CheckCircle, AlertTriangle, RefreshCcw, Loader2, QrCode, Camera } from 'lucide-react';

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
    if (controlsRef.current) return;
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
        <Loader2 className="text-orange-500 animate-spin relative z-10" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
        <div className="relative z-10">
          <AlertTriangle size={48} className="text-yellow-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-black uppercase mb-2">Evenement introuvable</h2>
          <button onClick={() => router.push('/scan/dashboard')} className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30">
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-sans flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-black to-black" />
      
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start">
        <button onClick={() => router.back()} className="text-white p-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
          <ArrowLeft size={24} />
        </button>
        <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 flex flex-col items-center max-w-[60%]">
          <p className="text-white text-xs font-black uppercase tracking-widest text-center truncate w-full">{event.title}</p>
          <p className="text-orange-400 text-center text-xs font-bold">
            {stats.scanned} / {stats.total} entrees
          </p>
        </div>
        <div className="text-white p-2.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
          <QrCode size={24} />
        </div>
      </div>

      <div className="relative z-10 flex-1 p-6 md:p-10">
        <div className="max-w-xl mx-auto space-y-6 mt-20">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 text-white">
            <p className="text-[11px] uppercase font-black text-gray-400 mb-2">Evenement</p>
            <h1 className="text-2xl font-black leading-tight mb-1">{event.title}</h1>
            <p className="text-sm font-bold text-gray-400">{eventDate}</p>
            <p className="text-sm font-bold text-gray-400">{event.location}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-5 border border-white/20 space-y-4">
            <div>
              <p className="text-xs font-black uppercase text-gray-400 mb-2 flex items-center gap-2">
                <Camera size={16} /> Scan en direct
              </p>
              <div className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-black aspect-[4/3]">
                <video ref={videoRef} className="w-full h-full object-cover" muted />
                {!scanning && (
                  <div className="absolute inset-0 bg-black/70 text-white flex items-center justify-center text-sm font-bold">
                    Camera a l arret
                  </div>
                )}
              </div>
              {cameraError && (
                <p className="text-red-400 text-sm font-bold mt-2">{cameraError}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={startScanner}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-2xl text-white font-bold text-sm hover:bg-white/20 transition-all"
                >
                  <RefreshCcw size={14} /> Relancer la camera
                </button>
                {scanning && (
                  <button
                    type="button"
                    onClick={stopScanner}
                    className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold text-sm hover:bg-white/10 transition-all"
                  >
                    Stop
                  </button>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase text-gray-400 mb-2">Scanner / saisir le code du billet</p>
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
                  className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 px-4 text-lg text-white font-black tracking-wide focus:outline-none focus:border-orange-500 placeholder-gray-500"
                  placeholder="Coller le code du QR ou le code booking"
                  autoFocus
                />
                <QrCode className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={22} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCheck}
                disabled={checking}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50"
              >
                <RefreshCcw size={16} className={checking ? 'animate-spin' : ''} />
                Valider le check-in
              </button>
              {result && (
                <button
                  onClick={resetResult}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white font-bold hover:bg-white/20 transition-all"
                >
                  Reinitialiser
                </button>
              )}
            </div>

            {result?.status === 'error' && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 text-red-400 font-bold flex items-center gap-3">
                <AlertTriangle size={20} /> {result.message}
              </div>
            )}

            {result?.status === 'success' && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4 text-green-400 font-bold">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={20} /> Check-in valide
                </div>
                <p className="text-white font-black text-lg">{result.booking?.name || 'Invite'}</p>
                <p className="text-gray-400 text-sm">Ticket: {result.booking?.ticket}</p>
              </div>
            )}

            {result?.status === 'already' && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-4 text-orange-400 font-bold">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={20} /> Deja scanne
                </div>
                <p className="text-white font-black text-lg">{result.booking?.name || 'Invite'}</p>
                <p className="text-gray-400 text-sm">Ticket: {result.booking?.ticket}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
