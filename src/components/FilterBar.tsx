import React from 'react';
import { Search, MapPin, Globe2, RotateCcw, Crosshair, ShieldCheck, Flame } from 'lucide-react';
import { FilterState, CertificationType } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  onReset: () => void;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
  totalResults: number;
}

const COUNTRIES = [
  { name: 'Todos los países', code: 'all', flag: '🌍' },
  { name: 'España', code: 'España', flag: '🇪🇸' },
  { name: 'Alemania', code: 'Alemania', flag: '🇩🇪' },
  { name: 'Francia', code: 'Francia', flag: '🇫🇷' },
  { name: 'Italia', code: 'Italia', flag: '🇮🇹' },
  { name: 'Portugal', code: 'Portugal', flag: '🇵🇹' },
  { name: 'Reino Unido', code: 'Reino Unido', flag: '🇬🇧' },
  { name: 'Austria', code: 'Austria', flag: '🇦🇹' },
  { name: 'Países Bajos', code: 'Países Bajos', flag: '🇳🇱' },
  { name: 'Bélgica', code: 'Bélgica', flag: '🇧🇪' },
  { name: 'Suiza', code: 'Suiza', flag: '🇨🇭' },
  { name: 'Irlanda', code: 'Irlanda', flag: '🇮🇪' },
  { name: 'Grecia', code: 'Grecia', flag: '🇬🇷' },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'España': ['Valencia', 'Madrid', 'Barcelona', 'Alicante', 'Castellón', 'Sevilla', 'Bilbao', 'Málaga', 'Granada', 'Zaragoza', 'Palma de Mallorca', 'San Sebastián'],
  'Alemania': ['Berlín', 'Múnich', 'Colonia', 'Hamburgo', 'Fráncfort'],
  'Francia': ['París', 'Niza', 'Lyon', 'Burdeos', 'Marsella'],
  'Italia': ['Roma', 'Florencia', 'Milán', 'Nápoles', 'Bolonia'],
  'Portugal': ['Lisboa', 'Oporto', 'Faro', 'Sintra'],
  'Reino Unido': ['Londres', 'Edimburgo', 'Mánchester'],
  'Austria': ['Viena', 'Salzburgo'],
  'Países Bajos': ['Ámsterdam', 'Róterdam'],
  'Bélgica': ['Bruselas', 'Brujas'],
  'Suiza': ['Zúrich', 'Ginebra'],
  'Irlanda': ['Dublín'],
  'Grecia': ['Atenas'],
};

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  onReset,
  onUseCurrentLocation,
  isLocating,
  totalResults,
}) => {
  // Compute available cities based on country filter
  const availableCities = React.useMemo(() => {
    if (filters.selectedCountry !== 'all' && CITIES_BY_COUNTRY[filters.selectedCountry]) {
      return CITIES_BY_COUNTRY[filters.selectedCountry];
    }
    // All cities combined
    return Object.values(CITIES_BY_COUNTRY).flat();
  }, [filters.selectedCountry]);

  const cuisines = [
    'Todas',
    'Pizzería Italiana',
    'Tapas & Tradicional',
    'Obrador & Desayunos',
    'Brunch & Café',
    'Hamburguesería',
    'Mediterránea & Arroces',
    'Cocina Creativa & Mercado',
  ];

  const handleCountryChange = (countryCode: string) => {
    onChange({
      selectedCountry: countryCode,
      selectedCity: 'all', // Reset city on country change
      maxDistanceKm: 0, // Reset distance radius to immediately show all restaurants
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Top Search, Country & Location Strip */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="relative md:col-span-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Buscar por restaurante, plato (pizza, tapas, schnitzel) o ciudad..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Country Selector */}
        <div className="relative md:col-span-3">
          <Globe2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors appearance-none font-medium text-slate-800"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Select */}
        <div className="relative md:col-span-2">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={filters.selectedCity}
            onChange={(e) => onChange({ selectedCity: e.target.value })}
            className="w-full pl-9 pr-6 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors appearance-none font-medium text-slate-800 text-xs"
          >
            <option value="all">Todas las ciudades</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Distance Radius */}
        <div className="relative md:col-span-2">
          <select
            value={filters.maxDistanceKm}
            onChange={(e) => onChange({ maxDistanceKm: Number(e.target.value) })}
            className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors appearance-none text-slate-800"
          >
            <option value={0}>Distancia: Cualquiera</option>
            <option value={2}>Dentro de 2 km</option>
            <option value={5}>Dentro de 5 km</option>
            <option value={10}>Dentro de 10 km</option>
            <option value={25}>Dentro de 25 km</option>
          </select>
        </div>

        {/* Geolocation Button & Reset */}
        <div className="md:col-span-1 flex items-center gap-1.5">
          <button
            onClick={onUseCurrentLocation}
            disabled={isLocating}
            className="p-2.5 flex items-center justify-center text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Calcular distancias desde tu GPS actual"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onReset}
            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Restablecer filtros"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* European Countries Quick Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar pt-1 border-t border-slate-100">
        <span className="text-slate-400 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
          <Globe2 className="w-3.5 h-3.5" />
          <span>País:</span>
        </span>
        {COUNTRIES.map((item) => {
          const isActive = filters.selectedCountry === item.code;
          return (
            <button
              key={item.code}
              onClick={() => handleCountryChange(item.code)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <span>{item.flag}</span>
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* Certification Segmented Tabs & Security Quick Toggles */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Interactive Segmented Control for Certification */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl text-xs overflow-x-auto max-w-full">
          <button
            onClick={() => onChange({ certification: 'all', only100PercentGlutenFree: false })}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              filters.certification === 'all' && !filters.only100PercentGlutenFree
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas las certificaciones
          </button>

          <button
            onClick={() => onChange({ certification: '100_gluten_free', only100PercentGlutenFree: true })}
            className={`flex items-center gap-1 px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              filters.certification === '100_gluten_free' || filters.only100PercentGlutenFree
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Sin Gluten (0% Riesgo)</span>
          </button>

          <button
            onClick={() => onChange({ certification: 'face_certified', only100PercentGlutenFree: false })}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              filters.certification === 'face_certified'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Certificado Oficial (FACE / AIC / AFDIAG)
          </button>

          <button
            onClick={() => onChange({ certification: 'audited_protocol', only100PercentGlutenFree: false })}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap ${
              filters.certification === 'audited_protocol'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Protocolo Auditado
          </button>
        </div>

        {/* Dedicated Safety Switches */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange({ onlyDedicatedFryer: !filters.onlyDedicatedFryer })}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              filters.onlyDedicatedFryer
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Freidora Exclusiva</span>
          </button>

          {/* Price Selector */}
          <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs">
            {['all', '€', '€€', '€€€'].map((p) => (
              <button
                key={p}
                onClick={() => onChange({ price: p })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  filters.price === p
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p === 'all' ? 'Precio' : p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cuisine Quick Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Cocina:</span>
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ cuisine: c === 'Todas' ? 'all' : c })}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
              (c === 'Todas' && filters.cuisine === 'all') || filters.cuisine === c
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            {c}
          </button>
        ))}

        <div className="ml-auto text-xs text-slate-400 font-medium whitespace-nowrap pl-2">
          <span className="text-slate-900 font-semibold tabular-nums">{totalResults}</span> locales encontrados
        </div>
      </div>
    </div>
  );
};
