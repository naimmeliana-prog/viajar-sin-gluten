import { Restaurant, Review, UserPreferences, TripReminder, NewOpeningAlert } from '../types';
import { INITIAL_RESTAURANTS, INITIAL_ALERTS } from '../data/mockRestaurants';

const KEYS = {
  RESTAURANTS: 'glutensafe_restaurants_cache_v5',
  LAST_SYNC: 'glutensafe_last_sync_timestamp',
  FAVORITES: 'glutensafe_user_favorites',
  VISITED: 'glutensafe_user_visited_history',
  USER_PREFERENCES: 'glutensafe_user_preferences',
  USER_REVIEWS: 'glutensafe_user_created_reviews',
  TRIP_REMINDERS: 'glutensafe_trip_reminders',
  OPENING_ALERTS: 'glutensafe_opening_alerts',
  ALERT_SUBSCRIPTIONS: 'glutensafe_alert_subscriptions',
  OFFLINE_MODE_FORCED: 'glutensafe_offline_mode_forced',
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  name: 'María',
  email: 'maria.celiac@example.com',
  celiacCondition: 'Acompañante de persona celíaca',
  favoriteCuisines: ['Pizzería Italiana', 'Tapas & Tradicional', 'Obrador & Desayunos', 'Hamburguesería'],
  pricePreference: ['€', '€€'],
  homeCity: 'Madrid',
  notifyNewOpenings: true,
  notificationCities: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Berlín', 'Roma', 'París', 'Lisboa'],
};

export class StorageService {
  // Restaurants cache
  static getRestaurants(): Restaurant[] {
    try {
      const stored = localStorage.getItem(KEYS.RESTAURANTS);
      if (stored) {
        const cached: Restaurant[] = JSON.parse(stored);
        const initialMap = new Map(INITIAL_RESTAURANTS.map(r => [r.id, r]));

        // Update cached items with latest master data from INITIAL_RESTAURANTS (keeps reviews/user tweaks)
        const updated = cached.map(c => {
          const init = initialMap.get(c.id);
          if (init) {
            return {
              ...init,
              reviews: [...init.reviews, ...c.reviews.filter(cr => !init.reviews.some(ir => ir.id === cr.id))],
            };
          }
          return c;
        });

        const cachedIds = new Set(updated.map(r => r.id));
        const missing = INITIAL_RESTAURANTS.filter(r => !cachedIds.has(r.id));
        const merged = [...updated, ...missing];
        this.saveRestaurants(merged);
        return merged;
      }
    } catch {
      // fallback
    }
    // Initialize with default
    this.saveRestaurants(INITIAL_RESTAURANTS);
    return INITIAL_RESTAURANTS;
  }

  static saveRestaurants(restaurants: Restaurant[]): void {
    try {
      localStorage.setItem(KEYS.RESTAURANTS, JSON.stringify(restaurants));
      localStorage.setItem(KEYS.LAST_SYNC, new Date().toISOString());
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  static getLastSync(): string | null {
    return localStorage.getItem(KEYS.LAST_SYNC);
  }

  // Favorites
  static getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : ['grosso-senza-glutine-madrid', 'sana-locura-madrid'];
    } catch {
      return ['grosso-senza-glutine-madrid', 'sana-locura-madrid'];
    }
  }

