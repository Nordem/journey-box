"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, User, MapPin, Globe, Languages, Heart, Target, Calendar, Star, Info, Tag, Hash, DollarSign, Compass, Users, CalendarX, Users2, Plane, Map, Clock, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfile {
  name: string;
  location: string;
  currentTravelLocation?: string;
  languages: string[];
  personalityTraits: string[];
  hobbiesAndInterests: string[];
  additionalInfo?: string;
  nearestAirport?: string;
  goals: string[];
}

interface EventPreferences {
  seasonalPreferences: string[];
  categories: string[];
  vibeKeywords: string[];
  budget: string;
  preferredExperiences: string[];
  preferredDestinations: string[];
  groupSizePreference: string[];
  blockedDates: string[];
  teamBuildingPrefs: {
    preferredActivities: string[];
    location: "remote" | "in_person" | "both";
    duration: "half_day" | "full_day" | "multi_day";
    suggestions: string;
  };
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [eventPreferences, setEventPreferences] = useState<EventPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user) {
          router.push('/login')
          return
        }

        const response = await fetch(`/api/user/${session.user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        setUserProfile(userData.userProfile)
        setEventPreferences(userData.eventPreferences)
        calculateProfileCompletion(userData.userProfile, userData.eventPreferences)
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch your profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  const calculateProfileCompletion = (profile: UserProfile | null, preferences: EventPreferences | null) => {
    if (!profile || !preferences) return 0

    const totalFields = 10 // Total number of fields to check
    let completedFields = 0

    // Check profile fields
    if (profile.name) completedFields++
    if (profile.location) completedFields++
    if (profile.languages?.length > 0) completedFields++
    if (profile.personalityTraits?.length > 0) completedFields++
    if (profile.hobbiesAndInterests?.length > 0) completedFields++
    if (profile.goals?.length > 0) completedFields++

    // Check preferences fields
    if (preferences.seasonalPreferences?.length > 0) completedFields++
    if (preferences.categories?.length > 0) completedFields++
    if (preferences.preferredExperiences?.length > 0) completedFields++
    if (preferences.groupSizePreference?.length > 0) completedFields++

    setProfileCompletion((completedFields / totalFields) * 100)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Perfil no encontrado</h1>
          <p className="text-indigo-200 text-sm md:text-base">Por favor, completa tu registro primero.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-indigo-950/90 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Mi Perfil</h1>
            <p className="text-indigo-200/80 mt-1">Gestiona tu información personal y preferencias</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-indigo-200/80">Perfil completado</span>
              <Progress value={profileCompletion} className="w-[200px] h-2" />
              <span className="text-sm text-indigo-200/80 mt-1">{Math.round(profileCompletion)}%</span>
            </div>
            <Button 
              variant="outline" 
              className="bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 border-indigo-500/20"
              onClick={() => router.push('/profile/edit')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Travel Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg">
                  <Plane className="h-6 w-6 text-indigo-200" />
                </div>
                <div>
                  <p className="text-sm text-indigo-200/80">Viajes realizados</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Map className="h-6 w-6 text-purple-200" />
                </div>
                <div>
                  <p className="text-sm text-indigo-200/80">Países visitados</p>
                  <p className="text-2xl font-bold text-white">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-500/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-sky-200" />
                </div>
                <div>
                  <p className="text-sm text-indigo-200/80">Experiencias únicas</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-white/5 backdrop-blur-xl border border-white/10">
            <TabsTrigger value="personal" className="data-[state=active]:bg-indigo-500/10">
              <User className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-indigo-500/10">
              <Heart className="h-4 w-4 mr-2" />
              Preferencias
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-indigo-500/10">
              <Calendar className="h-4 w-4 mr-2" />
              Próximos viajes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            {/* Personal Information Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-200 via-sky-200 to-purple-200 bg-clip-text text-transparent">
                  Información Personal
                </CardTitle>
                <CardDescription className="text-indigo-200/80">Tu perfil y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <User className="h-4 w-4" />
                        <h3 className="font-medium">Nombre</h3>
                      </div>
                      <p className="text-lg text-white">{userProfile.name}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <MapPin className="h-4 w-4" />
                        <h3 className="font-medium">Ubicación</h3>
                      </div>
                      <p className="text-lg text-white">{userProfile.location}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Globe className="h-4 w-4" />
                        <h3 className="font-medium">Idiomas</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.languages?.map((language, index) => (
                          <Badge 
                            key={index} 
                            className="bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 transition-colors"
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Heart className="h-4 w-4" />
                        <h3 className="font-medium">Rasgos de Personalidad</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.personalityTraits?.map((trait, index) => (
                          <Badge 
                            key={index} 
                            className="bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Star className="h-4 w-4" />
                        <h3 className="font-medium">Hobbies e Intereses</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.hobbiesAndInterests?.map((hobby, index) => (
                          <Badge 
                            key={index} 
                            className="bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 transition-colors"
                          >
                            {hobby}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Target className="h-4 w-4" />
                        <h3 className="font-medium">Objetivos</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.goals?.map((goal, index) => (
                          <Badge 
                            key={index} 
                            className="bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                          >
                            {goal}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            {/* Event Preferences Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-200 via-sky-200 to-purple-200 bg-clip-text text-transparent">
                  Preferencias de Eventos
                </CardTitle>
                <CardDescription className="text-indigo-200/80">Tus preferencias para eventos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Calendar className="h-4 w-4" />
                        <h3 className="font-medium">Preferencias Estacionales</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventPreferences?.seasonalPreferences?.map((season, index) => (
                          <Badge 
                            key={index} 
                            className="bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 transition-colors"
                          >
                            {season}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Tag className="h-4 w-4" />
                        <h3 className="font-medium">Categorías</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventPreferences?.categories?.map((category, index) => (
                          <Badge 
                            key={index} 
                            className="bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 transition-colors"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <DollarSign className="h-4 w-4" />
                        <h3 className="font-medium">Presupuesto</h3>
                      </div>
                      <p className="text-lg text-white">{eventPreferences?.budget}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Compass className="h-4 w-4" />
                        <h3 className="font-medium">Experiencias Preferidas</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventPreferences?.preferredExperiences?.map((experience, index) => (
                          <Badge 
                            key={index} 
                            className="bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                          >
                            {experience}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <Users className="h-4 w-4" />
                        <h3 className="font-medium">Preferencia de Tamaño de Grupo</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventPreferences?.groupSizePreference?.map((size, index) => (
                          <Badge 
                            key={index} 
                            className="bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 transition-colors"
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-200">
                        <CalendarX className="h-4 w-4" />
                        <h3 className="font-medium">Fechas Bloqueadas</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {eventPreferences?.blockedDates?.map((date, index) => (
                          <Badge 
                            key={index} 
                            className="bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                          >
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            {/* Upcoming Trips Card */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-indigo-200 via-sky-200 to-purple-200 bg-clip-text text-transparent">
                  Próximos Viajes
                </CardTitle>
                <CardDescription className="text-indigo-200/80">Tus próximas aventuras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-lg">
                        <Plane className="h-6 w-6 text-indigo-200" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Barcelona, España</h3>
                        <p className="text-sm text-indigo-200/80">15-20 de Mayo, 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-500/10 text-indigo-200">Confirmado</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-purple-500/5 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        <Plane className="h-6 w-6 text-purple-200" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">París, Francia</h3>
                        <p className="text-sm text-indigo-200/80">10-15 de Julio, 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-200">Pendiente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 