'use client';

import React, { useState } from 'react';
import { Link2, Copy, Share2, QrCode, X, Check, Crown } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface EventLinksSectionProps {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  customSubdomain?: string | null;
  isPremium?: boolean;
}

const EventLinksSection: React.FC<EventLinksSectionProps> = ({
  eventId,
  eventSlug,
  eventTitle,
  customSubdomain,
  isPremium = false
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${baseUrl}/events/${eventSlug || eventId}`;
  const customUrl = customSubdomain ? `https://${customSubdomain}.tikezone.com` : null;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareUrl = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventTitle,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard(url, 'share');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <Link2 size={20} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Page Publique de l'Evenement</h3>
          <p className="text-gray-400 text-sm">Partagez ces liens avec votre public pour la billetterie</p>
        </div>
      </div>

      <p className="text-gray-400 text-sm">
        Partagez ces liens avec votre public pour la billetterie.
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="p-2 bg-gray-700 rounded-lg">
            <Link2 size={16} className="text-gray-300" />
          </div>
          <input
            type="text"
            value={publicUrl}
            readOnly
            className="flex-1 bg-transparent text-white text-sm font-mono focus:outline-none"
          />
          <button
            onClick={() => copyToClipboard(publicUrl, 'public')}
            className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
            title="Copier"
          >
            {copied === 'public' ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          </button>
          <button
            onClick={() => shareUrl(publicUrl)}
            className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors text-white"
            title="Partager"
          >
            <Share2 size={18} />
          </button>
        </div>

        {isPremium && (
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-purple-400" />
                <span className="text-white font-medium">Lien personnalise</span>
              </div>
              <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
                <Crown size={12} /> Premium
              </span>
            </div>
            
            {customUrl ? (
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl border border-purple-500/30">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Link2 size={16} className="text-purple-400" />
                </div>
                <input
                  type="text"
                  value={customUrl}
                  readOnly
                  className="flex-1 bg-transparent text-purple-300 text-sm font-mono focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(customUrl, 'custom')}
                  className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                >
                  {copied === 'custom' ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
                <button
                  onClick={() => shareUrl(customUrl)}
                  className="p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-colors text-white"
                >
                  <Share2 size={18} />
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Configurez votre sous-domaine personnalise dans les parametres de l'evenement.
              </p>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowQRModal(true)}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors"
      >
        <QrCode size={20} />
        Afficher le QR Code
      </button>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <QrCode size={20} className="text-purple-400" />
                <h3 className="text-lg font-bold text-white">QR Code de l'evenement</h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl flex items-center justify-center mb-4">
              <QRCodeSVG 
                value={publicUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-center text-gray-400 text-sm mb-4">
              Scannez pour acceder a la billetterie
            </p>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventLinksSection;
