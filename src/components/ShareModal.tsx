import React, { useState } from 'react';
import { X, Check, Copy, Share2, MessageCircle } from 'lucide-react';
import { Restaurant } from '../types';
import { shareToTwitter, shareToFacebook, shareToWhatsApp, copyRestaurantLink } from '../utils/geoAndShare';

interface ShareModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ restaurant, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyRestaurantLink(restaurant);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Compartir Restaurante Seguro</h3>
            <p className="text-xs text-slate-500">Recomienda opciones celíacas seguras a tus amigos</p>
          </div>
        </div>

        {/* Restaurant Summary Card Preview */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 mb-5 text-xs space-y-1">
          <div className="font-bold text-slate-900 text-sm">{restaurant.name}</div>
          <div className="text-slate-600">
            {restaurant.address}, {restaurant.city} ({restaurant.countryFlag || ''} {restaurant.country})
          </div>
          <div className="text-emerald-700 font-semibold pt-1">
            {restaurant.certificationLabel} · {restaurant.celiacTrustScore}% confianza celíaca
          </div>
        </div>

        {/* Social Sharing Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => shareToWhatsApp(restaurant)}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Compartir por WhatsApp</span>
          </button>

          <button
            onClick={() => shareToTwitter(restaurant)}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Compartir en X (Twitter)</span>
          </button>

          <button
            onClick={() => shareToFacebook(restaurant)}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Compartir en Facebook</span>
          </button>

          {/* Copy Link button */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">¡Enlace copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copiar enlace al perfil del restaurante</span>
              </>
            )}
          </button>
        </div>

        {/* Tip for Instagram Stories */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            📸 Para Instagram: copia el enlace y pégalo como sticker de enlace en tu Story con una foto de tu comida sin gluten.
          </p>
        </div>
      </div>
    </div>
  );
};
