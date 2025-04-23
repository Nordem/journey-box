"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowRight, MapPin, Heart, Share2, Calendar, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Event as EventType, UserProfile } from "@/services/userMatchingEvents"
import { getRecommendedEvents } from "@/services/userMatchingEvents"
import { supabase } from "@/lib/supabase"
import Loading from "@/components/ui/loading"
import { useUserProfile } from "@/lib/context/user-profile-context"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface DashboardEvent extends EventType {
  matchScore?: number;
  matchReasons?: string[];
}

export default function DiscoverPage() {
  const [allEvents, setAllEvents] = useState<EventType[]>([])
  const [recommendedEvents, setRecommendedEvents] = useState<DashboardEvent[]>([])
  const [loadingAllEvents, setLoadingAllEvents] = useState(true)
  const [loadingRecommendedEvents, setLoadingRecommendedEvents] = useState(true)
  const { userProfile } = useUserProfile()
  const { toast } = useToast()
  const router = useRouter()

  // Function to fetch all events
  const fetchAllEvents = async () => {
    try {
      setLoadingAllEvents(true);
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      setAllEvents(data.events);

      // Store the current events count in session storage
      const currentCount = data.events.length;
      const cachedCount = sessionStorage.getItem('eventsCount');

      // If counts differ or no cached count exists, update the cache
      if (cachedCount === null || parseInt(cachedCount) !== currentCount) {
        sessionStorage.setItem('eventsCount', currentCount.toString());
        return true; // Indicate that events count has changed
      }

      return false; // Indicate that events count has not changed
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again later.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoadingAllEvents(false);
    }
  };

  // Function to fetch user profile data
  const fetchUserData = async (userId: string, forceRefresh: boolean = false) => {
    try {
      setLoadingRecommendedEvents(true);
      const response = await fetch(`/api/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Profile Not Found",
            description: "You need to complete the registration process first.",
            variant: "destructive",
          });
          router.push('/register');
        } else {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }
      } else {
        const data = await response.json();

        if (!data.userProfile) {
          toast({
            title: "Profile Not Found",
            description: "Your profile data is incomplete. Please complete the registration process.",
            variant: "destructive",
          });
          router.push('/register');
        } else {
          // Check if events count has changed
          const eventsCountChanged = await fetchAllEvents();

          // Get cached recommendations
          const cachedResponse = sessionStorage.getItem('lastRecommendedEvents');

          if (!forceRefresh && !eventsCountChanged && cachedResponse) {
            // Use cached response if events count hasn't changed
            setRecommendedEvents(JSON.parse(cachedResponse));
          } else {
            // Fetch new recommendations
            const recommendedEvents = await getRecommendedEvents({
              userProfile: {
                name: data.userProfile.name,
                location: data.userProfile.location,
                currentTravelLocation: data.userProfile.currentTravelLocation || "",
                languages: data.userProfile.languages || [],
                personalityTraits: data.userProfile.personalityTraits || [],
                goals: data.userProfile.goals || [],
                hobbiesAndInterests: data.userProfile.hobbiesAndInterests || [],
                additionalInfo: data.userProfile.additionalInfo || "",
                nearestAirport: data.userProfile.nearestAirport || ""
              },
              eventPreferences: {
                categories: data.eventPreferences?.categories || [],
                vibeKeywords: data.eventPreferences?.vibeKeywords || [],
                budget: data.eventPreferences?.budget || "",
                preferredExperiences: data.eventPreferences?.preferredExperiences || [],
                preferredDestinations: data.eventPreferences?.preferredDestinations || [],
                seasonalPreferences: data.eventPreferences?.seasonalPreferences || [],
                groupSizePreference: data.eventPreferences?.groupSizePreference || [],
                blockedDates: data.eventPreferences?.blockedDates || [],
                teamBuildingPrefs: data.eventPreferences?.teamBuildingPrefs || {
                  preferredActivities: [],
                  location: "both",
                  duration: "half_day",
                  suggestions: ""
                }
              },
              restrictions: data.restrictions || {},
              calendarAvailability: data.calendarEvents?.reduce((acc: any, event: any) => {
                acc[event.date] = event.status;
                return acc;
              }, {}) || {}
            });

            setRecommendedEvents(recommendedEvents);
            // Cache the new recommendations
            sessionStorage.setItem('lastRecommendedEvents', JSON.stringify(recommendedEvents));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecommendedEvents(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await Promise.all([fetchAllEvents(), fetchUserData(session.user.id)]);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUser();
  }, [router]);

  if (loadingAllEvents) {
    <Loading />
  }

  return (
    <main className="min-h-screen bg-black text-white px-5">
      <div className="container px-4 py-8">
        {/* Title and Subtitle */}
        <div className="mb-8 flex flex-col items-start">
          <h1 className="text-2xl font-bold mb-2">Descubre Tu Próxima Aventura</h1>
          <p className="text-gray-400 max-w-2xl">
            Explora destinos únicos, vive experiencias inolvidables y crea recuerdos que durarán toda la vida.
          </p>
        </div>

        {/* Recommended Events Section */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Recomendado para ti, {userProfile?.name?.split(" ")[0].trim()}
            </span>
            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          </h2>

          {loadingRecommendedEvents ? (
            <Loading />
          ) : recommendedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEvents.map((event, index) => (
                <div key={index} className="relative">
                  <div className="rounded-xl overflow-hidden bg-gradient-to-b from-indigo-900/30 to-purple-900/30 border border-indigo-500/30">
                    <div className="relative h-48 w-full">
                      <Image src={event.imageUrl || "/placeholder.svg"} alt={event.name} fill className="object-cover" />

                      {/* Match score indicator */}
                      {event.matchScore && (
                        <div className="absolute bottom-2 right-24 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-white/20 shadow-lg z-10">
                          <span className="text-yellow-300 font-bold">{event.matchScore}% </span>
                          <span>de afinidad</span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <MapPin size={12} className="text-indigo-300" />
                        <span>{event.location || "Sin ubicación"}</span>
                      </div>

                      {/* Action buttons (favorite and share) */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                        >
                          <Heart
                            size={18}
                            className="text-white"
                          />
                        </button>
                        <button
                          className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
                        >
                          <Share2 size={18} className="text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold">{event.name}</h3>
                        <div className="text-indigo-300 font-bold text-sm">
                          ${(event.finalPrice || 0).toLocaleString("es-MX")} MXN
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-sm mb-3">
                        {(event.startDate && event.endDate) && (
                          <div className="flex items-center text-gray-300">
                            <Calendar size={14} className="mr-1 text-indigo-400" />
                            <span>
                              {(() => {
                                const startDate = new Date(event.startDate);
                                const endDate = new Date(event.endDate);

                                // Months in Spanish
                                const months = [
                                  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                                ];

                                // Format: if same month, show "20-25 Noviembre, 2024"
                                if (startDate.getMonth() === endDate.getMonth() &&
                                  startDate.getFullYear() === endDate.getFullYear()) {
                                  return `${startDate.getDate()} - ${endDate.getDate()} ${months[startDate.getMonth()]}, ${startDate.getFullYear()}`;
                                }
                                // Format: if different months, show "30 Abril - 3 Mayo, 2024"
                                else {
                                  const sameYear = startDate.getFullYear() === endDate.getFullYear();
                                  return `${startDate.getDate()} ${months[startDate.getMonth()]}${sameYear ? '' : ', ' + startDate.getFullYear()} - ${endDate.getDate()} ${months[endDate.getMonth()]}, ${endDate.getFullYear()}`;
                                }
                              })()}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center text-xs gap-1 mb-1">
                          <span className="text-gray-300">Disponibilidad:</span>
                          <div className="relative w-24 h-2 bg-indigo-900/50 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                              style={{ width: `${((event.maxParticipants - (event.maxParticipants || 0)) / event.maxParticipants) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-gray-300">{event.maxParticipants} lugares</span>
                        </div>

                          <div className="flex items-center text-gray-300 text-xs">
                            <User size={12} className="mr-1 text-indigo-400" />
                            <span>Responsable: {event.tripManager || 'Pendiente de asignar'}</span>
                          </div>
                      </div>

                      {/* <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-indigo-500/30 hover:bg-indigo-500/20 text-white"
                        >
                          Detalles
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          Reservar
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {/* Encabezado más compacto */}
              <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-6">
                {/* Icono más pequeño y simple */}
                <div className="relative w-14 h-14 mb-4">
                  <div className="absolute inset-0 bg-violet-600/30 rounded-full blur-md"></div>
                  <div className="relative w-full h-full rounded-full bg-violet-600 flex items-center justify-center">
                    <Search size={20} className="text-white" strokeWidth={2} />
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">No encontramos coincidencias con IA</h1>

                <p className="text-gray-400 text-sm mb-4">
                  Actualmente no tenemos destinos que coincidan con tus preferencias según nuestro análisis de IA. Estamos
                  trabajando para ampliar nuestras opciones.
                </p>

                {/* Sección de ajuste de preferencias más compacta y expandida horizontalmente en desktop */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 w-full mt-2 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-start md:items-center gap-3 md:flex-1">
                      <div className="flex-shrink-0 bg-violet-600/20 p-3 rounded-full">
                        <Filter size={20} className="text-violet-400" />
                      </div>

                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold mb-1 md:mb-0.5">Ajusta tus preferencias de viaje</h3>
                        <p className="text-gray-400 text-sm">
                          Personaliza tus preferencias para que podamos encontrar destinos que se adapten mejor a tus gustos e
                          intereses.
                        </p>
                      </div>
                    </div>

                    <div className="ml-10 mt-3 md:mt-0 md:ml-4 md:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-violet-500/30 hover:bg-violet-500/20 text-white w-full md:w-auto"
                        onClick={() => router.push("/profile")}
                      >
                        Ir a preferencias <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-800 my-6" />
            </div>
          )}
        </div>

        {/* All Events Section */}
        <div className="mb-12">
          <h2 className="text-lg font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              Explora Más Destinos
            </span>
          </h2>

          {loadingAllEvents ? (
            <Loading />
          ) : allEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.map((event, index) => (
                <div key={index} className="relative">
                  <div className="rounded-xl overflow-hidden bg-gradient-to-b from-amber-900/30 to-orange-900/30 border border-amber-500/30">
                    <div className="relative h-48 w-full">
                      <Image src={event.imageUrl || "/placeholder.svg"} alt={event.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                        <MapPin size={12} className="text-amber-300" />
                        <span>{event.location || "Sin ubicación"}</span>
                      </div>

                      {/* Action buttons (favorite and share) */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors">
                          <Heart size={18} className="text-white" />
                        </button>
                        <button className="p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors">
                          <Share2 size={18} className="text-white" />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold">{event.name}</h3>
                        <div className="text-amber-300 font-bold text-sm">
                          ${(event.finalPrice || 0).toLocaleString("es-MX")} MXN
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-sm mb-3">
                        {(event.startDate && event.endDate) && (
                          <div className="flex items-center text-gray-300">
                            <Calendar size={14} className="mr-1 text-amber-400" />
                            <span>
                              {(() => {
                                const startDate = new Date(event.startDate);
                                const endDate = new Date(event.endDate);

                                // Months in Spanish
                                const months = [
                                  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                                  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                                ];

                                // Format: if same month, show "20-25 Noviembre, 2024"
                                if (startDate.getMonth() === endDate.getMonth() &&
                                  startDate.getFullYear() === endDate.getFullYear()) {
                                  return `${startDate.getDate()} - ${endDate.getDate()} ${months[startDate.getMonth()]}, ${startDate.getFullYear()}`;
                                }
                                // Format: if different months, show "30 Abril - 3 Mayo, 2024"
                                else {
                                  const sameYear = startDate.getFullYear() === endDate.getFullYear();
                                  return `${startDate.getDate()} ${months[startDate.getMonth()]}${sameYear ? '' : ', ' + startDate.getFullYear()} - ${endDate.getDate()} ${months[endDate.getMonth()]}, ${endDate.getFullYear()}`;
                                }
                              })()}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center text-xs gap-1 mb-1">
                          <span className="text-gray-300">Disponibilidad:</span>
                          <div className="relative w-24 h-2 bg-amber-900/50 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
                              style={{ width: `${((event.maxParticipants - (event.maxParticipants || 0)) / event.maxParticipants) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-medium text-gray-300">{event.maxParticipants} lugares</span>
                        </div>

                        <div className="flex items-center text-gray-300 text-xs">
                          <User size={12} className="mr-1 text-amber-400" />
                          <span>Responsable: {event.tripManager || 'Pendiente de asignar'}</span>
                        </div>
                      </div>

                      {/* <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-amber-500/30 hover:bg-amber-500/20 text-white"
                        >
                          Detalles
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        >
                          Reservar
                        </Button>
                      </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay eventos disponibles.</p>
          )}
        </div>
      </div>
    </main>
  )
} 