import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ShieldCheck, Star, Navigation, MapPin } from 'lucide-react';
import { Restaurant } from '../types';

interface InteractiveMapProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  userLocation: { lat: number; lng: number } | null;
  centerCoordinates: { lat: number; lng: number };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  userLocation,
  centerCoordinates,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerCoordinates.lat, centerCoordinates.lng],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center map on changes smoothly
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([centerCoordinates.lat, centerCoordinates.lng], 12.5, {
      duration: 1.2,
    });
  }, [centerCoordinates]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const group = markersGroupRef.current;
    group.clearLayers();

    // User Location marker (if available)
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-pin-marker',
        html: `
          <div style="position:relative; width: 24px; height: 24px; background: #0284c7; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            <div style="position:absolute; inset: -6px; border: 2px solid #0284c7; border-radius: 50%; opacity: 0.4;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindTooltip('Tu ubicación actual')
        .addTo(group);
    }

    // Restaurant markers
    restaurants.forEach((restaurant) => {
      const isSelected = selectedRestaurant?.id === restaurant.id;
      const is100GlutenFree = restaurant.certification === '100_gluten_free';
      const isFace = restaurant.certification === 'face_certified';

      const bgColor = is100GlutenFree ? '#059669' : isFace ? '#2563eb' : '#d97706';
      const borderStyle = isSelected ? 'border: 3px solid #0f172a; transform: scale(1.18);' : 'border: 2px solid white;';

      const customIcon = L.divIcon({
        className: 'custom-celiac-marker',
        html: `
          <div style="cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; background: ${bgColor}; ${borderStyle} border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.25); transition: transform 0.2s ease;">
            <svg style="width: 18px; height: 18px; fill: none; stroke: white; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <div style="position: absolute; bottom: -5px; width: 8px; height: 8px; background: ${bgColor}; transform: rotate(45deg);"></div>
          </div>
        `,
        iconSize: [34, 38],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([restaurant.lat, restaurant.lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 210px; max-width: 260px; padding: 2px;">
          <div style="font-size: 11px; font-weight: 700; color: ${bgColor}; margin-bottom: 2px; text-transform: uppercase;">
            ${restaurant.certificationLabel}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
            ${restaurant.name}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
            ${restaurant.cuisine} · ${restaurant.priceLevel} · ${restaurant.city} ${restaurant.countryFlag || ''}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 600; color: #059669; padding-top: 6px; border-top: 1px solid #f1f5f9;">
            <span>★ ${restaurant.rating} (${restaurant.reviewCount})</span>
            <span>${restaurant.celiacTrustScore}% seguro</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectRestaurant(restaurant);
      });

      marker.addTo(group);
    });
  }, [restaurants, selectedRestaurant, userLocation, onSelectRestaurant]);

  // Center on selected restaurant
  useEffect(() => {
    if (selectedRestaurant && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedRestaurant.lat, selectedRestaurant.lng], 15, {
        animate: true,
      });
    }
  }, [selectedRestaurant]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-sm text-xs space-y-1.5 pointer-events-auto">
        <div className="font-semibold text-slate-800 text-[11px] mb-1">
          Nivel de Seguridad Celíaca:
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0" />
          <span>100% Sin Gluten (0% contaminación)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
          <span>Certificado FACE / Asoc. Celíacos</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <span className="w-3 h-3 rounded-full bg-amber-600 shrink-0" />
          <span>Protocolo Auditado / Cocina Aislada</span>
        </div>
      </div>

      {/* Quick Location Reset Button */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([centerCoordinates.lat, centerCoordinates.lng], 13);
            }
          }}
          className="bg-white hover:bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 shadow-md transition-transform active:scale-95 flex items-center justify-center"
          title="Centrar mapa en la ciudad"
        >
          <Navigation className="w-4 h-4 text-emerald-700" />
        </button>
      </div>
    </div>
  );
};
