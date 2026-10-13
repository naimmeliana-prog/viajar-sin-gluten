import React, { useState } from 'react';
import { ShieldCheck, Star, Heart, Share2, MapPin, Check, Flame, UtensilsCrossed } from 'lucide-react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  distanceKm?: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (restaurant: Restaurant) => void;
  onShare: (restaurant: Restaurant) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  distanceKm,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onShare,
}) => {
  const [imageError, setImageError] = useState(false);

  const is100GlutenFree = restaurant.certification === '100_gluten_free';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col group">
      {/* Top Media Area */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onSelect(restaurant)}>
        {!imageError ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 p-4 text-center">
            <UtensilsCrossed className="w-10 h-10 text-emerald-600 mb-2" />
            <span className="text-sm font-semibold text-slate-800">{restaurant.name}</span>
            <span className="text-xs text-slate-500">{restaurant.cuisine}</span>
          </div>
        )}

        {/* Contrast Scrim for safety info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Celiac Certification Badge overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold drop-shadow-xs">
            <ShieldCheck className={`w-4 h-4 ${is100GlutenFree ? 'text-emerald-400' : 'text-amber-300'}`} />
            <span className={is100GlutenFree ? 'text-emerald-200' : 'text-amber-200'}>
              {restaurant.certificationLabel}
            </span>
          </div>

          {distanceKm !== undefined && (
            <span className="text-xs font-medium text-slate-200 tabular-nums">
              {distanceKm} km
            </span>
          )}
        </div>

        {/* Favorite & Share Quick Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(restaurant);
            }}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 flex items-center justify-center backdrop-blur-xs shadow-xs transition-transform active:scale-95"
            title="Compartir restaurante"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(restaurant.id);
            }}
            className={`w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center backdrop-blur-xs shadow-xs transition-transform active:scale-95 ${
              isFavorite ? 'text-rose-500' : 'text-slate-500 hover:text-rose-400'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Card Title */}
          <h3
            onClick={() => onSelect(restaurant)}
            className="text-lg font-bold text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer leading-snug line-clamp-1"
          >
            {restaurant.name}
          </h3>

          {/* Unboxed Metadata (NO PILLS) with typographic separators */}
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>{restaurant.cuisine}</span>
            <span aria-hidden="true">·</span>
            <span>{restaurant.countryFlag ? `${restaurant.countryFlag} ` : ''}{restaurant.city}</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-700">{restaurant.priceLevel}</span>
            <span aria-hidden="true">·</span>
            <span className={restaurant.isOpenNow ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
              {restaurant.isOpenNow ? 'Abierto hoy' : 'Cerrado ahora'}
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {restaurant.tagline}
          </p>

          {/* Key Safety Checklist highlights */}
          <div className="mt-3.5 space-y-1.5 text-xs">
            {restaurant.safetyChecklist.dedicatedFryer && (
              <div className="flex items-center gap-2 text-slate-700">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Freidora exclusiva sin gluten comprobada</span>
              </div>
            )}
            {restaurant.safetyChecklist.sealedBreadBag && (
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pan servido en bolsa horneable precintada</span>
              </div>
            )}
            {restaurant.safetyChecklist.draftGlutenFreeBeer && (
              <div className="flex items-center gap-2 text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Cerveza sin gluten disponible</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Score & CTA */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{restaurant.rating}</span>
              <span className="text-slate-400 font-normal">({restaurant.reviewCount})</span>
            </div>

            <div className="text-xs text-emerald-700 font-medium">
              <span className="font-bold tabular-nums">{restaurant.celiacTrustScore}%</span> confianza celíaca
            </div>
          </div>

          <button
            onClick={() => onSelect(restaurant)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Ver carta & reseñas →
          </button>
        </div>
      </div>
    </div>
  );
};
