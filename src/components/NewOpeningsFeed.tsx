import React, { useState } from 'react';
import { Bell, Sparkles, MapPin, ShieldCheck, Plus, Check, Send } from 'lucide-react';
import { NewOpeningAlert, CertificationType } from '../types';

interface NewOpeningsFeedProps {
  alerts: NewOpeningAlert[];
  subscribedCities: string[];
  onToggleSubscription: (city: string) => void;
  onAddNewAlert: (alert: NewOpeningAlert) => void;
}

export const NewOpeningsFeed: React.FC<NewOpeningsFeedProps> = ({
  alerts,
  subscribedCities,
  onToggleSubscription,
  onAddNewAlert,
}) => {
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('Madrid');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('Pizzería Italiana');
  const [description, setDescription] = useState('');
  const [certification, setCertification] = useState<CertificationType>('100_gluten_free');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const availableCities = ['Valencia', 'Madrid', 'Barcelona', 'Alicante', 'Castellón', 'Sevilla', 'Bilbao', 'Málaga'];

  const handleSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const newAlert: NewOpeningAlert = {
      id: `alert-user-${Date.now()}`,
      restaurantName: name,
      city,
      openingDate: 'Próxima apertura (2026)',
      description,
      certification,
      cuisine,
      address,
      lat: 40.4168,
      lng: -3.7038,
    };

    onAddNewAlert(newAlert);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setShowSuggestForm(false);
      setName('');
      setAddress('');
      setDescription('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-2xl p-5 border border-amber-200/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
              <Bell className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Alertas de Nuevas Aperturas Sin Gluten
            </h2>
          </div>
          <p className="text-xs text-slate-600 max-w-xl">
            Entérate antes que nadie de las nuevas inauguraciones de obradores, restaurantes 100% gluten-free y locales certificados en tu ciudad o para tus próximas escapadas.
          </p>
        </div>

        <button
          onClick={() => setShowSuggestForm(!showSuggestForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showSuggestForm ? 'Cerrar formulario' : 'Avisar de nueva apertura'}</span>
        </button>
      </div>

      {/* Suggest Opening Form */}
      {showSuggestForm && (
        <form
          onSubmit={handleSuggest}
          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-in slide-in-from-top duration-200"
        >
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">
              Avisar a la Comunidad sobre un Nuevo Local Sin Gluten
            </h3>
            <p className="text-xs text-slate-500">
              ¿Han abierto una pizzería segura o una pastelería en tu barrio? Compártelo para incluirlo en el mapa.
            </p>
          </div>

          {submittedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              ¡Apertura añadida con éxito! Ya aparece en el feed de la comunidad.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nombre del Restaurante</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Obrador La Espiga Libre"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Ciudad</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo de Cocina</label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="Pizzería, Obrador, Tapas..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Dirección exacta</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle y número..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipo de Certificación</label>
              <select
                value={certification}
                onChange={(e) => setCertification(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              >
                <option value="100_gluten_free">100% Sin Gluten Dedicado</option>
                <option value="face_certified">Certificado FACE</option>
                <option value="audited_protocol">Protocolo Auditado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1 text-xs">Detalles del local y platos</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Acaban de abrir este mes, tienen freidoras independientes y la masa la hacen sin trazas..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar aviso a la comunidad</span>
            </button>
          </div>
        </form>
      )}

      {/* City Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">
            Activar notificaciones para mis ciudades habituales:
          </span>
          <span className="text-[11px] text-slate-500">
            {subscribedCities.length} ciudades activas
          </span>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {availableCities.map((cityName) => {
            const isSubscribed = subscribedCities.includes(cityName);
            return (
              <button
                key={cityName}
                onClick={() => onToggleSubscription(cityName)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                  isSubscribed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bell className={`w-3.5 h-3.5 ${isSubscribed ? 'fill-emerald-600 text-emerald-600' : 'text-slate-400'}`} />
                <span>{cityName}</span>
                {isSubscribed && <Check className="w-3 h-3 text-emerald-700 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed List of Openings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  {alert.openingDate}
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {alert.city}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {alert.restaurantName}
              </h4>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{alert.cuisine}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-medium">
                  {alert.certification === '100_gluten_free' ? '100% Sin Gluten' : 'Certificado FACE'}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                {alert.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 truncate max-w-[220px]">
                {alert.address}
              </span>
              <span className="font-semibold text-emerald-700">
                Apertura verificada ✓
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
