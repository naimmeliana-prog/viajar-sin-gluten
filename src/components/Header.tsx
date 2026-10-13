import React from 'react';
import { User, WifiOff, Bell, Heart, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'explore' | 'map' | 'alerts' | 'trips' | 'offline';
  setActiveTab: (tab: 'explore' | 'map' | 'alerts' | 'trips' | 'offline') => void;
  favoritesCount: number;
  remindersCount: number;
  newAlertsCount: number;
  isOfflineMode: boolean;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  favoritesCount,
  remindersCount,
  newAlertsCount,
  isOfflineMode,
  onOpenProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-2.5 text-left group transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 group-hover:bg-emerald-700 transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                GlutenSafe
              </span>
              <span className="text-[11px] font-medium text-emerald-700 tracking-wide">
                Restaurantes Seguros
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('explore')}
              className={`whitespace-nowrap transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'explore'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Explorar
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`whitespace-nowrap transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'map'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Mapa Cercano
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative whitespace-nowrap transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'alerts'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Nuevas Aperturas
              {newAlertsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 rounded font-bold">
                  {newAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trips')}
              className={`whitespace-nowrap transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'trips'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Favoritos & Viajes
              {(favoritesCount > 0 || remindersCount > 0) && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-slate-100 text-slate-700 rounded font-semibold">
                  {favoritesCount + remindersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('offline')}
              className={`flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'offline'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5 text-slate-500" />
              <span>Modo Offline</span>
              {isOfflineMode && (
                <span className="text-[10px] bg-amber-50 text-amber-700 px-1 rounded font-medium">
                  Activo
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              title="Ver y editar perfil celíaco"
            >
              <User className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Mi Perfil Celíaco</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom-like quick switcher bar for ergonomics */}
      <div className="md:hidden border-t border-slate-100 px-2 py-2 flex items-center justify-around text-xs bg-slate-50/90">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'explore' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Explorar
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'map' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Mapa
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'alerts' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Aperturas
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'trips' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Guardados
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'offline' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Offline
        </button>
      </div>
    </header>
  );
};
