"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, User, MapPin, Globe, Languages, Heart, Target, Calendar, Star, Info, Tag, Hash, DollarSign, Compass, Users, CalendarX, Users2, Plane, Map, Clock, Trophy, Edit2, Camera, LogOut, Award, Building, Sun, Snowflake, Flower, Leaf } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton"

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

// Add these utility functions before the ProfilePage component
const getExperienceIcon = (level: string) => {
  switch (level) {
    case 'Beginner': return <Star className="h-4 w-4" />
    case 'Intermediate': return <Trophy className="h-4 w-4" />
    case 'Advanced': return <Award className="h-4 w-4" />
    default: return <Star className="h-4 w-4" />
  }
}

const getDestinationIcon = (type: string) => {
  switch (type) {
    case 'Beach': return <Map className="h-4 w-4" />
    case 'Mountain': return <Compass className="h-4 w-4" />
    case 'City': return <Building className="h-4 w-4" />
    default: return <Map className="h-4 w-4" />
  }
}

const getSeasonIcon = (season: string) => {
  switch (season) {
    case 'Summer': return <Sun className="h-4 w-4" />
    case 'Winter': return <Snowflake className="h-4 w-4" />
    case 'Spring': return <Flower className="h-4 w-4" />
    case 'Autumn': return <Leaf className="h-4 w-4" />
    default: return <Calendar className="h-4 w-4" />
  }
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
    <main className="min-h-screen bg-black text-white">
      <div className="container px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Mi Perfil
        </h1>

        {loading ? (
          <ProfileSkeleton />
        ) : !userProfile ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">No se pudo cargar la información del perfil</p>
            <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700">
              Intentar nuevamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Información principal */}
            <div className="lg:col-span-1 space-y-6">
              {/* Tarjeta de perfil */}
              <Card className="bg-indigo-950/30 border border-indigo-500/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <Avatar
                        className="h-24 w-24 border-2 border-indigo-500/50 cursor-pointer transition-all hover:scale-105 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20"
                        onClick={() => router.push('/profile/edit')}
                      >
                        <AvatarImage src="https://v0.blob.com/GnJpJbRaP.jpeg" alt={userProfile.name} />
                        <AvatarFallback className="bg-indigo-950 text-indigo-200 text-2xl">
                          {userProfile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40 opacity-0 hover:opacity-100 transition-opacity rounded-full">
                        <Edit2 className="h-8 w-8 text-white" />
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-950 border border-indigo-500/50"
                      >
                        <Camera size={14} />
                      </Button>
                    </div>

                    <h2 className="mt-4 text-xl font-bold">{userProfile.name}</h2>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-16 h-16 text-right">
                        <CircularProgressbar
                          value={profileCompletion}
                          text={`${Math.round(profileCompletion)}%`}
                          styles={buildStyles({
                            rotation: 0,
                            strokeLinecap: "round",
                            textSize: "24px",
                            pathTransitionDuration: 0.5,
                            pathColor: `rgba(129, 140, 248, ${profileCompletion / 100})`,
                            textColor: "#8b5cf6",
                            trailColor: "rgba(99, 102, 241, 0.1)",
                            backgroundColor: "#3e3e3e"
                          })}
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-indigo-400">Perfil completado</p>
                        {profileCompletion < 100 && (
                          <Button
                            variant="link"
                            className="text-xs p-0 h-auto text-indigo-300 hover:text-indigo-200"
                            onClick={() => router.push('/profile/edit')}
                          >
                            ¡Complétalo!
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-400">Edita tus datos en las pestañas de la derecha</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta de estadísticas */}
              <Card className="bg-indigo-950/30 border border-indigo-500/30">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="mr-2 h-5 w-5 text-indigo-400" />
                    Nivel de viajero
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Nivel de viajero</span>
                      <span className="text-sm text-indigo-300">Plata</span>
                    </div>
                    <Progress
                      value={45}
                      className="h-3 bg-indigo-950/50 rounded-full"
                      style={{
                        backgroundColor: 'rgb(31, 41, 55)',
                        '--progress-indicator-color': 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))'
                      } as React.CSSProperties}
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Bronce</span>
                      <span>Plata</span>
                      <span>Oro</span>
                      <span>Platino</span>
                    </div>
                    <div className="mt-2 p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="flex items-center mb-1">
                        <Info className="h-3 w-3 text-indigo-400 mr-1" />
                        <span className="text-xs text-indigo-300 font-medium">¿Cómo se calcula mi nivel?</span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1">
                        <p>
                          <span className="text-gray-300">Bronce:</span> 1-3 viajes completados
                        </p>
                        <p>
                          <span className="text-gray-300">Plata:</span> 4-8 viajes completados
                        </p>
                        <p>
                          <span className="text-gray-300">Oro:</span> 9-15 viajes completados
                        </p>
                        <p>
                          <span className="text-gray-300">Platino:</span> Más de 15 viajes completados
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas de viaje */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Viajes Arkus</div>
                      <div className="text-lg font-bold">3</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Viajes Totales</div>
                      <div className="text-lg font-bold">12</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Días de viaje</div>
                      <div className="text-lg font-bold">45</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Países visitados</div>
                      <div className="text-lg font-bold">3</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botón de cerrar sesión */}
              <Button
                variant="outline"
                className="w-full border-red-500/30 bg-red-950/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 justify-start"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut size={16} className="mr-2" /> Cerrar sesión
              </Button>
            </div>

            {/* Columna derecha - Contenido principal */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent border border-indigo-500/30 rounded-xl overflow-hidden">
                  <TabsTrigger
                    value="personal"
                    className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                  >
                    Sobre mí
                  </TabsTrigger>
                  <TabsTrigger
                    value="interests"
                    className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                  >
                    Intereses
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                  >
                    Preferencias
                  </TabsTrigger>
                </TabsList>

                {/* Pestaña Sobre mí */}
                <TabsContent value="personal" className="mt-0">
                  <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4">
                    <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <User className="mr-2 h-5 w-5 text-indigo-400" />
                        Información personal
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                        onClick={() => router.push('/profile/edit')}
                      >
                        <Edit2 size={14} className="mr-2" /> Editar
                      </Button>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-indigo-400 mr-3" />
                          <div>
                            <p className="text-xs text-gray-400">Nombre</p>
                            <p className="text-sm">{userProfile.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-purple-400 mr-3" />
                          <div>
                            <p className="text-xs text-gray-400">Ubicación</p>
                            <p className="text-sm">{userProfile.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-indigo-400 mr-3" />
                          <div>
                            <p className="text-xs text-gray-400">Idiomas</p>
                            <div className="flex flex-wrap gap-1 mt-1">
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
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-950/30 border border-indigo-500/30">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="mr-2 h-5 w-5 text-pink-400" />
                        Rasgos de personalidad
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña Intereses */}
                <TabsContent value="interests" className="mt-0">
                  <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <Star className="mr-2 h-5 w-5 text-indigo-400" />
                        Hobbies e Intereses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
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
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-950/30 border border-indigo-500/30">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <Target className="mr-2 h-5 w-5 text-purple-400" />
                        Objetivos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña Preferencias */}
                <TabsContent value="preferences" className="mt-0">
                  <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Plane className="h-5 w-5 text-indigo-400" />
                      <h2 className="text-lg font-medium">Preferencias de viaje</h2>
                    </div>

                    {/* Experiencias preferidas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Experiencias preferidas</h3>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {eventPreferences?.preferredExperiences?.map((experience, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                              {getExperienceIcon(experience)}
                            </div>
                            <span className="text-xs">{experience}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Destinos preferidos */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Destinos preferidos</h3>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {eventPreferences?.preferredDestinations?.map((destination, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                              {getDestinationIcon(destination)}
                            </div>
                            <span className="text-xs">{destination}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Temporadas preferidas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Temporadas preferidas</h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {eventPreferences?.seasonalPreferences?.map((season, index) => (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                              {getSeasonIcon(season)}
                            </div>
                            <span className="text-xs">{season}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fechas bloqueadas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Fechas bloqueadas</h3>
                      </div>
                      <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-4">
                        <p className="text-xs text-gray-400 mb-2">
                          Fechas en las que no estarás disponible para viajar:
                        </p>
                        {eventPreferences && eventPreferences.blockedDates && eventPreferences.blockedDates.length > 0 && (
                          <div className="space-y-2">
                            {eventPreferences.blockedDates.map((date, index) => (
                              <Badge key={index} variant="secondary" className="mr-2">
                                {new Date(date).toLocaleDateString()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .react-datepicker {
          background-color: rgb(30, 27, 75) !important;
          color: white !important;
          border: 1px solid rgba(99, 102, 241, 0.3) !important;
        }
        
        .react-datepicker__month-container {
          background-color: rgb(30, 27, 75) !important;
        }
        
        .react-datepicker__header {
          background-color: rgb(49, 46, 129) !important;
          border-bottom: 1px solid rgba(99, 102, 241, 0.3) !important;
        }
        
        .react-datepicker__day {
          color: white !important;
        }
        
        .react-datepicker__day:hover {
          background-color: rgba(99, 102, 241, 0.5) !important;
        }
        
        .react-datepicker__day--selected, 
        .react-datepicker__day--keyboard-selected {
          background-color: rgb(99, 102, 241) !important;
          border-radius: 50% !important;
        }
        
        .react-datepicker__day--highlighted {
          background-color: rgba(220, 38, 38, 0.8) !important;
          color: white !important;
          border-radius: 50% !important;
        }
        
        .react-datepicker__day--disabled {
          color: rgba(255, 255, 255, 0.3) !important;
        }
        
        .react-datepicker__navigation-icon::before {
          border-color: rgba(99, 102, 241, 0.8) !important;
        }
        
        .react-datepicker__current-month, 
        .react-datepicker__day-name {
          color: white !important;
        }
      `}</style>
    </main>
  )
} 