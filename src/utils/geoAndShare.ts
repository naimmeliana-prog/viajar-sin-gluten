import { Restaurant, TripReminder } from '../types';

/**
 * Calculates distance in kilometers between two lat/lng coordinates (Haversine formula)
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(1));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Generates share text for social networks
 */
export function generateShareData(restaurant: Restaurant) {
  const title = `🌾 ${restaurant.name} (${restaurant.certificationLabel})`;
  const text = `¡Acabo de encontrar este restaurante sin gluten seguro para celíacos! ${restaurant.name} en ${restaurant.city} (${restaurant.cuisine}). Certificación: ${restaurant.certificationLabel}. Puntuación de confianza celíaca: ${restaurant.celiacTrustScore}%.`;
  const url = window.location.href.split('?')[0] + `?restaurante=${restaurant.id}`;

  return { title, text, url };
}

export function shareToTwitter(restaurant: Restaurant): void {
  const { text, url } = generateShareData(restaurant);
  const tweet = `${text} #SinGluten #GlutenFree #Celiacos #RestauranteSeguro`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export function shareToFacebook(restaurant: Restaurant): void {
  const { url } = generateShareData(restaurant);
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export function shareToWhatsApp(restaurant: Restaurant): void {
  const { text, url } = generateShareData(restaurant);
  const message = `${text}\n\nMira los detalles aquí: ${url}`;
  const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

export async function copyRestaurantLink(restaurant: Restaurant): Promise<boolean> {
  const { url } = generateShareData(restaurant);
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calendar link & ICS generator for reminders
 */
export function generateGoogleCalendarUrl(reminder: TripReminder): string {
  const startDateTime = `${reminder.date.replace(/-/g, '')}T${reminder.time.replace(':', '')}00`;
  // duration 2 hours
  const hour = parseInt(reminder.time.split(':')[0], 10);
  const endHour = (hour + 2) % 24;
  const endDateTime = `${reminder.date.replace(/-/g, '')}T${String(endHour).padStart(2, '0')}${reminder.time.split(':')[1]}00`;
  
  const title = `Comida sin gluten: ${reminder.restaurantName} (${reminder.tripTitle})`;
  const details = `Visita programada a ${reminder.restaurantName}.\nNotas: ${reminder.notes}\nComensales: ${reminder.partySize}`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(details)}`;
}

export function downloadIcsFile(reminder: TripReminder): void {
  const startDateTime = `${reminder.date.replace(/-/g, '')}T${reminder.time.replace(':', '')}00Z`;
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GlutenSafe//ES',
    'BEGIN:VEVENT',
    `SUMMARY:Comida sin gluten en ${reminder.restaurantName}`,
    `DESCRIPTION:${reminder.notes} - Comensales: ${reminder.partySize}`,
    `DTSTART:${startDateTime}`,
    `DTEND:${startDateTime}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `visita-${reminder.restaurantName.toLowerCase().replace(/\s+/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
