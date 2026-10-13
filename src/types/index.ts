export type CertificationType = '100_gluten_free' | 'face_certified' | 'audited_protocol' | 'adapted_menu';

export type PriceLevel = '€' | '€€' | '€€€';

export interface SafetyChecklist {
  dedicatedFryer: boolean;       // Freidora exclusiva sin gluten
  sealedBreadBag: boolean;       // Pan en bolsa horneable precintada
  distinctTableware: boolean;    // Vajilla o marcadores de color diferenciados
  draftGlutenFreeBeer: boolean;  // Cerveza sin gluten de grifo o botella sellada
  staffTrainedAnnually: boolean; // Personal con formación demostrada en alérgenos
  allergenProtocolAudited: boolean; // Protocolo de contaminación cruzada auditado
  ownGlutenFreeBakery?: boolean; // Obrador propio sin trazas
}

export interface Review {
  id: string;
  restaurantId: string;
  userName: string;
  userRole: 'Celíaco diagnosticado' | 'Sensible al gluten' | 'Familiar / Amigo' | 'Acompañante de persona celíaca' | 'Especialista en nutrición';
  date: string;
  rating: number; // 1-5
  celiacConfidenceRating: number; // 1-5
  hadSymptoms: boolean; // ¿Tuvo síntomas tras comer?
  staffKnowledgeScore: 1 | 2 | 3 | 4 | 5; // Conocimiento del personal
  fryerConfirmed: boolean;
  comment: string;
  verifiedTicket: boolean; // Reseña con comprobante verificado
  likesCount: number;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  certification: CertificationType;
  certificationLabel: string;
  cuisine: string;
  priceLevel: PriceLevel;
  address: string;
  city: string;
  country: string;
  countryFlag?: string;
  postalCode: string;
  phone: string;
  website?: string;
  lat: number;
  lng: number;
  rating: number;
  celiacTrustScore: number; // Percentage 0-100%
  reviewCount: number;
  imageUrl: string;
  openingHours: string;
  isOpenNow: boolean;
  safetyChecklist: SafetyChecklist;
  specialties: string[];
  reviews: Review[];
  isNewOpening?: boolean;
  openingDate?: string;
}

export interface NewOpeningAlert {
  id: string;
  restaurantName: string;
  city: string;
  country?: string;
  openingDate: string;
  description: string;
  certification: CertificationType;
  cuisine: string;
  address: string;
  lat: number;
  lng: number;
}

export interface TripReminder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  tripTitle: string; // ej. "Viaje a Roma con Laura"
  notes: string;
  partySize: number;
  isNotified?: boolean;
}

export interface UserPreferences {
  name: string;
  email: string;
  celiacCondition: 'Celíaca diagnosticada' | 'Sensibilidad al gluten no celíaca' | 'Acompañante de persona celíaca' | 'Alergia al trigo';
  favoriteCuisines: string[];
  pricePreference: PriceLevel[];
  homeCity: string;
  notifyNewOpenings: boolean;
  notificationCities: string[];
}

export interface FilterState {
  searchQuery: string;
  selectedCountry: string;
  selectedCity: string;
  maxDistanceKm: number; // 0 means all distances
  certification: 'all' | CertificationType;
  cuisine: string;
  price: string;
  minTrustScore: number;
  onlyDedicatedFryer: boolean;
  only100PercentGlutenFree: boolean;
}
