import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  DownloadCloud,
  CheckCircle2,
  Copy,
  Check,
  Languages,
  ShieldCheck,
  Search,
  Phone,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Restaurant } from '../types';
import { CELIAC_TRAVEL_CARD_TRANSLATIONS } from '../data/mockRestaurants';
import { StorageService } from '../services/storageService';

interface OfflineManagerProps {
  restaurants: Restaurant[];
  isOfflineMode: boolean;
  onToggleOfflineMode: (offline: boolean) => void;
  lastSyncTime: string | null;
  onRefreshCache: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  restaurants,
  isOfflineMode,
  onToggleOfflineMode,
  lastSyncTime,
  onRefreshCache,
  onSelectRestaurant,
}) => {
  const [offlineSearch, setOfflineSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en' | 'fr' | 'it' | 'de' | 'pt'>('es');
  const [copiedCard, setCopiedCard] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeCard = CELIAC_TRAVEL_CARD_TRANSLATIONS[selectedLanguage];

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(activeCard.message);
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2500);
    } catch {}
  };

  const handleManualDownload = () => {
    StorageService.saveRestaurants(restaurants);
    onRefreshCache();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Filtered restaurants for quick offline lookup
  const offlineFiltered = restaurants.filter((r) => {
    const q = offlineSearch.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.specialties.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Offline Status & Control Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              isOfflineMode
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isOfflineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {isOfflineMode ? 'Modo Offline Activo' : 'Conexión en Línea (Online)'}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOfflineMode
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isOfflineMode ? 'Sin red / Avión' : 'Sincronizado'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {lastSyncTime
                ? `Caché local actualizada: ${new Date(lastSyncTime).toLocaleDateString()} a las ${new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Base de datos lista para consultas sin conexión'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Segmented Switch for Online vs Offline */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onToggleOfflineMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isOfflineMode
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Modo Online</span>
            </button>
            <button
              onClick={() => onToggleOfflineMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5 text-slate-900" />
              <span>Modo Offline</span>
            </button>
          </div>

          {/* Download offline data button */}
          <button
            onClick={handleManualDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Descargar Guía para Viajes</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ¡Guía completa descargada en tu dispositivo! Puedes consultar todos los restaurantes sin conexión.
        </div>
      )}

      {/* Main Grid: Celiac Travel Card & Quick Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Multilingual Celiac Travel Card */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700">
                <Languages className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Tarjeta de Viaje del Celíaco para Camareros
                </h4>
                <p className="text-[11px] text-slate-500">
                  Muéstrasela al personal del restaurante sin cobertura o en el extranjero
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyCard}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {copiedCard ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar texto</span>
                </>
              )}
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(['es', 'en', 'fr', 'it', 'de', 'pt'] as const).map((langKey) => (
              <button
                key={langKey}
                onClick={() => setSelectedLanguage(langKey)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedLanguage === langKey
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{CELIAC_TRAVEL_CARD_TRANSLATIONS[langKey].flag}</span>
                <span>{CELIAC_TRAVEL_CARD_TRANSLATIONS[langKey].language.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Card Message Box */}
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900">
                {activeCard.title}
              </span>
              <span className="text-lg">{activeCard.flag}</span>
            </div>

            <div className="text-xs sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-line font-medium font-mono sm:font-sans bg-white/80 p-3.5 rounded-xl border border-amber-200/50 shadow-2xs">
              {activeCard.message}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-amber-800">
              <span>🌾 0% Gluten · Contaminación Cruzada Cero</span>
              <span className="font-semibold">GlutenSafe App</span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Offline Directory */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900">
              Consultas Rápidas Offline
            </h4>
            <p className="text-[11px] text-slate-500">
              Listado ultraligero cargado en memoria local para consultar teléfonos y direcciones
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={offlineSearch}
              onChange={(e) => setOfflineSearch(e.target.value)}
              placeholder="Buscar en la base de datos descargada..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Lightweight list */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {offlineFiltered.map((rest) => (
              <div
                key={rest.id}
                onClick={() => onSelectRestaurant(rest)}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors cursor-pointer text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900 truncate pr-2">
                    {rest.name}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded shrink-0">
                    {rest.certification === '100_gluten_free' ? '100% Sin Gluten' : 'FACE'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <span>{rest.countryFlag ? `${rest.countryFlag} ` : ''}{rest.city}</span>
                  <span>·</span>
                  <span>{rest.cuisine}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-medium">{rest.celiacTrustScore}% seguro</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1 border-t border-slate-200/50">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{rest.address}</span>
                  </div>

                  <a
                    href={`tel:${rest.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 font-semibold text-emerald-700 hover:underline shrink-0"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Llamar</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
