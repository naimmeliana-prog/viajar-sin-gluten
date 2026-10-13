import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  Utensils,
  Euro,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  Trash2,
  Save,
  MessageSquare,
} from 'lucide-react';
import { UserPreferences, PriceLevel, Restaurant, Review } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSavePreferences: (updated: UserPreferences) => void;
  visitedHistory: { restaurantId: string; visitedAt: string }[];
  allRestaurants: Restaurant[];
  userReviews: Review[];
  onRemoveVisited: (restaurantId: string) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSavePreferences,
  visitedHistory,
  allRestaurants,
  userReviews,
  onRemoveVisited,
  onSelectRestaurant,
}) => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'visited' | 'myReviews'>('preferences');
  const [form, setForm] = useState<UserPreferences>(preferences);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const cuisinesList = [
    'Pizzería Italiana',
    'Tapas & Tradicional',
    'Obrador & Desayunos',
    'Brunch & Café',
    'Hamburguesería',
    'Mediterránea & Arroces',
    'Cocina Creativa & Mercado',
  ];

  const priceLevels: PriceLevel[] = ['€', '€€', '€€€'];

  const toggleCuisine = (c: string) => {
    const list = form.favoriteCuisines.includes(c)
      ? form.favoriteCuisines.filter((item) => item !== c)
      : [...form.favoriteCuisines, c];
    setForm({ ...form, favoriteCuisines: list });
  };

  const togglePrice = (p: PriceLevel) => {
    const list = form.pricePreference.includes(p)
      ? form.pricePreference.filter((item) => item !== p)
      : [...form.pricePreference, p];
    setForm({ ...form, pricePreference: list });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col relative">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {form.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-none">{form.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{form.celiacCondition}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'preferences'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Preferencias de Búsqueda
          </button>

          <button
            onClick={() => setActiveTab('visited')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'visited'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historial de Visitas ({visitedHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('myReviews')}
            className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'myReviews'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mis Reseñas ({userReviews.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {activeTab === 'preferences' && (
            <form onSubmit={handleSave} className="space-y-4">
              {savedSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Preferencias guardadas correctamente. Tu feed y filtros se adaptarán a ti.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Relación con la Celiaquía
                  </label>
                  <select
                    value={form.celiacCondition}
                    onChange={(e) => setForm({ ...form, celiacCondition: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Celíaca diagnosticada">Celíaca diagnosticada</option>
                    <option value="Sensibilidad al gluten no celíaca">Sensibilidad al gluten no celíaca</option>
                    <option value="Acompañante de persona celíaca">Acompañante de persona celíaca</option>
                    <option value="Alergia al trigo">Alergia al trigo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Ciudad Base</label>
                  <input
                    type="text"
                    value={form.homeCity}
                    onChange={(e) => setForm({ ...form, homeCity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-2">
                  Cocinas y tipos de local preferidos:
                </label>
                <div className="flex flex-wrap gap-2">
                  {cuisinesList.map((cuisine) => {
                    const isSelected = form.favoriteCuisines.includes(cuisine);
                    return (
                      <button
                        type="button"
                        key={cuisine}
                        onClick={() => toggleCuisine(cuisine)}
                        className={`px-3 py-1.5 rounded-xl border font-medium transition-colors ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cuisine}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Preferences */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-2">
                  Rango de precio habitual:
                </label>
                <div className="flex gap-2">
                  {priceLevels.map((price) => {
                    const isSelected = form.pricePreference.includes(price);
                    return (
                      <button
                        type="button"
                        key={price}
                        onClick={() => togglePrice(price)}
                        className={`px-4 py-1.5 rounded-xl border font-bold transition-colors ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {price}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-2 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Preferencias de Búsqueda</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'visited' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">
                  Restaurantes que has visitado:
                </span>
                <span className="text-slate-500">
                  {visitedHistory.length} establecimientos
                </span>
              </div>

              {visitedHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Aún no has marcado restaurantes como visitados.
                </div>
              ) : (
                <div className="space-y-2">
                  {visitedHistory.map((item) => {
                    const rest = allRestaurants.find((r) => r.id === item.restaurantId);
                    if (!rest) return null;

                    return (
                      <div
                        key={item.restaurantId}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between"
                      >
                        <div>
                          <div
                            onClick={() => {
                              onSelectRestaurant(rest);
                              onClose();
                            }}
                            className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                          >
                            {rest.name}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {rest.city} · Visitado el {item.visitedAt}
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveVisited(item.restaurantId)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                          title="Eliminar del historial"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'myReviews' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-800">
                  Tus Reseñas Verificadas Publicadas:
                </span>
                <span className="text-slate-500">
                  {userReviews.length} reseñas
                </span>
              </div>

              {userReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Aún no has escrito ninguna reseña. Entra a la ficha de un restaurante para compartir tu experiencia con otras personas celíacas.
                </div>
              ) : (
                <div className="space-y-3">
                  {userReviews.map((rev) => {
                    const rest = allRestaurants.find((r) => r.id === rev.restaurantId);
                    return (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {rest?.name || 'Restaurante'}
                          </span>
                          <span className="text-slate-400 text-[11px]">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-600">
                          <span className="font-semibold text-amber-600">★ {rev.rating}/5</span>
                          <span>
                            Síntomas: <strong>{rev.hadSymptoms ? 'Sí' : '0 síntomas'}</strong>
                          </span>
                        </div>

                        <p className="text-slate-700 text-xs italic">"{rev.comment}"</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
