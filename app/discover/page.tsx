"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Calendar, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Event as EventType, UserProfile } from "@/services/userMatchingEvents"
import { getRecommendedEvents } from "@/services/userMatchingEvents"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

interface DashboardEvent extends EventType {
  matchScore?: number;
  matchReasons?: string[];
}

export default function DiscoverPage() {
  const [allEvents, setAllEvents] = useState<EventType[]>([])
  const [recommendedEvents, setRecommendedEvents] = useState<DashboardEvent[]>([])
  const [loadingAllEvents, setLoadingAllEvents] = useState(true)
  const [loadingRecommendedEvents, setLoadingRecommendedEvents] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  // Function to fetch user profile data
  const fetchUserData = async (userId: string) => {
    try {
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
          // Fetch recommended events using the user profile data
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await Promise.all([fetchAllEvents(), fetchUserData(session.user.id)]);
    }
    setIsRefreshing(false);
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

  if (loadingAllEvents || loadingRecommendedEvents) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Descubrir Viajes</h1>
          <p className="text-indigo-200 text-sm md:text-base">Explora eventos recomendados y disponibles</p>
        </div>
        <Button
          variant="outline"
          className="w-full md:w-auto border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommended" className="data-[state=active]:bg-indigo-600/40 text-xs md:text-sm">
            <Star className="mr-2 h-4 w-4" />
            Recomendados
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600/40 text-xs md:text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            Todos los Eventos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recommended" className="mt-4 md:mt-6">
          {loadingRecommendedEvents ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500/30"></div>
                <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              </div>
              <p className="text-indigo-200 text-sm animate-pulse">Cargando eventos recomendados...</p>
            </div>
          ) : recommendedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {recommendedEvents.map((event, index) => (
                <Card key={index} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                  <CardHeader>
                    <CardTitle className="text-white text-lg md:text-xl">{event.name}</CardTitle>
                    <CardDescription className="text-indigo-200 text-sm md:text-base">{event.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-indigo-200">Precio</span>
                        <span className="text-white font-medium">${event.finalPrice || event.originalPrice || 0} MXN</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-indigo-200">Participantes</span>
                        <span className="text-white font-medium">{event.maxParticipants || 0}</span>
                      </div>
                      {event.matchScore && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-indigo-200">Coincidencia</span>
                            <span className="text-white font-medium">{event.matchScore}%</span>
                          </div>
                          {event.matchReasons && event.matchReasons.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <span className="text-xs text-indigo-200">Razones de la recomendación:</span>
                              <ul className="list-disc list-inside space-y-1">
                                {event.matchReasons.map((reason, idx) => (
                                  <li key={idx} className="text-xs text-indigo-200/80">{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-indigo-500/25"
                    >
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-indigo-200 text-sm">No hay eventos recomendados disponibles.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="all" className="mt-4 md:mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {allEvents.map((event, index) => (
              <Card key={index} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-white text-lg md:text-xl">{event.name}</CardTitle>
                  <CardDescription className="text-indigo-200 text-sm md:text-base">{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-200">Precio</span>
                      <span className="text-white font-medium">${event.finalPrice || event.originalPrice || 0} MXN</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-indigo-200">Participantes</span>
                      <span className="text-white font-medium">{event.maxParticipants || 0}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-indigo-500/25"
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 