import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  MapPin,
  Flame,
  Star,
  Compass,
  Map,
  Grid,
  Heart,
  Calendar,
  Bell,
  WifiOff,
  Wifi,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  Restaurant,
  FilterState,
  Review,
  TripReminder,
  NewOpeningAlert,
  UserPreferences,
} from './types';
import { StorageService } from './services/storageService';
import { calculateDistanceKm } from './utils/geoAndShare';
import { CITY_COORDINATES } from './data/mockRestaurants';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { RestaurantCard } from './components/RestaurantCard';
import { InteractiveMap } from './components/InteractiveMap';
import { RestaurantDetailModal } from './components/RestaurantDetailModal';
import { ShareModal } from './components/ShareModal';
import { NewOpeningsFeed } from './components/NewOpeningsFeed';
import { RemindersAndFavorites } from './components/RemindersAndFavorites';
import { OfflineManager } from './components/OfflineManager';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  // Data state
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => StorageService.getRestaurants());
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.getFavorites());
  const [visitedHistory, setVisitedHistory] = useState(() => StorageService.getVisitedHistory());
  const [reminders, setReminders] = useState<TripReminder[]>(() => StorageService.getReminders());
  const [alerts, setAlerts] = useState<NewOpeningAlert[]>(() => StorageService.getOpeningAlerts());
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => StorageService.getUserPreferences());
  const [userReviews, setUserReviews] = useState<Review[]>(() => StorageService.getUserReviews());
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => StorageService.getLastSync());

  // Navigation & View mode
  const [activeTab, setActiveTab] = useState<'explore' | 'map' | 'alerts' | 'trips' | 'offline'>('explore');
  const [exploreViewMode, setExploreViewMode] = useState<'split' | 'grid'>('grid');

  // Modals state
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [shareRestaurant, setShareRestaurant] = useState<Restaurant | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [reminderTargetRestaurant, setReminderTargetRestaurant] = useState<Restaurant | null>(null);

  // Connection & Offline simulation
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    return StorageService.isOfflineSimulated() || !navigator.onLine;
  });

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCountry: 'all',
    selectedCity: 'all',
    maxDistanceKm: 0,
    certification: 'all',
    cuisine: 'all',
    price: 'all',
    minTrustScore: 0,
    onlyDedicatedFryer: false,
    only100PercentGlutenFree: false,
  });

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (!StorageService.isOfflineSimulated()) setIsOfflineMode(false);
    };
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Request user location with fallback
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIsLocating(false);
        },
        () => {
          // Fallback to Madrid center
          setUserLocation(CITY_COORDINATES['Madrid']);
          setIsLocating(false);
        },
        { timeout: 6000 }
      );
    } else {
      setUserLocation(CITY_COORDINATES['Madrid']);
      setIsLocating(false);
    }
  };

  // European capitals mapping for centering and distance calculations
  const COUNTRY_CAPITALS: Record<string, string> = useMemo(() => ({
    'España': 'Madrid',
    'Alemania': 'Berlín',
    'Francia': 'París',
    'Italia': 'Roma',
    'Portugal': 'Lisboa',
    'Reino Unido': 'Londres',
    'Austria': 'Viena',
    'Países Bajos': 'Ámsterdam',
    'Bélgica': 'Bruselas',
    'Suiza': 'Zúrich',
    'Irlanda': 'Dublín',
    'Grecia': 'Atenas',
  }), []);

  // Center coordinate for map
  const centerCoordinates = useMemo(() => {
    // 1. Explicit city selected
    if (filters.selectedCity !== 'all' && CITY_COORDINATES[filters.selectedCity]) {
      return CITY_COORDINATES[filters.selectedCity];
    }

    // 2. Explicit country selected -> center on its capital
    if (filters.selectedCountry !== 'all') {
      const capital = COUNTRY_CAPITALS[filters.selectedCountry];
      if (capital && CITY_COORDINATES[capital]) return CITY_COORDINATES[capital];
    }

    // 3. User search query mentions a specific city or country
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Check city names
      for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
        const normCity = cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (normCity === q || q.includes(normCity)) {
          return coords;
        }
      }

      // Check country names
      for (const [countryName, capitalName] of Object.entries(COUNTRY_CAPITALS)) {
        const normCountry = countryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (normCountry === q || q.includes(normCountry)) {
          if (CITY_COORDINATES[capitalName]) return CITY_COORDINATES[capitalName];
        }
      }
    }

    // 4. GPS location if available
    if (userLocation) return userLocation;

    // 5. Default center
    return CITY_COORDINATES['Madrid'];
  }, [filters.selectedCity, filters.selectedCountry, filters.searchQuery, userLocation, COUNTRY_CAPITALS]);

  // Filter pipeline
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .map((restaurant) => {
        // Calculate distance if coordinates available
        let dist: number | undefined = undefined;
        let refPoint: { lat: number; lng: number } | null = null;

        if (filters.selectedCity !== 'all' && CITY_COORDINATES[filters.selectedCity]) {
          refPoint = CITY_COORDINATES[filters.selectedCity];
        } else if (filters.selectedCountry !== 'all') {
          // When a country is selected, measure distance from that country's capital
          const capCity = COUNTRY_CAPITALS[filters.selectedCountry];
          const capCoords = capCity ? CITY_COORDINATES[capCity] : null;
          // If user location is in the same country (~300km from capital), use userLocation
          if (userLocation && capCoords && calculateDistanceKm(userLocation.lat, userLocation.lng, capCoords.lat, capCoords.lng) < 300) {
            refPoint = userLocation;
          } else {
            refPoint = capCoords || CITY_COORDINATES['Madrid'];
          }
        } else {
          refPoint = userLocation || CITY_COORDINATES['Madrid'];
        }

        if (refPoint) {
          dist = calculateDistanceKm(refPoint.lat, refPoint.lng, restaurant.lat, restaurant.lng);
        }
        return { restaurant, distanceKm: dist };
      })
      .filter(({ restaurant, distanceKm }) => {
        // Search query with accent and diacritics tolerance across all relevant fields
        if (filters.searchQuery.trim()) {
          const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const q = normalize(filters.searchQuery.trim());

          const matchName = normalize(restaurant.name).includes(q);
          const matchTagline = normalize(restaurant.tagline || '').includes(q);
          const matchDesc = normalize(restaurant.description || '').includes(q);
          const matchCuisine = normalize(restaurant.cuisine).includes(q);
          const matchCity = normalize(restaurant.city).includes(q);
          const matchCountry = normalize(restaurant.country).includes(q);
          const matchAddress = normalize(restaurant.address).includes(q);
          const matchCert = normalize(restaurant.certificationLabel || '').includes(q);
          const matchSpecs = restaurant.specialties.some((s) => normalize(s).includes(q));

          if (!matchName && !matchTagline && !matchDesc && !matchCuisine && !matchCity && !matchCountry && !matchAddress && !matchCert && !matchSpecs) {
            return false;
          }
        }

        // Country filter
        if (filters.selectedCountry !== 'all' && restaurant.country !== filters.selectedCountry) {
          return false;
        }

        // City filter
        if (filters.selectedCity !== 'all' && restaurant.city !== filters.selectedCity) {
          return false;
        }

        // Distance filter
        if (filters.maxDistanceKm > 0 && distanceKm !== undefined && distanceKm > filters.maxDistanceKm) {
          return false;
        }

        // Certification
        if (filters.certification !== 'all' && restaurant.certification !== filters.certification) {
          return false;
        }

        if (filters.only100PercentGlutenFree && restaurant.certification !== '100_gluten_free') {
          return false;
        }

        // Dedicated fryer
        if (filters.onlyDedicatedFryer && !restaurant.safetyChecklist.dedicatedFryer) {
          return false;
        }

        // Cuisine
        if (filters.cuisine !== 'all' && restaurant.cuisine !== filters.cuisine) {
          return false;
        }

        // Price
        if (filters.price !== 'all' && restaurant.priceLevel !== filters.price) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // If distance is available and filter is on or user located, sort by closest
        if (a.distanceKm !== undefined && b.distanceKm !== undefined && filters.maxDistanceKm > 0) {
          return a.distanceKm - b.distanceKm;
        }
        // default: trust score desc, then rating desc
        return b.restaurant.celiacTrustScore - a.restaurant.celiacTrustScore || b.restaurant.rating - a.restaurant.rating;
      });
  }, [restaurants, filters, userLocation]);

  // Handlers
  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCountry: 'all',
      selectedCity: 'all',
      maxDistanceKm: 0,
      certification: 'all',
      cuisine: 'all',
      price: 'all',
      minTrustScore: 0,
      onlyDedicatedFryer: false,
      only100PercentGlutenFree: false,
    });
  };

  const handleToggleFavorite = (id: string) => {
    const updated = StorageService.toggleFavorite(id);
    setFavorites(updated);
  };

  const handleMarkVisited = (id: string) => {
    StorageService.addVisited(id);
    setVisitedHistory(StorageService.getVisitedHistory());
  };

  const handleRemoveVisited = (id: string) => {
    StorageService.removeVisited(id);
    setVisitedHistory(StorageService.getVisitedHistory());
  };

  const handleAddReview = (review: Review) => {
    const updatedRestaurants = StorageService.addReview(review);
    setRestaurants(updatedRestaurants);
    setUserReviews(StorageService.getUserReviews());
    // update currently selected if open
    if (selectedRestaurant?.id === review.restaurantId) {
      const match = updatedRestaurants.find((r) => r.id === review.restaurantId);
      if (match) setSelectedRestaurant(match);
    }
  };

  const handleSaveReminder = (reminder: TripReminder) => {
    const updated = StorageService.saveReminder(reminder);
    setReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = StorageService.deleteReminder(id);
    setReminders(updated);
  };

  const handleToggleAlertSubscription = (city: string) => {
    const list = userPreferences.notificationCities.includes(city)
      ? userPreferences.notificationCities.filter((c) => c !== city)
      : [...userPreferences.notificationCities, city];
    const updated = { ...userPreferences, notificationCities: list };
    setUserPreferences(updated);
    StorageService.saveUserPreferences(updated);
  };

  const handleAddNewAlert = (alert: NewOpeningAlert) => {
    const updated = StorageService.addOpeningAlert(alert);
    setAlerts(updated);
  };

  const handleSavePreferences = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    StorageService.saveUserPreferences(prefs);
  };

  const handleToggleOfflineMode = (offline: boolean) => {
    setIsOfflineMode(offline);
    StorageService.setOfflineSimulated(offline);
  };

  const handleRefreshCache = () => {
    setLastSyncTime(new Date().toISOString());
  };

  const favoriteRestaurants = useMemo(() => {
    return restaurants.filter((r) => favorites.includes(r.id));
  }, [restaurants, favorites]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoritesCount={favorites.length}
        remindersCount={reminders.length}
        newAlertsCount={alerts.length}
        isOfflineMode={isOfflineMode}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Offline Mode Alert Ribbon if active */}
      {isOfflineMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              Modo Offline Activo: Toda la base de datos y la Tarjeta de Viaje están disponibles en tu dispositivo sin usar datos móviles.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* TAB: EXPLORAR */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Editorial Hero Banner for Safe Celiac Travel */}
            <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Guía Gastronómica Sin Gluten Verificada</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Come fuera y viaja con tus amigas y amigos celíacos con total tranquilidad.
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Filtra restaurantes con certificación oficial FACE, freidoras dedicadas y protocolos estrictos de contaminación cruzada. Guarda favoritos, planifica recordatorios de viaje y consulta sin conexión.
                </p>

                {/* Quick Trust Highlights */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <strong>100% Sin Gluten</strong> auditados
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Reseñas con test de síntomas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Modo Offline para viajes
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              onUseCurrentLocation={handleUseCurrentLocation}
              isLocating={isLocating}
              totalResults={filteredRestaurants.length}
            />

            {/* View Mode Switcher (Grid vs Split Map+Cards) */}
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Restaurantes Seguros</span>
                <span className="text-xs font-normal text-slate-500">
                  (Mostrando {filteredRestaurants.length} de {restaurants.length})
                </span>
              </div>

              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl text-xs">
                <button
                  onClick={() => setExploreViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    exploreViewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tarjetas</span>
                </button>

                <button
                  onClick={() => setExploreViewMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    exploreViewMode === 'split'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mapa & Lista</span>
                </button>
              </div>
            </div>

            {/* Grid View */}
            {exploreViewMode === 'grid' && (
              <>
                {filteredRestaurants.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-3">
                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">
                      No hay restaurantes con estos filtros exactos
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Prueba a ampliar el radio de distancia o eliminar filtros de freidora o tipo de cocina.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Restablecer todos los filtros
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRestaurants.map(({ restaurant, distanceKm }) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        distanceKm={distanceKm}
                        isFavorite={favorites.includes(restaurant.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelect={(r) => setSelectedRestaurant(r)}
                        onShare={(r) => setShareRestaurant(r)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Split View (Interactive Map + Scrollable Cards List) */}
            {exploreViewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className="lg:col-span-7 sticky top-20">
                  <InteractiveMap
                    restaurants={filteredRestaurants.map((f) => f.restaurant)}
                    selectedRestaurant={selectedRestaurant}
                    onSelectRestaurant={(r) => setSelectedRestaurant(r)}
                    userLocation={userLocation}
                    centerCoordinates={centerCoordinates}
                  />
                </div>

                <div className="lg:col-span-5 space-y-4 max-h-[750px] overflow-y-auto pr-1">
                  {filteredRestaurants.map(({ restaurant, distanceKm }) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      distanceKm={distanceKm}
                      isFavorite={favorites.includes(restaurant.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelect={(r) => setSelectedRestaurant(r)}
                      onShare={(r) => setShareRestaurant(r)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: MAPA COMPLETO */}
        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Mapa Interactivo de Restaurantes Sin Gluten
                </h2>
                <p className="text-xs text-slate-500">
                  Haz clic en cualquier marcador para ver certificación, especialidades y reseñas verificadas
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUseCurrentLocation}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Centrar en Mi GPS</span>
                </button>
              </div>
            </div>

            <InteractiveMap
              restaurants={filteredRestaurants.map((f) => f.restaurant)}
              selectedRestaurant={selectedRestaurant}
              onSelectRestaurant={(r) => setSelectedRestaurant(r)}
              userLocation={userLocation}
              centerCoordinates={centerCoordinates}
            />

            {/* Quick Strip of places on the map */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {filteredRestaurants.slice(0, 4).map(({ restaurant, distanceKm }) => (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurant(restaurant)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors cursor-pointer text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 truncate">{restaurant.name}</div>
                  <div className="text-slate-500 text-[11px]">{restaurant.city} · {restaurant.cuisine}</div>
                  <div className="text-emerald-700 font-semibold text-[11px]">
                    {restaurant.celiacTrustScore}% confianza {distanceKm !== undefined ? `· ${distanceKm} km` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ALERTAS DE APERTURAS */}
        {activeTab === 'alerts' && (
          <NewOpeningsFeed
            alerts={alerts}
            subscribedCities={userPreferences.notificationCities}
            onToggleSubscription={handleToggleAlertSubscription}
            onAddNewAlert={handleAddNewAlert}
          />
        )}

        {/* TAB: FAVORITOS & VIAJES */}
        {activeTab === 'trips' && (
          <RemindersAndFavorites
            favorites={favoriteRestaurants}
            allRestaurants={restaurants}
            reminders={reminders}
            onRemoveFavorite={handleToggleFavorite}
            onSaveReminder={handleSaveReminder}
            onDeleteReminder={handleDeleteReminder}
            onSelectRestaurant={(r) => setSelectedRestaurant(r)}
            initialSelectedRestaurantForReminder={reminderTargetRestaurant}
          />
        )}

        {/* TAB: MODO OFFLINE */}
        {activeTab === 'offline' && (
          <OfflineManager
            restaurants={restaurants}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={handleToggleOfflineMode}
            lastSyncTime={lastSyncTime}
            onRefreshCache={handleRefreshCache}
            onSelectRestaurant={(r) => setSelectedRestaurant(r)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">GlutenSafe</span>
            <span>· Localizador para celíacos y acompañantes</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            Aviso de salud: Consulta siempre al personal antes de consumir y comunica tu diagnóstico en cocina.
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* Restaurant Detail Modal */}
      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isOpen={Boolean(selectedRestaurant)}
        onClose={() => setSelectedRestaurant(null)}
        isFavorite={selectedRestaurant ? favorites.includes(selectedRestaurant.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onOpenShare={(r) => setShareRestaurant(r)}
        onOpenScheduleReminder={(r) => {
          setReminderTargetRestaurant(r);
          setSelectedRestaurant(null);
          setActiveTab('trips');
        }}
        onAddReview={handleAddReview}
        onMarkVisited={handleMarkVisited}
        isVisited={Boolean(selectedRestaurant && visitedHistory.some((v) => v.restaurantId === selectedRestaurant.id))}
      />

      {/* Share Modal */}
      {shareRestaurant && (
        <ShareModal
          restaurant={shareRestaurant}
          isOpen={Boolean(shareRestaurant)}
          onClose={() => setShareRestaurant(null)}
        />
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        preferences={userPreferences}
        onSavePreferences={handleSavePreferences}
        visitedHistory={visitedHistory}
        allRestaurants={restaurants}
        userReviews={userReviews}
        onRemoveVisited={handleRemoveVisited}
        onSelectRestaurant={(r) => {
          setSelectedRestaurant(r);
          setIsProfileOpen(false);
        }}
      />
    </div>
  );
}
