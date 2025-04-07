"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Calendar, RefreshCw, AlertTriangle, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Import types and service
import { Event as EventType, UserProfile, RecommendedEvent } from "@/services/userMatchingEvents"
import { getRecommendedEvents } from "@/services/userMatchingEvents"
import Sidebar from "@/components/sidebar"
import { User as PrismaUser } from "@prisma/client"

interface UserData {
  id: string
  userProfile: any
  eventPreferences: any
  restrictions: any
  history: any
  idealOutcomes: any[]
  calendarEvents: any[]
  deliverables: any[]
}

interface DashboardEvent extends EventType {
  matchScore?: number;
  matchReasons?: string[];
}

export default function Dashboard() {
  const [user, setUser] = useState<PrismaUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [allEvents, setAllEvents] = useState<EventType[]>([])
  const [recommendedEvents, setRecommendedEvents] = useState<DashboardEvent[]>([])
  const [loadingAllEvents, setLoadingAllEvents] = useState(true)
  const [loadingRecommendedEvents, setLoadingRecommendedEvents] = useState(true)
  const [activeTab, setActiveTab] = useState("profile")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingAllEvents(false);
    }
  };

  // Function to fetch recommended events using the service directly
  const fetchRecommendedEvents = async (userProfile: any) => {
    try {
      if (!userProfile?.userProfile) {
        setRecommendedEvents([]);
        return;
      }
      
      setLoadingRecommendedEvents(true);
      
      const recommendedEvents = await getRecommendedEvents({
        userProfile: {
          name: userProfile.userProfile.name,
          location: userProfile.userProfile.location,
          currentTravelLocation: userProfile.userProfile.currentTravelLocation || "",
          languages: userProfile.userProfile.languages || [],
          personalityTraits: userProfile.userProfile.personalityTraits || [],
          goals: userProfile.userProfile.goals || [],
          hobbiesAndInterests: userProfile.userProfile.hobbiesAndInterests || [],
          additionalInfo: userProfile.userProfile.additionalInfo || "",
          nearestAirport: userProfile.userProfile.nearestAirport || ""
        },
        eventPreferences: {
          categories: userProfile.eventPreferences?.categories || [],
          vibeKeywords: userProfile.eventPreferences?.vibeKeywords || [],
          idealTimeSlots: userProfile.eventPreferences?.idealTimeSlots || [],
          budget: userProfile.eventPreferences?.budget || "",
          preferredGroupType: userProfile.eventPreferences?.preferredGroupType || [],
          preferredEventSize: userProfile.eventPreferences?.preferredEventSize || [],
          maxDistanceKm: userProfile.eventPreferences?.maxDistanceKm || 100,
          preferredExperiences: userProfile.eventPreferences?.preferredExperiences || [],
          preferredDestinations: userProfile.eventPreferences?.preferredDestinations || [],
          seasonalPreferences: userProfile.eventPreferences?.seasonalPreferences || [],
          groupSizePreference: userProfile.eventPreferences?.groupSizePreference || [],
          blockedDates: userProfile.eventPreferences?.blockedDates || [],
          teamBuildingPrefs: userProfile.eventPreferences?.teamBuildingPrefs || {
            preferredActivities: [],
            location: "",
            duration: "",
            suggestions: []
          }
        },
        restrictions: userProfile.restrictions || {},
        calendarAvailability: userProfile.calendarEvents?.reduce((acc: any, event: any) => {
          acc[event.date] = event.status;
          return acc;
        }, {}) || {}
      });
      
      setRecommendedEvents(recommendedEvents);
      
    } catch (error) {
      setRecommendedEvents([]);
      toast({
        title: "Error",
        description: "Failed to fetch recommended events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingRecommendedEvents(false);
    }
  };

  // Function to fetch user profile data
  const fetchUserData = async (userId: string) => {
    try {
      setIsRefreshing(true);
      
      if (typeof window !== 'undefined' && userId) {
        try {
          const response = await fetch(`/api/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              setUserProfile(null);
              toast({
                title: "Profile Not Found",
                description: "You need to complete the registration process first.",
                variant: "destructive",
              });
            } else {
              const errorText = await response.text();
              throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
            }
          } else {
            const data = await response.json();
            
            if (!data.userProfile) {
              setUserProfile(null);
              toast({
                title: "Profile Not Found",
                description: "Your profile data is incomplete. Please complete the registration process.",
                variant: "destructive",
              });
            } else {
              setUserProfile(data);
            }
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch your profile data. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigate to registration
  const goToRegistration = () => {
    router.push('/register');
  }

  // Check if user is logged in and fetch their data
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoadingAllEvents(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const response = await fetch(`/api/user/${session.user.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await response.json();

          if (!userData) {
            console.error('User not found in database');
            return;
          }

          setUser(userData as PrismaUser);
          fetchUserData(userData.id);
          fetchAllEvents();
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoadingAllEvents(false);
      }
    };

    checkUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // Add effect to fetch recommended events when user data changes
  useEffect(() => {
    if (userProfile?.userProfile) {
      fetchRecommendedEvents(userProfile)
    }
  }, [userProfile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleRefresh = () => {
    if (user) {
      fetchUserData(user.id);
      fetchAllEvents();
    }
  }

  if (loadingAllEvents) {
    return (
      <div className="flex">
        <Sidebar 
          isAdmin={userProfile?.userProfile?.role === 'admin'}
          userName={userProfile?.userProfile?.name || 'Usuario'}
          userAvatar={userProfile?.userProfile?.avatar || '/placeholder.svg'}
        />
        <div className="flex-1 ml-[250px]"> {/* Adjust margin to match sidebar width */}
          <div className="container max-w-6xl py-10">
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-indigo-200">Bienvenido de vuelta, {userProfile?.userProfile?.name || 'Usuario'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-indigo-900/50 border border-indigo-500/30">
          <TabsTrigger 
            value="profile" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="recommended" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Star className="mr-2 h-4 w-4" />
            Eventos Recomendados
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Todos los Eventos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          {userProfile?.userProfile ? (
            <>
              <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Información Personal</CardTitle>
                  <CardDescription className="text-indigo-200">Tu información básica de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Nombre</h3>
                      <p className="text-lg text-white">{userProfile.userProfile.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Ubicación</h3>
                      <p className="text-lg text-white">{userProfile.userProfile.location}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Aeropuerto más Cercano</h3>
                      <p className="text-lg text-white">{userProfile.userProfile.nearestAirport || "No especificado"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Idiomas</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userProfile.userProfile.languages?.length > 0 ? 
                          userProfile.userProfile.languages.map((lang: string, i: number) => (
                            <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                              {lang}
                            </span>
                          )) : 
                          <p className="text-indigo-200">No especificado</p>
                        }
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Información Adicional</h3>
                      <p className="text-lg text-white">{userProfile.userProfile.additionalInfo || "No proporcionado"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(userProfile.userProfile.personalityTraits?.length > 0 || 
                userProfile.userProfile.hobbiesAndInterests?.length > 0 || 
                userProfile.userProfile.goals?.length > 0) && (
                <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Personalidad e Intereses</CardTitle>
                    <CardDescription className="text-indigo-200">Tus rasgos, intereses y objetivos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userProfile.userProfile.personalityTraits?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Rasgos de Personalidad</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userProfile.userProfile.personalityTraits.map((trait: string, i: number) => (
                              <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {userProfile.userProfile.hobbiesAndInterests?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Hobbies e Intereses</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userProfile.userProfile.hobbiesAndInterests.map((interest: string, i: number) => (
                              <span key={i} className="bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full text-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {userProfile.userProfile.goals?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Objetivos</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userProfile.userProfile.goals.map((goal: string, i: number) => (
                              <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Event Preferences Section */}
              {userProfile.eventPreferences && (
                <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Preferencias de Eventos</CardTitle>
                    <CardDescription className="text-indigo-200">Tus preferencias para eventos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userProfile.eventPreferences.categories?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Categorías Preferidas</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userProfile.eventPreferences.categories.map((category: string, i: number) => (
                              <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {userProfile.eventPreferences.vibeKeywords?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Palabras Clave de Ambiente</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userProfile.eventPreferences.vibeKeywords.map((keyword: string, i: number) => (
                              <span key={i} className="bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full text-sm">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {userProfile.eventPreferences.seasonalPreferences?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Preferencias Estacionales</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userProfile.eventPreferences.seasonalPreferences.map((season: string, i: number) => (
                              <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                                {season}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {userProfile.eventPreferences.budget && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Presupuesto</h3>
                          <p className="text-lg text-white capitalize">{userProfile.eventPreferences.budget}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Restrictions Section */}
              {userProfile.restrictions && (
                userProfile.restrictions.avoidCrowdedDaytimeConferences ||
                userProfile.restrictions.avoidOverlyFormalNetworking ||
                userProfile.restrictions.avoidFamilyKidsEvents
              ) && (
                <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Restricciones</CardTitle>
                    <CardDescription className="text-indigo-200">Tus restricciones de eventos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {userProfile.restrictions.avoidCrowdedDaytimeConferences && (
                        <div className="flex items-start">
                          <div className="w-1.5 h-1.5 mt-2 mr-2 rounded-full bg-red-500"></div>
                          <div>
                            <h3 className="font-medium text-white">Evitar Conferencias Diurnas Concurridas</h3>
                            <p className="text-sm text-indigo-200">Sí</p>
                          </div>
                        </div>
                      )}
                      {userProfile.restrictions.avoidOverlyFormalNetworking && (
                        <div className="flex items-start">
                          <div className="w-1.5 h-1.5 mt-2 mr-2 rounded-full bg-red-500"></div>
                          <div>
                            <h3 className="font-medium text-white">Evitar Networking Demasiado Formal</h3>
                            <p className="text-sm text-indigo-200">Sí</p>
                          </div>
                        </div>
                      )}
                      {userProfile.restrictions.avoidFamilyKidsEvents && (
                        <div className="flex items-start">
                          <div className="w-1.5 h-1.5 mt-2 mr-2 rounded-full bg-red-500"></div>
                          <div>
                            <h3 className="font-medium text-white">Evitar Eventos Familiares/Infantiles</h3>
                            <p className="text-sm text-indigo-200">Sí</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-white">Perfil Incompleto</CardTitle>
                <CardDescription className="text-indigo-200">Tu información de perfil no está disponible</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-indigo-200">Es posible que necesites completar el proceso de registro.</p>
                <Button 
                  onClick={goToRegistration}
                  className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                >
                  Ir al Registro
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingRecommendedEvents ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : recommendedEvents.length > 0 ? (
              recommendedEvents.map((event) => (
                <Card key={event.id} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">{event.name}</CardTitle>
                    <CardDescription className="text-indigo-200">
                      {event.city}, {event.state || event.country}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-indigo-200">{event.description}</p>
                      
                      {event.matchScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-indigo-200">Puntuación: {event.matchScore}%</span>
                        </div>
                      )}

                      {event.matchReasons && event.matchReasons.length > 0 && (
                        <div className="text-sm text-indigo-300">
                          {event.matchReasons.map((reason, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {event.highlights.map((highlight, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                            {highlight}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {event.activities.map((activity, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                            {activity}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-sm text-indigo-200">
                        <div>
                          <span>Precio: </span>
                          <span className="line-through text-indigo-400">${event.originalPrice?.toLocaleString()} MXN</span>
                          <span className="ml-2 text-white">${event.finalPrice?.toLocaleString()} MXN</span>
                        </div>
                        <div>
                          <span>Participantes: </span>
                          <span className="text-white">{event.maxParticipants}</span>
                        </div>
                      </div>

                      <div className="text-sm text-indigo-200">
                        <div>Fecha: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <AlertTriangle className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">No hay eventos recomendados</h3>
                <p className="text-indigo-200">Completa tu perfil para recibir recomendaciones personalizadas.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingAllEvents ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : allEvents.length > 0 ? (
              allEvents.map((event) => (
                <Card key={event.id} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">{event.name}</CardTitle>
                    <CardDescription className="text-indigo-200">
                      {event.city}, {event.state || event.country}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-indigo-200">{event.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {event.highlights.map((highlight, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                            {highlight}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {event.activities.map((activity, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                            {activity}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-sm text-indigo-200">
                        <div>
                          <span>Precio: </span>
                          <span className="line-through text-indigo-400">${event.originalPrice?.toLocaleString()} MXN</span>
                          <span className="ml-2 text-white">${event.finalPrice?.toLocaleString()} MXN</span>
                        </div>
                        <div>
                          <span>Participantes: </span>
                          <span className="text-white">{event.maxParticipants}</span>
                        </div>
                      </div>

                      <div className="text-sm text-indigo-200">
                        <div>Fecha: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <AlertTriangle className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">No hay eventos disponibles</h3>
                <p className="text-indigo-200">Vuelve más tarde para ver nuevos eventos.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 