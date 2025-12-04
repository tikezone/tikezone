import React, { useEffect, useMemo, useState } from 'react';
import { Mail, Shield, X, Loader2, RefreshCcw, Lock } from 'lucide-react';

type DeleteAccountModalProps = {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onDeleted: () => Promise<void> | void;
};

const RESEND_DELAY_MS = 30000;

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, email, onClose, onDeleted }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [nextSendAllowedAt, setNextSendAllowedAt] = useState<number | null>(null);

  const canResend = useMemo(() => {
    if (!nextSendAllowedAt) return true;
    return Date.now() >= nextSendAllowedAt;
  }, [nextSendAllowedAt]);

  useEffect(() => {
    if (!isOpen) {
      setCode('');
      setError(null);
      setStatus(null);
      setNextSendAllowedAt(null);
      return;
    }
    sendCode();
  }, [isOpen]);

  useEffect(() => {
    if (!nextSendAllowedAt) return;
    const timer = setInterval(() => {
      if (Date.now() >= nextSendAllowedAt) {
        setNextSendAllowedAt(null);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [nextSendAllowedAt]);

  const sendCode = async () => {
    setIsSending(true);
    setError(null);
    setStatus('Envoi du code de confirmation...');
    try {
      const res = await fetch('/api/auth/delete-account/send-code', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Envoi impossible');
      }
      setStatus(`Code envoyé à ${email}`);
      setNextSendAllowedAt(Date.now() + RESEND_DELAY_MS);
    } catch (err: any) {
      setError(err?.message || 'Envoi du code impossible');
      setStatus(null);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async () => {
    if (!code.trim()) {
      setError('Saisis le code reçu par email.');
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Suppression impossible');
      }
      await onDeleted();
    } catch (err: any) {
      setError(err?.message || 'Suppression impossible');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-3xl border-4 border-black shadow-pop-lg overflow-hidden animate-in fade-in duration-200">
        <div className="bg-red-500 p-6 border-b-4 border-black flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white text-red-500 rounded-2xl border-4 border-black flex items-center justify-center shadow-pop-sm">
            <Shield size={26} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-2xl font-black font-display uppercase">Confirmez la suppression</h3>
            <p className="text-xs font-bold opacity-90">Un code unique est requis pour continuer.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border-2 border-black rounded-xl p-4 flex items-center gap-3">
            <Mail size={18} className="text-slate-700" />
            <div>
              <p className="font-black text-slate-900 text-sm">Code envoyé à</p>
              <p className="text-slate-600 font-bold text-xs break-all">{email}</p>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-black text-slate-700 uppercase">Code de confirmation</span>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
                  placeholder="6 chiffres"
                  className="w-full pl-9 pr-3 py-3 rounded-xl border-2 border-black font-bold text-sm focus:outline-none focus:shadow-pop-sm"
                  maxLength={6}
                  inputMode="numeric"
                />
              </div>
              <button
                type="button"
                onClick={sendCode}
                disabled={isSending || !canResend}
                className="px-3 py-3 rounded-xl border-2 border-black bg-white font-black text-xs flex items-center gap-2 disabled:opacity-60 shadow-pop-sm hover:shadow-none hover:-translate-y-[1px] transition-all"
              >
                {isSending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                {isSending ? 'Envoi...' : 'Renvoyer'}
              </button>
            </div>
          </label>

          {status && <p className="text-[11px] font-bold text-green-600">{status}</p>}
          {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white border-2 border-black rounded-xl font-black text-slate-900 shadow-pop-sm hover:shadow-none hover:translate-y-[2px] transition-all"
              type="button"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 bg-red-500 border-2 border-black rounded-xl font-black text-white shadow-pop-sm hover:shadow-none hover:translate-y-[2px] transition-all disabled:opacity-60"
              type="button"
            >
              {isDeleting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Suppression...
                </span>
              ) : (
                'Supprimer mon compte'
              )}
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white text-black p-1 rounded-lg border-2 border-black shadow-sm hover:scale-110 transition-transform"
          type="button"
        >
          <X size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
