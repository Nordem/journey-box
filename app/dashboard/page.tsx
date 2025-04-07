"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Calendar, FileText, Target, RefreshCw, AlertTriangle, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Import types and service
import { Event } from "@/types"
import { getRecommendedEvents } from "@/services/userMatchingEvents"
import Sidebar from "@/components/sidebar"

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

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loadingRecommendedEvents, setLoadingRecommendedEvents] = useState(false)
  const [loadingAllEvents, setLoadingAllEvents] = useState(false)
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
      
      if (data && Array.isArray(data.events)) {
        setAllEvents(data.events);
      } else {
        setAllEvents([]);
      }
    } catch (error) {
      setAllEvents([]);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
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
      setRefreshing(true);
      
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
              setUserData(null);
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
              setUserData(null);
              toast({
                title: "Profile Not Found",
                description: "Your profile data is incomplete. Please complete the registration process.",
                variant: "destructive",
              });
            } else {
              setUserData(data);
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
      setRefreshing(false);
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
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        if (!session.user.email_confirmed_at) {
          toast({
            title: "Email Not Verified",
            description: "Please check your email and verify your account before accessing the dashboard.",
            variant: "destructive",
          })
          return
        }

        setUser(session.user)
        await fetchUserData(session.user.id)
        await fetchAllEvents()
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  // Add effect to fetch recommended events when user data changes
  useEffect(() => {
    if (userData?.userProfile) {
      fetchRecommendedEvents(userData)
    }
  }, [userData])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleRefresh = () => {
    if (user) {
      fetchUserData(user.id)
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <Sidebar 
          isAdmin={userData?.userProfile?.role === 'admin'}
          userName={userData?.userProfile?.name || 'Usuario'}
          userAvatar={userData?.userProfile?.avatar || '/placeholder.svg'}
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
          <p className="text-indigo-200">Bienvenido de vuelta, {userData?.userProfile?.name || 'Usuario'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
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
          {userData?.userProfile ? (
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
                      <p className="text-lg text-white">{userData.userProfile.name}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Ubicación</h3>
                      <p className="text-lg text-white">{userData.userProfile.location}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Ubicación Actual de Viaje</h3>
                      <p className="text-lg text-white">{userData.userProfile.currentTravelLocation || "No especificado"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Aeropuerto más Cercano</h3>
                      <p className="text-lg text-white">{userData.userProfile.nearestAirport || "No especificado"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-indigo-200 mb-1">Idiomas</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {userData.userProfile.languages?.length > 0 ? 
                          userData.userProfile.languages.map((lang: string, i: number) => (
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
                      <p className="text-lg text-white">{userData.userProfile.additionalInfo || "No proporcionado"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {(userData.userProfile.personalityTraits?.length > 0 || 
                userData.userProfile.hobbiesAndInterests?.length > 0 || 
                userData.userProfile.goals?.length > 0) && (
                <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Personalidad e Intereses</CardTitle>
                    <CardDescription className="text-indigo-200">Tus rasgos, intereses y objetivos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userData.userProfile.personalityTraits?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Rasgos de Personalidad</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.userProfile.personalityTraits.map((trait: string, i: number) => (
                              <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {userData.userProfile.hobbiesAndInterests?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Hobbies e Intereses</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.userProfile.hobbiesAndInterests.map((interest: string, i: number) => (
                              <span key={i} className="bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full text-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {userData.userProfile.goals?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Objetivos</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.userProfile.goals.map((goal: string, i: number) => (
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
              {userData.eventPreferences && (
                <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Preferencias de Eventos</CardTitle>
                    <CardDescription className="text-indigo-200">Tus preferencias para eventos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userData.eventPreferences.categories?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Categorías Preferidas</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.eventPreferences.categories.map((category: string, i: number) => (
                              <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {userData.eventPreferences.vibeKeywords?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Palabras Clave de Ambiente</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.eventPreferences.vibeKeywords.map((keyword: string, i: number) => (
                              <span key={i} className="bg-purple-900/50 text-purple-200 px-2 py-1 rounded-full text-sm">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {userData.eventPreferences.seasonalPreferences?.length > 0 && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Preferencias Estacionales</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.eventPreferences.seasonalPreferences.map((season: string, i: number) => (
                              <span key={i} className="bg-indigo-900/50 text-indigo-200 px-2 py-1 rounded-full text-sm">
                                {season}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {userData.eventPreferences.budget && (
                        <div>
                          <h3 className="font-medium text-sm text-indigo-200 mb-1">Presupuesto</h3>
                          <p className="text-lg text-white capitalize">{userData.eventPreferences.budget}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Restrictions Section */}
              {userData.restrictions && (
                userData.restrictions.avoidCrowdedDaytimeConferences ||
                userData.restrictions.avoidOverlyFormalNetworking ||
                userData.restrictions.avoidFamilyKidsEvents
              ) && (
                <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Restricciones</CardTitle>
                    <CardDescription className="text-indigo-200">Tus restricciones de eventos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {userData.restrictions.avoidCrowdedDaytimeConferences && (
                        <div className="flex items-start">
                          <div className="w-1.5 h-1.5 mt-2 mr-2 rounded-full bg-red-500"></div>
                          <div>
                            <h3 className="font-medium text-white">Evitar Conferencias Diurnas Concurridas</h3>
                            <p className="text-sm text-indigo-200">Sí</p>
                          </div>
                        </div>
                      )}
                      {userData.restrictions.avoidOverlyFormalNetworking && (
                        <div className="flex items-start">
                          <div className="w-1.5 h-1.5 mt-2 mr-2 rounded-full bg-red-500"></div>
                          <div>
                            <h3 className="font-medium text-white">Evitar Networking Demasiado Formal</h3>
                            <p className="text-sm text-indigo-200">Sí</p>
                          </div>
                        </div>
                      )}
                      {userData.restrictions.avoidFamilyKidsEvents && (
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
                      {event.location} • {event.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
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
                      {event.location} • {event.date}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {event.music.map((genre, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                            {genre}
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