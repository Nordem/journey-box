"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface UserProfile {
  name: string;
  location: string;
  currentTravelLocation?: string;
  languages: string[];
  personalityTraits: string[];
  hobbiesAndInterests: string[];
  additionalInfo?: string;
  nearestAirport?: string;
}

interface EventPreferences {
  seasonalPreferences: string[];
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [eventPreferences, setEventPreferences] = useState<EventPreferences | null>(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-indigo-900/50 rounded"></div>
          <div className="h-4 w-64 bg-indigo-900/50 rounded"></div>
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
    <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Perfil</h1>
          <p className="text-indigo-200 text-sm md:text-base">Gestiona tu información personal y preferencias</p>
        </div>
        <Button
          variant="outline"
          className="w-full md:w-auto border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Personal Information Card */}
        <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white">Información Personal</CardTitle>
            <CardDescription className="text-indigo-200">Tu información básica de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Nombre</h3>
                <p className="text-base md:text-lg text-white">{userProfile.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Ubicación</h3>
                <p className="text-base md:text-lg text-white">{userProfile.location}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Aeropuerto más Cercano</h3>
                <p className="text-base md:text-lg text-white">{userProfile.nearestAirport || 'No especificado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Idiomas</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userProfile.languages?.map((language, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Información Adicional</h3>
                <p className="text-base md:text-lg text-white">{userProfile.additionalInfo || 'No especificada'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personality and Interests Card */}
        <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white">Personalidad e Intereses</CardTitle>
            <CardDescription className="text-indigo-200">Tus rasgos, intereses y objetivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Rasgos de Personalidad</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userProfile.personalityTraits?.map((trait, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Hobbies e Intereses</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {userProfile.hobbiesAndInterests?.map((hobby, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Preferences Card */}
        <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white">Preferencias de Eventos</CardTitle>
            <CardDescription className="text-indigo-200">Tus preferencias para eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Preferencias Estacionales</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {eventPreferences?.seasonalPreferences?.map((season, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                      {season}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 