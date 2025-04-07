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
              idealTimeSlots: data.eventPreferences?.idealTimeSlots || [],
              budget: data.eventPreferences?.budget || "",
              preferredGroupType: data.eventPreferences?.preferredGroupType || [],
              preferredEventSize: data.eventPreferences?.preferredEventSize || [],
              maxDistanceKm: data.eventPreferences?.maxDistanceKm || 100,
              preferredExperiences: data.eventPreferences?.preferredExperiences || [],
              preferredDestinations: data.eventPreferences?.preferredDestinations || [],
              seasonalPreferences: data.eventPreferences?.seasonalPreferences || [],
              groupSizePreference: data.eventPreferences?.groupSizePreference || [],
              blockedDates: data.eventPreferences?.blockedDates || [],
              teamBuildingPrefs: data.eventPreferences?.teamBuildingPrefs || {
                preferredActivities: [],
                location: "",
                duration: "",
                suggestions: []
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
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Descubrir Viajes</h1>
          <p className="text-indigo-200">Explora eventos recomendados y disponibles</p>
        </div>
        <Button
          variant="outline"
          className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      <Tabs defaultValue="recommended" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommended" className="data-[state=active]:bg-indigo-600/40">
            <Star className="mr-2 h-4 w-4" />
            Recomendados
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-indigo-600/40">
            <Calendar className="mr-2 h-4 w-4" />
            Todos los Eventos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recommended" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendedEvents.map((event, index) => (
              <Card key={index} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-white">{event.name}</CardTitle>
                  <CardDescription className="text-indigo-200">{event.description}</CardDescription>
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-indigo-200">Coincidencia</span>
                        <span className="text-white font-medium">{event.matchScore}%</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4 border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30">
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allEvents.map((event, index) => (
              <Card key={index} className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
                <CardHeader>
                  <CardTitle className="text-white">{event.name}</CardTitle>
                  <CardDescription className="text-indigo-200">{event.description}</CardDescription>
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
                  <Button className="w-full mt-4 border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30">
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