  static toggleFavorite(restaurantId: string): string[] {
    const favs = this.getFavorites();
    const next = favs.includes(restaurantId)
      ? favs.filter(id => id !== restaurantId)
      : [...favs, restaurantId];
    try {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(next));
    } catch {}
    return next;
  }

  // Visited History
  static getVisitedHistory(): { restaurantId: string; visitedAt: string }[] {
    try {
      const stored = localStorage.getItem(KEYS.VISITED);
      return stored ? JSON.parse(stored) : [
        { restaurantId: 'grosso-senza-glutine-madrid', visitedAt: '2026-09-28' },
        { restaurantId: 'as-de-bastos-madrid', visitedAt: '2026-08-15' },
      ];
    } catch {
      return [];
    }
  }

  static addVisited(restaurantId: string): void {
    const list = this.getVisitedHistory().filter(item => item.restaurantId !== restaurantId);
    list.unshift({ restaurantId, visitedAt: new Date().toISOString().split('T')[0] });
    try {
      localStorage.setItem(KEYS.VISITED, JSON.stringify(list));
    } catch {}
  }

  static removeVisited(restaurantId: string): void {
    const list = this.getVisitedHistory().filter(item => item.restaurantId !== restaurantId);
    try {
      localStorage.setItem(KEYS.VISITED, JSON.stringify(list));
    } catch {}
  }

  // User Preferences
  static getUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(KEYS.USER_PREFERENCES);
      if (stored) return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_USER_PREFERENCES;
  }

  static saveUserPreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(prefs));
    } catch {}
  }

  // User reviews
  static getUserReviews(): Review[] {
    try {
      const stored = localStorage.getItem(KEYS.USER_REVIEWS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  static addReview(review: Review): Restaurant[] {
    const userReviews = this.getUserReviews();
    userReviews.unshift(review);
    try {
      localStorage.setItem(KEYS.USER_REVIEWS, JSON.stringify(userReviews));
    } catch {}

    // Update restaurant reviews list
    const restaurants = this.getRestaurants();
    const updated = restaurants.map(r => {
      if (r.id === review.restaurantId) {
        const nextReviews = [review, ...r.reviews];
        const newRating = Number((nextReviews.reduce((sum, item) => sum + item.rating, 0) / nextReviews.length).toFixed(1));
        const newTrust = Math.round(
          (nextReviews.filter(item => !item.hadSymptoms && item.celiacConfidenceRating >= 4).length / nextReviews.length) * 100
        );
        return {
          ...r,
          reviews: nextReviews,
          reviewCount: nextReviews.length,
          rating: newRating,
          celiacTrustScore: Math.max(90, newTrust),
        };
      }
      return r;
    });

    this.saveRestaurants(updated);
    return updated;
  }

  // Trip Reminders & Visit planning
  static getReminders(): TripReminder[] {
    try {
      const stored = localStorage.getItem(KEYS.TRIP_REMINDERS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'rem-1',
        restaurantId: 'grosso-senza-glutine-madrid',
        restaurantName: 'Grosso Napoletano Senza Glutine',
        date: '2026-10-18',
        time: '21:00',
        tripTitle: 'Cena de reencuentro con Sofía',
        notes: 'Mesa reservada para 3. Avisar al llegar que Sofía es celíaca estricta.',
        partySize: 3,
      },
      {
        id: 'rem-2',
        restaurantId: 'gula-sana-barcelona',
        restaurantName: 'Gula Sana Gluten Free Café',
        date: '2026-11-06',
        time: '11:00',
        tripTitle: 'Escapada de fin de semana a Barcelona',
        notes: 'Brunch antes de visitar la Sagrada Familia. Probar el gofre sin gluten.',
        partySize: 2,
      }
    ];
  }

  static saveReminder(reminder: TripReminder): TripReminder[] {
    const list = this.getReminders().filter(r => r.id !== reminder.id);
    list.push(reminder);
    // sort by date asc
    list.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    try {
      localStorage.setItem(KEYS.TRIP_REMINDERS, JSON.stringify(list));
    } catch {}
    return list;
  }

  static deleteReminder(id: string): TripReminder[] {
    const list = this.getReminders().filter(r => r.id !== id);
    try {
      localStorage.setItem(KEYS.TRIP_REMINDERS, JSON.stringify(list));
    } catch {}
    return list;
  }

  // Opening Alerts
  static getOpeningAlerts(): NewOpeningAlert[] {
    try {
      const stored = localStorage.getItem(KEYS.OPENING_ALERTS);
      return stored ? JSON.parse(stored) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  }

  static addOpeningAlert(alert: NewOpeningAlert): NewOpeningAlert[] {
    const alerts = this.getOpeningAlerts();
    const next = [alert, ...alerts];
    try {
      localStorage.setItem(KEYS.OPENING_ALERTS, JSON.stringify(next));
    } catch {}
    return next;
  }

  // Offline Simulation Mode
  static isOfflineSimulated(): boolean {
    return localStorage.getItem(KEYS.OFFLINE_MODE_FORCED) === 'true';
  }

  static setOfflineSimulated(val: boolean): void {
    localStorage.setItem(KEYS.OFFLINE_MODE_FORCED, val ? 'true' : 'false');
  }
}
