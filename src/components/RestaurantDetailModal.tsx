import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Star,
  Heart,
  Share2,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Globe,
  MapPin,
  Flame,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';
import { Restaurant, Review } from '../types';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenShare: (restaurant: Restaurant) => void;
  onOpenScheduleReminder: (restaurant: Restaurant) => void;
  onAddReview: (review: Review) => void;
  onMarkVisited: (restaurantId: string) => void;
  isVisited: boolean;
}

export const RestaurantDetailModal: React.FC<RestaurantDetailModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenShare,
  onOpenScheduleReminder,
  onAddReview,
  onMarkVisited,
  isVisited,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'addReview'>('info');

  // Review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newConfidence, setNewConfidence] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [hadSymptoms, setHadSymptoms] = useState<boolean>(false);
  const [fryerConfirmed, setFryerConfirmed] = useState<boolean>(true);
  const [staffKnowledge, setStaffKnowledge] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [verifiedTicket, setVerifiedTicket] = useState<boolean>(true);
  const [authorName, setAuthorName] = useState<string>('María (Celíaca)');
  const [authorRole, setAuthorRole] = useState<Review['userRole']>('Celíaco diagnosticado');
  const [reviewSubmittedMessage, setReviewSubmittedMessage] = useState(false);

  if (!isOpen || !restaurant) return null;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const review: Review = {
      id: `rev-user-${Date.now()}`,
      restaurantId: restaurant.id,
      userName: authorName,
      userRole: authorRole,
      date: new Date().toISOString().split('T')[0],
      rating: newRating,
      celiacConfidenceRating: newConfidence,
      hadSymptoms,
      staffKnowledgeScore: staffKnowledge,
      fryerConfirmed,
      comment: newComment,
      verifiedTicket,
      likesCount: 1,
    };

    onAddReview(review);
    setReviewSubmittedMessage(true);
    setTimeout(() => {
      setReviewSubmittedMessage(false);
      setActiveTab('reviews');
      setNewComment('');
    }, 1500);
  };

  const is100GlutenFree = restaurant.certification === '100_gluten_free';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col relative">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Header with Image */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 bg-slate-900">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />

          {/* Header Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-600/90 text-white flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {restaurant.certificationLabel}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {restaurant.cuisine} · {restaurant.city} {restaurant.countryFlag || ''} · {restaurant.priceLevel}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-1">
              {restaurant.name}
            </h2>

            <p className="text-xs text-slate-200 line-clamp-1 mt-0.5">
              {restaurant.tagline}
            </p>
          </div>
        </div>

        {/* Interactive Action Bar */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-2 overflow-x-auto">
          {/* Tabs */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'info' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Protocolo & Carta
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'reviews' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reseñas Verificadas ({restaurant.reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('addReview')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'addReview' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Escribir Reseña
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(restaurant.id)}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                isFavorite
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Guardar en favoritos"
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => onOpenShare(restaurant)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
              title="Compartir en redes"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenScheduleReminder(restaurant)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Programar Visita</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {activeTab === 'info' && (
            <>
              {/* Celiac Safety Audit Score Panel */}
              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Auditoría de Seguridad Celíaca
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Índice de confianza: <strong className="tabular-nums">{restaurant.celiacTrustScore}%</strong> (basado en {restaurant.reviews.length} revisiones reales)
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onMarkVisited(restaurant.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isVisited
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    {isVisited ? '✓ Ya visitado' : '+ Marcar como visitado'}
                  </button>
                </div>

                {/* Safety Checklist Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/60">
                  <div className="flex items-center gap-2 text-slate-800">
                    {restaurant.safetyChecklist.dedicatedFryer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>Freidora 100% exclusiva sin gluten</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    {restaurant.safetyChecklist.sealedBreadBag ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>Pan servido en bolsa precintada</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    {restaurant.safetyChecklist.distinctTableware ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>Vajilla o banderas diferenciadas</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    {restaurant.safetyChecklist.draftGlutenFreeBeer ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>Cerveza sin gluten de grifo o botella</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    {restaurant.safetyChecklist.staffTrainedAnnually ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>Personal con formación demostrada</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    {restaurant.safetyChecklist.ownGlutenFreeBakery ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span>Obrador / cocina 100% libre de gluten</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">Sobre este establecimiento</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {restaurant.description}
                </p>
              </div>

              {/* Specialties */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Especialidades celíacas destacadas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {restaurant.specialties.map((spec, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location & Contact Info */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800">Dirección</div>
                    <div>{restaurant.address}, {restaurant.postalCode} {restaurant.city} ({restaurant.countryFlag || ''} {restaurant.country})</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800">Horarios</div>
                    <div>{restaurant.openingHours}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800">Teléfono</div>
                    <a href={`tel:${restaurant.phone}`} className="text-emerald-700 hover:underline">
                      {restaurant.phone}
                    </a>
                  </div>
                </div>

                {restaurant.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">Web oficial</div>
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:underline truncate block max-w-[200px]"
                      >
                        {restaurant.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Reseñas de la Comunidad Celíaca
                  </h4>
                  <p className="text-xs text-slate-500">
                    Opiniones verificadas para evaluar protocolos de contaminación cruzada
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('addReview')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
                >
                  + Escribir reseña
                </button>
              </div>

              {restaurant.reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Aún no hay reseñas para este local. ¡Sé el primero en dejar una opinión verificada!
                </div>
              ) : (
                <div className="space-y-3.5">
                  {restaurant.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rev.userName}</span>
                          <span className="text-[11px] text-slate-500">· {rev.userRole}</span>
                          {rev.verifiedTicket && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200/60">
                              ✓ Ticket Verificado
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400">{rev.date}</span>
                      </div>

                      {/* Ratings Breakdown */}
                      <div className="flex items-center gap-4 text-slate-600 text-[11px] py-1 border-y border-slate-100">
                        <div className="flex items-center gap-1 font-semibold text-slate-900">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{rev.rating}/5</span>
                        </div>
                        <div>
                          Freidora exclusiva: <strong>{rev.fryerConfirmed ? 'Sí' : 'No'}</strong>
                        </div>
                        <div>
                          ¿Síntomas?:{' '}
                          <strong className={rev.hadSymptoms ? 'text-rose-600' : 'text-emerald-700'}>
                            {rev.hadSymptoms ? 'Sí tuvo molestias' : '0 síntomas (100% seguro)'}
                          </strong>
                        </div>
                      </div>

                      <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addReview' && (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Añadir Reseña Verificada para {restaurant.name}
                </h4>
                <p className="text-xs text-slate-500">
                  Tus respuestas ayudan a que otras personas celíacas coman con total tranquilidad.
                </p>
              </div>

              {reviewSubmittedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ¡Muchas gracias! Tu reseña verificada ha sido guardada con éxito.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tu Nombre o Alias</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Perfil respecto a celiaquía</label>
                  <select
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Celíaco diagnosticado">Celíaco diagnosticado</option>
                    <option value="Sensible al gluten">Sensible al gluten</option>
                    <option value="Familiar / Amigo">Familiar / Amigo</option>
                    <option value="Especialista en nutrición">Especialista en nutrición</option>
                  </select>
                </div>
              </div>

              {/* Security Questions */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    ¿Tuviste algún síntoma digestivo tras comer?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHadSymptoms(false)}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        !hadSymptoms ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Cero síntomas
                    </button>
                    <button
                      type="button"
                      onClick={() => setHadSymptoms(true)}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        hadSymptoms ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Sí, tuve síntomas
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">
                    ¿Confirmaron freidora exclusiva para fritos?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFryerConfirmed(true)}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        fryerConfirmed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setFryerConfirmed(false)}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        !fryerConfirmed ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      No / No aplican
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">
                    Puntuación de seguridad celíaca (1 a 5)
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewConfidence(star)}
                        className={`p-1.5 rounded ${
                          newConfidence >= star ? 'text-amber-500' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1 text-xs">
                  Tu experiencia detallada (platos pedidos, atención del personal, recomendaciones)
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                  placeholder="Ej: Fuimos a cenar 4 amigos, pedimos pizza sin gluten y croquetas. El camarero avisó de inmediato a cocina, la pizza llegó con vajilla distinta y estuvo exquisita..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedTicket}
                    onChange={(e) => setVerifiedTicket(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Confirmo que estuve físicamente en el local</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Reseña Verificada</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
