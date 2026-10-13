import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  Clock,
  Users,
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Download,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { Restaurant, TripReminder } from '../types';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../utils/geoAndShare';

interface RemindersAndFavoritesProps {
  favorites: Restaurant[];
  allRestaurants: Restaurant[];
  reminders: TripReminder[];
  onRemoveFavorite: (id: string) => void;
  onSaveReminder: (reminder: TripReminder) => void;
  onDeleteReminder: (id: string) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  initialSelectedRestaurantForReminder?: Restaurant | null;
}

export const RemindersAndFavorites: React.FC<RemindersAndFavoritesProps> = ({
  favorites,
  allRestaurants,
  reminders,
  onRemoveFavorite,
  onSaveReminder,
  onDeleteReminder,
  onSelectRestaurant,
  initialSelectedRestaurantForReminder,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'reminders'>('favorites');
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // Form state
  const [selectedRestId, setSelectedRestId] = useState(
    initialSelectedRestaurantForReminder?.id || allRestaurants[0]?.id || ''
  );
  const [tripTitle, setTripTitle] = useState('Viaje gastronómico sin gluten');
  const [date, setDate] = useState('2026-10-25');
  const [time, setTime] = useState('14:30');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState(
    'Avisar al camarero al sentarse: una persona celíaca estricta en la mesa. Pedir pan sin gluten precintado.'
  );

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const rest = allRestaurants.find((r) => r.id === selectedRestId);
    if (!rest) return;

    const newReminder: TripReminder = {
      id: `rem-${Date.now()}`,
      restaurantId: rest.id,
      restaurantName: rest.name,
      date,
      time,
      tripTitle,
      notes,
      partySize,
    };

    onSaveReminder(newReminder);
    setShowAddReminderModal(false);
    setActiveSubTab('reminders');
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === 'favorites'
                ? 'bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeSubTab === 'favorites' ? 'fill-rose-500' : ''}`} />
            <span>Mis Restaurantes Favoritos ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('reminders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              activeSubTab === 'reminders'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Próximas Visitas & Viajes ({reminders.length})</span>
          </button>
        </div>

        <button
          onClick={() => setShowAddReminderModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Programar nueva visita</span>
        </button>
      </div>

      {/* Modal to add reminder */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Programar Visita o Salida Sin Gluten
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Crea un recordatorio para tus viajes con tus amigas y amigos celíacos y expórtalo a tu calendario con notas de seguridad.
            </p>

            <form onSubmit={handleCreateReminder} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Restaurante</label>
                <select
                  value={selectedRestId}
                  onChange={(e) => setSelectedRestId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  {allRestaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.city} - {r.certificationLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Motivo / Nombre del viaje</label>
                <input
                  type="text"
                  required
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  placeholder="Ej: Fin de semana en Barcelona con Laura"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Comensales</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Notas para la reserva y protocolo celíaco
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Recordar que hay celíaco estricto, preguntar por freidora..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-xs"
                >
                  Guardar Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Favorites list */}
      {activeSubTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/90 p-8 space-y-3">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                Aún no tienes restaurantes en Favoritos
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explora el mapa y pulsa el corazón en los locales seguros que quieras tener a mano para tus próximas salidas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((rest) => (
                <div
                  key={rest.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {rest.certificationLabel}
                      </span>
                      <button
                        onClick={() => onRemoveFavorite(rest.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Quitar de favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4
                      onClick={() => onSelectRestaurant(rest)}
                      className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer text-base line-clamp-1"
                    >
                      {rest.name}
                    </h4>

                    <div className="mt-1 text-xs text-slate-500">
                      {rest.cuisine} · {rest.city} · {rest.priceLevel}
                    </div>

                    <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                      {rest.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700">
                      {rest.celiacTrustScore}% seguro
                    </span>

                    <button
                      onClick={() => onSelectRestaurant(rest)}
                      className="text-xs font-semibold text-slate-800 hover:text-emerald-700 px-2 py-1"
                    >
                      Ver detalles →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Reminders & Planned Visits */}
      {activeSubTab === 'reminders' && (
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/90 p-8 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                No tienes visitas o viajes programados
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Organiza con antelación tus comidas fuera de casa. Añade la fecha, las notas sobre celiaquía y sincronízalo con tu Google Calendar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map((rem) => {
                const googleCalUrl = generateGoogleCalendarUrl(rem);

                return (
                  <div
                    key={rem.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 text-sm">
                        {rem.tripTitle}
                      </span>
                      <button
                        onClick={() => onDeleteReminder(rem.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Eliminar recordatorio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{rem.restaurantName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{rem.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{rem.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{rem.partySize} personas</span>
                      </div>
                    </div>

                    {rem.notes && (
                      <div className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-900 block">Notas de seguridad celíaca:</strong>
                          <span>{rem.notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Sincronización de calendario */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Añadir a Google Calendar</span>
                      </a>

                      <button
                        onClick={() => downloadIcsFile(rem)}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                        title="Descargar archivo .ics para Outlook o Apple Calendar"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar .ics</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
