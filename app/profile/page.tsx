"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, Heart, Calendar, Star, Info, Compass, Users, Plane, Map, Trophy, Edit2, Camera, LogOut, Award, Building, Sun, Snowflake, Flower, Leaf, Plus, X, Save, Tv, Music, Palette, Laptop, BookOpen, Utensils, Flame, Flower2, Scissors, Gamepad2, Music2, Moon, Network, Rocket, Car, Trees, Flag, Paintbrush, Music4, Mountain, Film, LayoutGrid, Search, BarChart, Zap, Activity, Mail, Phone } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CircularProgressbar } from "react-circular-progressbar"
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

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
  email: string;
  phone: string;
}

interface EventPreferences {
  preferredExperiences: string[];
  preferredDestinations: string[];
  seasonalPreferences: string[];
  blockedDates: string[];
  generalAvailability: boolean;
  groupSizePreference: string[];
  categories: string[];
  teamBuildingPrefs?: {
    preferredActivities: string[];
    location: "remote" | "in_person" | "both";
    duration: "half_day" | "full_day" | "multi_day";
    suggestions: string;
  };
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [sessionEmail, setSessionEmail] = useState<string>("")
  const [eventPreferences, setEventPreferences] = useState<EventPreferences>({
    preferredExperiences: [],
    preferredDestinations: [],
    seasonalPreferences: [],
    blockedDates: [],
    generalAvailability: true,
    groupSizePreference: [],
    categories: [],
    teamBuildingPrefs: {
      preferredActivities: [],
      location: "both",
      duration: "half_day",
      suggestions: ""
    }
  })
  const [loading, setLoading] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const [destinations, setDestinations] = useState<any[]>([])

  // Add these state variables at the top of the ProfilePage component
  const [isEditingExperiences, setIsEditingExperiences] = useState(false)
  const [isEditingDestinations, setIsEditingDestinations] = useState(false)
  const [isEditingSeasons, setIsEditingSeasons] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isEditingAvailability, setIsEditingAvailability] = useState(false)
  const [editedExperiences, setEditedExperiences] = useState<string[]>([])
  const [editedDestinations, setEditedDestinations] = useState<string[]>([])
  const [editedSeasons, setEditedSeasons] = useState<string[]>([])
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [travelAvailability, setTravelAvailability] = useState({
    currentYear: true,
    nextYear: true,
    followingYear: true,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<{
    name: string;
    phone: string;
    location: string;
    airport: string;
  }>({
    name: "",
    phone: "",
    location: "",
    airport: ""
  })
  const [isAddingDestination, setIsAddingDestination] = useState(false)
  const [editingDestinationId, setEditingDestinationId] = useState<string | null>(null)
  const [newDestination, setNewDestination] = useState<{
    country: string;
    destination: string;
    isArkusTrip: boolean;
  }>({
    country: "",
    destination: "",
    isArkusTrip: false
  })
  const [isEditingInterests, setIsEditingInterests] = useState(false)
  const [editedInterests, setEditedInterests] = useState<string[]>([])
  const [newInterestInput, setNewInterestInput] = useState("")
  const [isEditingTraits, setIsEditingTraits] = useState(false)
  const [editedTraits, setEditedTraits] = useState<string[]>([])
  const [newTraitInput, setNewTraitInput] = useState("")
  const [newExperienceInput, setNewExperienceInput] = useState("")
  const [newDestinationInput, setNewDestinationInput] = useState("")
  const [customExperiences, setCustomExperiences] = useState<string[]>([]);
  const [customDestinations, setCustomDestinations] = useState<string[]>([]);

  // Add these constants for the preferences options
  const experiencePreferences = [
    { value: "relajación", label: "Relajación", icon: "🧖" },
    { value: "aventura", label: "Aventura", icon: "🧗" },
    { value: "aprendizaje", label: "Aprendizaje", icon: "🎓" },
    { value: "socialización", label: "Socialización", icon: "🗣️" },
    { value: "cultural", label: "Exploración cultural", icon: "🏛️" },
    { value: "gastronomía", label: "Experiencias gastronómicas", icon: "🍽️" },
    { value: "bienestar", label: "Actividades de bienestar", icon: "💆" }
  ]

  const destinationPreferences = [
    { value: "playa", label: "Playa", icon: "🏖️" },
    { value: "montaña", label: "Montaña", icon: "⛰️" },
    { value: "ciudades_históricas", label: "Ciudades históricas", icon: "🏰" },
    { value: "pueblos_magicos", label: "Pueblos Mágicos", icon: "🌾" },
    { value: "parques_temáticos", label: "Parques temáticos", icon: "🎢" },
    { value: "destinos_gastronómicos", label: "Destinos gastronómicos", icon: "🍷" },
    { value: "reservas_naturales", label: "Reservas naturales", icon: "🦁" },
    { value: "sitios_arqueológicos", label: "Sitios arqueológicos", icon: "🗿" },
    { value: "destinos_urbanos", label: "Destinos urbanos modernos", icon: "🏙️" },
  ]

  const travelSeasons = [
    { value: "Summer", label: "Verano", icon: <Sun className="h-4 w-4" /> },
    { value: "Winter", label: "Invierno", icon: <Snowflake className="h-4 w-4" /> },
    { value: "Spring", label: "Primavera", icon: <Flower className="h-4 w-4" /> },
    { value: "Autumn", label: "Otoño", icon: <Leaf className="h-4 w-4" /> },
  ]

  const getExperienceIcon = (value: string) => {
    const experience = experiencePreferences.find(exp => exp.value === value);
    return experience ? experience.icon : "⭐";
  }

  const getDestinationIcon = (value: string) => {
    const destination = destinationPreferences.find(dest => dest.value === value);
    return destination ? destination.icon : "📍";
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

  const getInterestIcon = (interest: string) => {
    switch (interest) {
      case 'Deportes por TV': return <Tv className="h-3 w-3 text-blue-400" />
      case 'Actividades deportivas': return <Trophy className="h-3 w-3 text-yellow-400" />
      case 'Música': return <Music className="h-3 w-3 text-purple-400" />
      case 'Arte': return <Palette className="h-3 w-3 text-pink-400" />
      case 'Tecnología': return <Laptop className="h-3 w-3 text-blue-400" />
      case 'Lectura': return <BookOpen className="h-3 w-3 text-green-400" />
      case 'Cocina': return <Utensils className="h-3 w-3 text-orange-400" />
      case 'Parrilladas al aire libre': return <Flame className="h-3 w-3 text-red-400" />
      case 'Convivencias': return <Users className="h-3 w-3 text-yellow-400" />
      case 'Jardinería': return <Flower2 className="h-3 w-3 text-green-400" />
      case 'Fotografía': return <Camera className="h-3 w-3 text-purple-400" />
      case 'Manualidades': return <Scissors className="h-3 w-3 text-red-400" />
      case 'Videojuegos': return <Gamepad2 className="h-3 w-3 text-indigo-400" />
      case 'Baile': return <Music2 className="h-3 w-3 text-pink-400" />
      case 'Yoga': return <Activity className="h-3 w-3 text-purple-400" />
      case 'Meditación': return <Moon className="h-3 w-3 text-blue-400" />
      case 'Networking': return <Network className="h-3 w-3 text-blue-400" />
      case 'Startups': return <Rocket className="h-3 w-3 text-orange-400" />
      case 'Fórmula 1': return <Car className="h-3 w-3 text-red-400" />
      case 'Naturaleza': return <Trees className="h-3 w-3 text-green-400" />
      case 'Ir al estadio': return <Flag className="h-3 w-3 text-yellow-400" />
      case 'Talleres creativos': return <Paintbrush className="h-3 w-3 text-pink-400" />
      case 'Conciertos': return <Music4 className="h-3 w-3 text-purple-400" />
      case 'Actividades al aire libre': return <Mountain className="h-3 w-3 text-green-400" />
      case 'Cine': return <Film className="h-3 w-3 text-indigo-400" />
      default: return <Heart className="h-3 w-3 text-indigo-400" />
    }
  }

  const getTraitIcon = (trait: string) => {
    switch (trait) {
      case 'Sociable': return <Users className="h-3 w-3 text-yellow-400" />
      case 'Introvertido': return <User className="h-3 w-3 text-orange-400" />
      case 'Creativo': return <Paintbrush className="h-3 w-3 text-pink-400" />
      case 'Estructurado': return <LayoutGrid className="h-3 w-3 text-red-400" />
      case 'Curioso': return <Search className="h-3 w-3 text-blue-400" />
      case 'Aventurero': return <Compass className="h-3 w-3 text-indigo-400" />
      case 'Analítico': return <BarChart className="h-3 w-3 text-purple-400" />
      case 'Energético': return <Zap className="h-3 w-3 text-yellow-400" />
      default: return <User className="h-3 w-3 text-indigo-400" />
    }
  }

  const toggleExperience = (value: string) => {
    setEditedExperiences(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const toggleDestination = (value: string) => {
    setEditedDestinations(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const toggleSeason = (value: string) => {
    setEditedSeasons(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleSaveExperiences = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/user/${session.user.id}/event-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredExperiences: editedExperiences,
          preferredDestinations: eventPreferences?.preferredDestinations || [],
          seasonalPreferences: eventPreferences?.seasonalPreferences || [],
          groupSizePreference: eventPreferences?.groupSizePreference || [],
          blockedDates: eventPreferences?.blockedDates || [],
          teamBuildingPrefs: eventPreferences?.teamBuildingPrefs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save experiences')
      }

      const updatedPreferences = await response.json()
      setEventPreferences(prev => ({
        ...prev,
        preferredExperiences: updatedPreferences.preferredExperiences
      }))
      setIsEditingExperiences(false)

      toast({
        title: "Éxito",
        description: "Tus experiencias preferidas han sido guardadas",
      })
    } catch (error) {
      console.error('Error saving experiences:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar tus experiencias preferidas. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleSaveDestinations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/user/${session.user.id}/event-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredExperiences: eventPreferences?.preferredExperiences || [],
          preferredDestinations: editedDestinations,
          seasonalPreferences: eventPreferences?.seasonalPreferences || [],
          groupSizePreference: eventPreferences?.groupSizePreference || [],
          blockedDates: eventPreferences?.blockedDates || [],
          teamBuildingPrefs: eventPreferences?.teamBuildingPrefs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save destinations')
      }

      const updatedPreferences = await response.json()
      setEventPreferences(prev => ({
        ...prev,
        preferredDestinations: updatedPreferences.preferredDestinations
      }))
      setIsEditingDestinations(false)

      toast({
        title: "Éxito",
        description: "Tus destinos preferidos han sido guardados",
      })
    } catch (error) {
      console.error('Error saving destinations:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar tus destinos preferidos. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleSaveSeasons = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/user/${session.user.id}/event-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredExperiences: eventPreferences?.preferredExperiences || [],
          preferredDestinations: eventPreferences?.preferredDestinations || [],
          seasonalPreferences: editedSeasons,
          groupSizePreference: eventPreferences?.groupSizePreference || [],
          blockedDates: eventPreferences?.blockedDates || [],
          teamBuildingPrefs: eventPreferences?.teamBuildingPrefs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save seasons')
      }

      const updatedPreferences = await response.json()
      setEventPreferences(prev => ({
        ...prev,
        seasonalPreferences: updatedPreferences.seasonalPreferences
      }))
      setIsEditingSeasons(false)

      toast({
        title: "Éxito",
        description: "Tus temporadas preferidas han sido guardadas",
      })
    } catch (error) {
      console.error('Error saving seasons:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar tus temporadas preferidas. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleSaveBlockedDates = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      // Convert Date objects to ISO strings and ensure they're unique
      const blockedDatesISO = [...new Set(blockedDates.map(date => date.toISOString()))]

      const response = await fetch(`/api/user/${session.user.id}/event-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferredExperiences: eventPreferences?.preferredExperiences || [],
          preferredDestinations: eventPreferences?.preferredDestinations || [],
          seasonalPreferences: eventPreferences?.seasonalPreferences || [],
          groupSizePreference: eventPreferences?.groupSizePreference || [],
          blockedDates: blockedDatesISO,
          teamBuildingPrefs: eventPreferences?.teamBuildingPrefs
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save blocked dates')
      }

      const updatedPreferences = await response.json()
      setEventPreferences(prev => ({
        ...prev,
        blockedDates: updatedPreferences.blockedDates
      }))

      // Update the blockedDates state with the saved dates
      const savedBlockedDates = updatedPreferences.blockedDates.map((dateStr: string) => new Date(dateStr))
      setBlockedDates(savedBlockedDates)

      setShowDatePicker(false)

      toast({
        title: "Éxito",
        description: "Tus fechas bloqueadas han sido guardadas",
      })
    } catch (error) {
      console.error('Error saving blocked dates:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar tus fechas bloqueadas. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleSaveAvailability = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('No session found')
      }

      const response = await fetch(`/api/user/${session.user.id}/travel-availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(travelAvailability),
      })

      if (!response.ok) {
        throw new Error('Failed to update travel availability')
      }

      const updatedAvailability = await response.json()
      setTravelAvailability({
        currentYear: updatedAvailability.currentYear,
        nextYear: updatedAvailability.nextYear,
        followingYear: updatedAvailability.followingYear
      })
      setIsEditingAvailability(false)

      toast({
        title: "Éxito",
        description: "Tu disponibilidad ha sido actualizada correctamente",
      })
    } catch (error) {
      console.error('Error saving availability:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar la disponibilidad. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'phone') {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, '')
      // Limit to 10 characters
      const limitedValue = numericValue.slice(0, 10)
      setEditedData(prev => ({
        ...prev,
        [name]: limitedValue
      }))
    } else {
      setEditedData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedData({
      name: userProfile?.name || "",
      phone: userProfile?.phone || "",
      location: userProfile?.location || "",
      airport: userProfile?.nearestAirport || ""
    })
  }

  const handleSaveProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedData.name,
          phone: editedData.phone,
          location: editedData.location,
          nearestAirport: editedData.airport
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const updatedUser = await response.json()
      setUserProfile(updatedUser.userProfile)
      setIsEditing(false)

      toast({
        title: "Éxito",
        description: "Tu perfil ha sido actualizado correctamente",
      })
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleAddDestination = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const method = editingDestinationId ? 'PUT' : 'POST'
      const url = editingDestinationId
        ? `/api/user/${session.user.id}/recent-destinations/${editingDestinationId}`
        : `/api/user/${session.user.id}/recent-destinations`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: newDestination.country,
          destination: newDestination.destination,
          isArkusTrip: newDestination.isArkusTrip
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${editingDestinationId ? 'update' : 'add'} destination`)
      }

      const savedDestination = await response.json()

      // Refresh the destinations list
      const destinationsResponse = await fetch(`/api/user/${session.user.id}/recent-destinations`)
      if (destinationsResponse.ok) {
        const destinations = await destinationsResponse.json()
        setDestinations(destinations)
      }

      setIsAddingDestination(false)
      setEditingDestinationId(null)
      setNewDestination({ country: "", destination: "", isArkusTrip: false })

      toast({
        title: "Éxito",
        description: `El destino ha sido ${editingDestinationId ? 'actualizado' : 'agregado'} correctamente`,
      })
    } catch (error) {
      console.error('Error handling destination:', error)
      toast({
        title: "Error",
        description: `No se pudo ${editingDestinationId ? 'actualizar' : 'agregar'} el destino. Por favor, intenta nuevamente.`,
        variant: "destructive",
      })
    }
  }

  const toggleInterest = (interest: string) => {
    setEditedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    )
  }

  const handleAddCustomInterest = () => {
    if (newInterestInput.trim()) {
      const newInterest = newInterestInput.trim();
      // Add to editedInterests if not already present
      if (!editedInterests.includes(newInterest)) {
        setEditedInterests(prev => [...prev, newInterest]);
        // Update the user profile immediately to reflect the change
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            hobbiesAndInterests: [...(userProfile.hobbiesAndInterests || []), newInterest]
          });
        }
      }
      setNewInterestInput("");
    }
  }

  const handleSaveInterests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hobbiesAndInterests: editedInterests
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update interests')
      }

      const updatedUser = await response.json()
      setUserProfile(updatedUser.userProfile)
      setIsEditingInterests(false)

      toast({
        title: "Éxito",
        description: "Tus intereses han sido actualizados correctamente",
      })
    } catch (error) {
      console.error('Error saving interests:', error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar tus intereses. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const toggleTrait = (trait: string) => {
    setEditedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    )
  }

  const handleAddCustomTrait = () => {
    if (newTraitInput.trim()) {
      const newTrait = newTraitInput.trim();
      // Add to editedTraits if not already present
      if (!editedTraits.includes(newTrait)) {
        setEditedTraits(prev => [...prev, newTrait]);
      }
      setNewTraitInput("");
    }
  }

  const handleSaveTraits = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalityTraits: editedTraits
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update traits')
      }

      const updatedUser = await response.json()
      setUserProfile(updatedUser.userProfile)
      setIsEditingTraits(false)

      toast({
        title: "Éxito",
        description: "Tus rasgos de personalidad han sido actualizados correctamente",
      })
    } catch (error) {
      console.error('Error saving traits:', error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar tus rasgos de personalidad. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleAddCustomExperience = () => {
    if (newExperienceInput.trim()) {
      const newExperience = newExperienceInput.trim();
      // Add to editedExperiences if not already present
      if (!editedExperiences.includes(newExperience)) {
        setEditedExperiences(prev => [...prev, newExperience]);
        setCustomExperiences(prev => [...prev, newExperience]);
      }
      setNewExperienceInput("");
    }
  }

  const handleAddCustomDestination = () => {
    if (newDestinationInput.trim()) {
      const newDestination = newDestinationInput.trim();
      // Add to editedDestinations if not already present
      if (!editedDestinations.includes(newDestination)) {
        setEditedDestinations(prev => [...prev, newDestination]);
        setCustomDestinations(prev => [...prev, newDestination]);
      }
      setNewDestinationInput("");
    }
  }

  const handleDeleteDestination = async (destinationId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/user/${session.user.id}/recent-destinations/${destinationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete destination')
      }

      // Update the local state by removing the deleted destination
      setDestinations(destinations.filter(dest => dest.id !== destinationId))

      toast({
        title: "Éxito",
        description: "El destino ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error('Error deleting destination:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el destino. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  // Add this function with the other handlers
  const handleEditDestination = (destination: any) => {
    setNewDestination({
      country: destination.country,
      destination: destination.destination,
      isArkusTrip: destination.isArkusTrip
    })
    setEditingDestinationId(destination.id)
    setIsAddingDestination(true)
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push('/login')
          return
        }

        setSessionEmail(session.user.email || "")

        // Fetch user profile
        const response = await fetch(`/api/user/${session.user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        setUserProfile(userData.userProfile)
        setEventPreferences(userData.eventPreferences)

        // Convert blocked dates from strings to Date objects
        if (userData.eventPreferences?.blockedDates) {
          const blockedDates = userData.eventPreferences.blockedDates.map((dateStr: string) => new Date(dateStr))
          setBlockedDates(blockedDates)
        }

        // Fetch travel availability
        const availabilityResponse = await fetch(`/api/user/${session.user.id}/travel-availability`)
        if (availabilityResponse.ok) {
          const availabilityData = await availabilityResponse.json()
          setTravelAvailability({
            currentYear: availabilityData.currentYear,
            nextYear: availabilityData.nextYear,
            followingYear: availabilityData.followingYear
          })
        }

        calculateProfileCompletion(userData.userProfile, userData.eventPreferences)

        // Fetch destinations
        const destinationsResponse = await fetch(`/api/user/${session.user.id}/recent-destinations`)
        if (destinationsResponse.ok) {
          const destinationsData = await destinationsResponse.json()
          setDestinations(destinationsData)
        }
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
                      <div className="w-16 h-16 text-center">
                        <CircularProgressbar
                          value={profileCompletion}
                          text={`${Math.round(profileCompletion)}%`}
                          styles={{
                            root: {},
                            path: {
                              stroke: `rgba(129, 140, 248, ${profileCompletion / 100})`,
                              strokeLinecap: "round",
                              transition: "stroke-dashoffset 0.5s ease 0s",
                              transform: "rotate(0turn)",
                              transformOrigin: "center center"
                            },
                            trail: {
                              stroke: "rgba(99, 102, 241, 0.1)",
                              strokeLinecap: "round",
                              transform: "rotate(0turn)",
                              transformOrigin: "center center"
                            },
                            text: {
                              fill: "#8b5cf6",
                              fontSize: "24px",
                              dominantBaseline: "middle",
                              textAnchor: "middle"
                            },
                            background: {
                              fill: "#3e3e3e"
                            }
                          }}
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
                    <div className="flex justify-between mb-4">
                      <span className="text-sm text-gray-400">Nivel de viajero</span>
                      <span className="text-sm text-indigo-300">
                        {destinations.length <= 3 ? 'Bronce' :
                          destinations.length <= 8 ? 'Plata' :
                            destinations.length <= 15 ? 'Oro' : 'Platino'}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={
                          destinations.length <= 3 ? (destinations.length / 3) * 25 :
                            destinations.length <= 8 ? 25 + ((destinations.length - 3) / 5) * 25 :
                              destinations.length <= 15 ? 50 + ((destinations.length - 8) / 7) * 25 :
                                100
                        }
                        className="h-3 bg-indigo-950/50 rounded-full"
                        style={{
                          backgroundColor: 'rgb(31, 41, 55)',
                          '--progress-indicator-color': 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))'
                        } as React.CSSProperties}
                      />
                      {/* Milestone markers */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <div className="absolute" style={{ left: '25%' }}>
                          <div className="w-1 h-3 bg-indigo-400 rounded-full" />
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-indigo-300"></div>
                        </div>
                        <div className="absolute" style={{ left: '50%' }}>
                          <div className="w-1 h-3 bg-indigo-400 rounded-full" />
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-indigo-300"></div>
                        </div>
                        <div className="absolute" style={{ left: '75%' }}>
                          <div className="w-1 h-3 bg-indigo-400 rounded-full" />
                          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] text-indigo-300"></div>
                        </div>
                      </div>
                    </div>
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
                      <div className="text-lg font-bold">{destinations.filter(dest => dest.isArkusTrip).length}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Viajes Totales</div>
                      <div className="text-lg font-bold">{destinations.length}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Países visitados</div>
                      <div className="text-lg font-bold">{new Set(destinations.map(dest => dest.country.toLowerCase())).size}</div>
                    </div>
                  </div>

                  {/* <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border border-indigo-500/30 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Próximo viaje</div>
                        <div className="text-sm font-medium text-white mt-1">No hay viajes programados</div>
                      </div>
                      <div className="bg-indigo-600/30 p-1.5 rounded-full">
                        <Plane className="h-4 w-4 text-indigo-300" />
                      </div>
                    </div>
                  </div> */}
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
                <TabsList className="grid w-full grid-cols-3 bg-transparent border border-indigo-500/30 rounded-xl overflow-hidden pl-0 pr-0">
                  <TabsTrigger
                    value="personal"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-l-xl h-full"
                  >
                    Sobre mí
                  </TabsTrigger>
                  <TabsTrigger
                    value="interests"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none h-full"
                  >
                    Intereses
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-r-lg h-full"
                  >
                    Preferencias
                  </TabsTrigger>
                </TabsList>

                {/* Pestaña Sobre mí */}
                <TabsContent value="personal" className="mt-5">
                  {isEditing ? (
                    <div className="space-y-6">
                      <Card className="bg-indigo-950/30 border border-indigo-500/30">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-lg flex items-center">
                            <Edit2 className="mr-2 h-5 w-5 text-indigo-400" />
                            Editar información personal
                          </CardTitle>
                          <CardDescription>Actualiza tu información básica</CardDescription>
                        </CardHeader>
                        <CardContent className="py-3 px-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Nombre completo</Label>
                              <Input
                                id="name"
                                name="name"
                                value={editedData?.name || ""}
                                onChange={handleInputChange}
                                className={cn(
                                  "bg-indigo-950/20 border-indigo-500/30 text-white",
                                  !editedData?.name && "border-red-500"
                                )}
                              />
                              {!editedData?.name && (
                                <p className="text-xs text-red-500">
                                  Este campo es obligatorio
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="email">Correo electrónico</Label>
                              <Input
                                id="email"
                                name="email"
                                value={sessionEmail}
                                className="bg-indigo-950/20 border-indigo-500/30 text-white opacity-70"
                                readOnly
                                disabled
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="phone">Teléfono</Label>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={editedData?.phone || ""}
                                onChange={handleInputChange}
                                className={cn(
                                  "bg-indigo-950/20 border-indigo-500/30 text-white",
                                  editedData?.phone && (editedData.phone.length < 8 || editedData.phone.length > 10) && "border-red-500"
                                )}
                                placeholder="Ingresa tu número de teléfono"
                              />
                              {editedData?.phone && (editedData.phone.length < 8 || editedData.phone.length > 10) && (
                                <p className="text-xs text-red-500">
                                  El número de teléfono debe tener entre 8 y 10 dígitos
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="location">Ciudad de ubicación</Label>
                              <Input
                                id="location"
                                name="location"
                                placeholder="Ej: Tijuana, B.C., México"
                                value={editedData?.location || ""}
                                onChange={handleInputChange}
                                className={cn(
                                  "bg-indigo-950/20 border-indigo-500/30 text-white",
                                  !editedData?.location && "border-red-500"
                                )}
                              />
                              {!editedData?.location && (
                                <p className="text-xs text-red-500">
                                  Este campo es obligatorio
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="airport">Aeropuerto más cercano</Label>
                              <Input
                                id="airport"
                                name="airport"
                                placeholder="Opcional - Ej: Tijuana, B.C., México"
                                value={editedData?.airport || ""}
                                onChange={handleInputChange}
                                className={cn(
                                  "bg-indigo-950/20 border-indigo-500/30 text-white",
                                  !editedData?.airport && "border-red-500"
                                )}
                              />
                              {!editedData?.airport && (
                                <p className="text-xs text-red-500">
                                  Este campo es obligatorio
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                          onClick={handleCancelEdit}
                        >
                          <X size={16} className="mr-2" /> Cancelar
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          onClick={handleSaveProfile}
                          disabled={
                            !editedData?.name ||
                            !editedData?.location ||
                            !editedData?.airport
                          }
                        >
                          <Save size={16} className="mr-2" /> Guardar cambios
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4 pb-2">
                        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                          <CardTitle className="text-lg flex items-center">
                            <User className="mr-2 h-5 w-5 text-indigo-400" />
                            Información personal
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                            onClick={() => {
                              setIsEditing(true)
                              setEditedData({
                                name: userProfile?.name || "",
                                phone: userProfile?.phone || "",
                                location: userProfile?.location || "",
                                airport: userProfile?.nearestAirport || ""
                              })
                            }}
                          >
                            <Edit2 size={14} className="mr-2" /> Editar
                          </Button>
                        </CardHeader>

                        <CardContent className="py-2 px-4">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 text-indigo-400 mr-3" />
                              <div>
                                <p className="text-xs text-gray-400">Correo electrónico</p>
                                <p className="text-sm">{sessionEmail}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-purple-400 mr-3" />
                              <div>
                                <p className="text-xs text-gray-400">Teléfono</p>
                                <p className="text-sm">{userProfile?.phone}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-indigo-400 mr-3" />
                              <div>
                                <p className="text-xs text-gray-400">Ciudad de ubicación</p>
                                <p className="text-sm">{userProfile?.location}</p>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <Plane className="h-4 w-4 text-purple-400 mr-3" />
                              <div>
                                <p className="text-xs text-gray-400">Aeropuerto más cercano</p>
                                <p className="text-sm">{userProfile?.nearestAirport || "No especificado"}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-indigo-950/30 border border-indigo-500/30">
                        <CardHeader className="py-3 px-4">
                          <CardTitle className="text-lg flex items-center">
                            <MapPin className="mr-2 h-5 w-5 text-pink-400" />
                            Destinos visitados recientemente
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4">
                          <div className="space-y-3">
                            <div className="relative h-[50px] w-full rounded-lg overflow-hidden">
                              <div className="absolute">
                                <div className="flex">
                                  <Badge className="bg-indigo-600 mb-1 text-xs">
                                    {destinations.length} {destinations.length <= 1 ? 'destino' : 'destinos'} total
                                  </Badge>
                                  <Badge className="bg-indigo-600 mb-1 text-xs">
                                    {destinations.filter(dest => dest.isArkusTrip).length} {destinations.filter(dest => dest.isArkusTrip).length <= 1 ? 'destino' : 'destinos'} Arkus
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap">
                                  <Badge
                                    variant="outline"
                                    className="border-indigo-500/30 text-indigo-300 text-[10px]"
                                  >
                                    No hay destinos registrados
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <h3 className="text-xs font-medium text-gray-300">Últimos destinos visitados</h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                  onClick={() => setIsAddingDestination(true)}
                                >
                                  <Plus size={12} className="mr-1" /> Agregar
                                </Button>
                              </div>

                              {!isAddingDestination ? (
                                <div className="space-y-2">
                                  {destinations.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2">
                                      {destinations.map((dest) => (
                                        <div
                                          key={dest.id}
                                          className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20"
                                        >
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-indigo-400" />
                                            <div>
                                              <p className="text-sm">{dest.destination}</p>
                                              <p className="text-xs text-gray-400">{dest.country}</p>
                                            </div>
                                            {dest.isArkusTrip && (
                                              <Badge className="bg-indigo-500/20 text-indigo-300 text-[10px]">
                                                Arkus
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 hover:bg-indigo-950/30"
                                              onClick={() => handleEditDestination(dest)}
                                            >
                                              <Edit2 size={14} className="text-indigo-400" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 hover:bg-red-950/30"
                                              onClick={() => handleDeleteDestination(dest.id)}
                                            >
                                              <X size={14} className="text-red-400" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-2 text-center text-gray-400 text-xs">
                                      No has registrado destinos visitados
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                                  <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                      <Label htmlFor="country" className="text-sm text-gray-300">
                                        País
                                      </Label>
                                      <Input
                                        id="country"
                                        value={newDestination.country}
                                        onChange={(e) =>
                                          setNewDestination({ ...newDestination, country: e.target.value })
                                        }
                                        className="bg-indigo-950/20 border-indigo-500/30 text-white h-7 text-xs"
                                        placeholder="Ej: México"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="destination" className="text-sm text-gray-300">
                                        Destino
                                      </Label>
                                      <div className="flex items-center gap-1">
                                        <Input
                                          id="destination"
                                          value={newDestination.destination}
                                          onChange={(e) =>
                                            setNewDestination({ ...newDestination, destination: e.target.value })
                                          }
                                          className="bg-indigo-950/20 border-indigo-500/30 text-white h-7 text-xs"
                                          placeholder="Ej: Cancún"
                                        />
                                        <div className="flex items-center gap-1">
                                          <Switch
                                            id="isArkusTrip"
                                            checked={newDestination.isArkusTrip}
                                            onCheckedChange={(checked) =>
                                              setNewDestination({ ...newDestination, isArkusTrip: checked })
                                            }
                                            className="scale-75"
                                          />
                                          <Label htmlFor="isArkusTrip" className="text-[10px] text-gray-400">
                                            Arkus
                                          </Label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                      onClick={() => {
                                        setIsAddingDestination(false)
                                        setNewDestination({ country: "", destination: "", isArkusTrip: false })
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="h-6 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                      onClick={handleAddDestination}
                                      disabled={!newDestination.country || !newDestination.destination}
                                    >
                                      Guardar
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                {/* Pestaña Intereses */}
                <TabsContent value="interests" className="mt-5">
                  <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="mr-2 h-5 w-5 text-indigo-400" />
                        Intereses y hobbies
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Estos son los intereses que seleccionaste durante tu configuración inicial
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-end items-center mb-2">
                            {!isEditingInterests ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                onClick={() => {
                                  setIsEditingInterests(true)
                                  setEditedInterests([...(userProfile?.hobbiesAndInterests || [])])
                                }}
                              >
                                <Edit2 size={12} className="mr-1" /> Editar
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                  onClick={() => {
                                    setIsEditingInterests(false)
                                    setEditedInterests([...(userProfile?.hobbiesAndInterests || [])])
                                  }}
                                >
                                  <X size={12} className="mr-1" /> Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                  onClick={handleSaveInterests}
                                >
                                  <Save size={12} className="mr-1" /> Guardar
                                </Button>
                              </div>
                            )}
                          </div>

                          {!isEditingInterests ? (
                            <div>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                {userProfile?.hobbiesAndInterests?.map((interest) => (
                                  <div
                                    key={interest}
                                    className="flex items-center gap-1.5 p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/20"
                                  >
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center">
                                      {getInterestIcon(interest) || <Heart className="h-3 w-3 text-indigo-400" />}
                                    </div>
                                    <span className="text-xs">{interest}</span>
                                  </div>
                                ))}
                                {(!userProfile?.hobbiesAndInterests ||
                                  userProfile.hobbiesAndInterests.length === 0) && (
                                    <div className="col-span-4 p-3 text-center text-gray-400 text-xs">
                                      <p>No has seleccionado intereses todavía</p>
                                      <Button
                                        variant="link"
                                        className="text-indigo-400 hover:text-indigo-300 mt-1 text-xs"
                                        onClick={() => setIsEditingInterests(true)}
                                      >
                                        Agregar intereses
                                      </Button>
                                    </div>
                                  )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { name: "Deportes por TV", icon: <Tv className="h-3 w-3 text-blue-400" /> },
                                  { name: "Actividades deportivas", icon: <Trophy className="h-3 w-3 text-yellow-400" /> },
                                  { name: "Música", icon: <Music className="h-3 w-3 text-purple-400" /> },
                                  { name: "Arte", icon: <Palette className="h-3 w-3 text-pink-400" /> },
                                  { name: "Tecnología", icon: <Laptop className="h-3 w-3 text-blue-400" /> },
                                  { name: "Lectura", icon: <BookOpen className="h-3 w-3 text-green-400" /> },
                                  { name: "Cocina", icon: <Utensils className="h-3 w-3 text-orange-400" /> },
                                  { name: "Parrilladas al aire libre", icon: <Flame className="h-3 w-3 text-red-400" /> },
                                  { name: "Convivencias", icon: <Users className="h-3 w-3 text-yellow-400" /> },
                                  { name: "Jardinería", icon: <Flower2 className="h-3 w-3 text-green-400" /> },
                                  { name: "Fotografía", icon: <Camera className="h-3 w-3 text-purple-400" /> },
                                  { name: "Manualidades", icon: <Scissors className="h-3 w-3 text-red-400" /> },
                                  { name: "Videojuegos", icon: <Gamepad2 className="h-3 w-3 text-indigo-400" /> },
                                  { name: "Baile", icon: <Music2 className="h-3 w-3 text-pink-400" /> },
                                  { name: "Yoga", icon: <Activity className="h-3 w-3 text-purple-400" /> },
                                  { name: "Meditación", icon: <Moon className="h-3 w-3 text-blue-400" /> },
                                  { name: "Networking", icon: <Network className="h-3 w-3 text-blue-400" /> },
                                  { name: "Startups", icon: <Rocket className="h-3 w-3 text-orange-400" /> },
                                  { name: "Fórmula 1", icon: <Car className="h-3 w-3 text-red-400" /> },
                                  { name: "Naturaleza", icon: <Trees className="h-3 w-3 text-green-400" /> },
                                  { name: "Ir al estadio", icon: <Flag className="h-3 w-3 text-yellow-400" /> },
                                  { name: "Talleres creativos", icon: <Paintbrush className="h-3 w-3 text-pink-400" /> },
                                  { name: "Conciertos", icon: <Music4 className="h-3 w-3 text-purple-400" /> },
                                  { name: "Actividades al aire libre", icon: <Mountain className="h-3 w-3 text-green-400" /> },
                                  { name: "Cine", icon: <Film className="h-3 w-3 text-indigo-400" /> },
                                ].map((interest) => (
                                  <button
                                    key={interest.name}
                                    onClick={() => toggleInterest(interest.name)}
                                    className={`flex items-center gap-1 py-1 px-2 rounded-full text-xs ${editedInterests.includes(interest.name)
                                        ? "bg-indigo-600 text-white"
                                        : "bg-indigo-950 border border-indigo-500/30 text-white"
                                      }`}
                                  >
                                    {interest.icon}
                                    <span>{interest.name}</span>
                                  </button>
                                ))}
                                {/* Display custom interests */}
                                {editedInterests.map((interest) => {
                                  // Check if this is a custom interest (not in the predefined list)
                                  const isPredefined = [
                                    "Deportes por TV", "Actividades deportivas", "Música", "Arte", "Tecnología",
                                    "Lectura", "Cocina", "Parrilladas al aire libre", "Convivencias", "Jardinería",
                                    "Fotografía", "Manualidades", "Videojuegos", "Baile", "Yoga", "Meditación",
                                    "Networking", "Startups", "Fórmula 1", "Naturaleza", "Ir al estadio",
                                    "Talleres creativos", "Conciertos", "Actividades al aire libre", "Cine"
                                  ].includes(interest);

                                  if (!isPredefined) {
                                    return (
                                      <button
                                        key={interest}
                                        onClick={() => toggleInterest(interest)}
                                        className="flex items-center gap-1 py-1 px-2 rounded-full text-xs bg-indigo-600 text-white"
                                      >
                                        <Heart className="h-3 w-3 text-indigo-400" />
                                        <span>{interest}</span>
                                      </button>
                                    );
                                  }
                                  return null;
                                })}
                              </div>

                                <div className="flex mt-5">
                                <Input
                                  placeholder="Agregar interés personalizados..."
                                  value={newInterestInput}
                                  onChange={(e) => {
                                  if (e.target.value.length <= 20) {
                                    setNewInterestInput(e.target.value);
                                  }
                                  }}
                                  onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newInterestInput.trim()) {
                                    handleAddCustomInterest();
                                  }
                                  }}
                                  className="bg-indigo-950 border-indigo-500/30 text-white rounded-r-none h-7 text-xs mr-1"
                                />
                                <Button
                                  onClick={handleAddCustomInterest}
                                  disabled={!newInterestInput.trim()}
                                  className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none h-7 text-xs"
                                >
                                  Agregar
                                </Button>
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <User className="mr-2 h-5 w-5 text-purple-400" />
                        Rasgos de personalidad
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-end items-center mb-2">
                            {!isEditingTraits ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                onClick={() => {
                                  setIsEditingTraits(true)
                                  setEditedTraits([...(userProfile?.personalityTraits || [])])
                                }}
                              >
                                <Edit2 size={12} className="mr-1" /> Editar
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                  onClick={() => {
                                    setIsEditingTraits(false)
                                    setEditedTraits([...(userProfile?.personalityTraits || [])])
                                  }}
                                >
                                  <X size={12} className="mr-1" /> Cancelar
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                  onClick={handleSaveTraits}
                                >
                                  <Save size={12} className="mr-1" /> Guardar
                                </Button>
                              </div>
                            )}
                          </div>

                          {!isEditingTraits ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                              {userProfile?.personalityTraits?.map((trait) => (
                                <div
                                  key={trait}
                                  className="flex items-center gap-1.5 p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/20"
                                >
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center">
                                    {getTraitIcon(trait)}
                                  </div>
                                  <span className="text-xs">{trait}</span>
                                </div>
                              ))}
                              {(!userProfile?.personalityTraits ||
                                userProfile.personalityTraits.length === 0) && (
                                  <div className="col-span-4 p-3 text-center text-gray-400 text-xs">
                                    <p>No has seleccionado rasgos de personalidad todavía</p>
                                    <Button
                                      variant="link"
                                      className="text-indigo-400 hover:text-indigo-300 mt-1 text-xs"
                                      onClick={() => setIsEditingTraits(true)}
                                    >
                                      Agregar rasgos de personalidad
                                    </Button>
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs text-gray-400 mb-1">Selecciona tus rasgos de personalidad</p>
                              <div className="flex flex-wrap gap-1.5">
                                {[
                                  { name: "Sociable", icon: <Users className="h-3 w-3 text-yellow-400" /> },
                                  { name: "Introvertido", icon: <User className="h-3 w-3 text-orange-400" /> },
                                  { name: "Creativo", icon: <Paintbrush className="h-3 w-3 text-pink-400" /> },
                                  { name: "Estructurado", icon: <LayoutGrid className="h-3 w-3 text-red-400" /> },
                                  { name: "Curioso", icon: <Search className="h-3 w-3 text-blue-400" /> },
                                  { name: "Aventurero", icon: <Compass className="h-3 w-3 text-indigo-400" /> },
                                  { name: "Analítico", icon: <BarChart className="h-3 w-3 text-purple-400" /> },
                                  { name: "Energético", icon: <Zap className="h-3 w-3 text-yellow-400" /> },
                                ].map((trait) => (
                                  <button
                                    key={trait.name}
                                    onClick={() => toggleTrait(trait.name)}
                                    className={`flex items-center gap-1 py-1 px-2 rounded-full text-xs ${editedTraits.includes(trait.name)
                                      ? "bg-indigo-600 text-white"
                                      : "bg-indigo-950 border border-indigo-500/30 text-white"
                                      }`}
                                  >
                                    {trait.icon}
                                    <span>{trait.name}</span>
                                  </button>
                                ))}
                                {/* Display custom traits */}
                                {editedTraits
                                  .filter(trait => ![
                                    "Sociable", "Introvertido", "Creativo", "Estructurado",
                                    "Curioso", "Aventurero", "Analítico", "Energético"
                                  ].includes(trait))
                                  .map((customTrait) => (
                                    <button
                                      key={customTrait}
                                      onClick={() => toggleTrait(customTrait)}
                                      className={`flex items-center gap-1 py-1 px-2 rounded-full text-xs ${editedTraits.includes(customTrait)
                                        ? "bg-indigo-600 text-white"
                                        : "bg-indigo-950 border border-indigo-500/30 text-white"
                                        }`}
                                    >
                                      <Heart className="h-3 w-3 text-indigo-400" />
                                      <span>{customTrait}</span>
                                    </button>
                                  ))}
                              </div>

                                <div className="flex mt-5">
                                <Input
                                  placeholder="Agregar rasgo personalizado..."
                                  value={newTraitInput}
                                  onChange={(e) => {
                                  if (e.target.value.length <= 20) {
                                    setNewTraitInput(e.target.value);
                                  }
                                  }}
                                  className="bg-indigo-950 border-indigo-500/30 text-white rounded-r-none h-7 text-xs mr-1"
                                />
                                <Button
                                  onClick={handleAddCustomTrait}
                                  disabled={!newTraitInput.trim()}
                                  className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none h-7 text-xs"
                                >
                                  Agregar
                                </Button>
                                </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña Preferencias */}
                <TabsContent value="preferences" className="mt-5">
                  <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Plane className="h-5 w-5 text-indigo-400" />
                      <h2 className="text-lg font-medium">Preferencias de viaje</h2>
                    </div>

                    {/* Experiencias preferidas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Experiencias preferidas</h3>
                        {!isEditingExperiences ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                            onClick={() => {
                              setIsEditingExperiences(true)
                              setEditedExperiences([...(eventPreferences?.preferredExperiences || [])])
                            }}
                          >
                            <Edit2 size={12} className="mr-1" /> Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingExperiences(false)
                                setEditedExperiences([...(eventPreferences?.preferredExperiences || [])])
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveExperiences}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditingExperiences ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-1">Selecciona tus experiencias preferidas</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {experiencePreferences.map((exp) => (
                              <div
                                key={exp.value}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedExperiences.includes(exp.value)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleExperience(exp.value)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  {exp.icon}
                                </div>
                                <span className="text-xs">{exp.label}</span>
                              </div>
                            ))}
                            {/* Display custom experiences */}
                            {customExperiences.map(customExp => (
                              <div
                                key={customExp}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedExperiences.includes(customExp)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleExperience(customExp)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  ⭐
                                </div>
                                <span className="text-xs">{customExp}</span>
                              </div>
                            ))}
                          </div>
                            <div className="flex mt-3">
                            <Input
                              placeholder="Agregar experiencia personalizada..."
                              value={newExperienceInput}
                              onChange={(e) => {
                              if (e.target.value.length <= 20) {
                                setNewExperienceInput(e.target.value);
                              }
                              }}
                              onKeyDown={(e) => {
                              if (e.key === 'Enter' && newExperienceInput.trim()) {
                                handleAddCustomExperience();
                              }
                              }}
                              className="bg-indigo-950 border-indigo-500/30 text-white rounded-r-none h-7 text-xs mr-1"
                            />
                            <Button
                              onClick={handleAddCustomExperience}
                              disabled={!newExperienceInput.trim()}
                              className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none h-7 text-xs"
                            >
                              Agregar
                            </Button>
                            </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          {eventPreferences?.preferredExperiences?.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {eventPreferences.preferredExperiences.map((exp) => (
                                <div
                                  key={exp}
                                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                    {getExperienceIcon(exp)}
                                  </div>
                                  <span className="text-xs">{exp}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-400 text-sm mb-2">No has seleccionado experiencias todavía</p>
                              <Button
                                variant="link"
                                className="text-indigo-400 hover:text-indigo-300 text-xs"
                                onClick={() => setIsEditingExperiences(true)}
                              >
                                Agregar experiencias
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Destinos preferidos */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Destinos preferidos</h3>
                        {!isEditingDestinations ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                            onClick={() => {
                              setIsEditingDestinations(true)
                              setEditedDestinations([...(eventPreferences?.preferredDestinations || [])])
                            }}
                          >
                            <Edit2 size={12} className="mr-1" /> Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingDestinations(false)
                                setEditedDestinations([...(eventPreferences?.preferredDestinations || [])])
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveDestinations}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditingDestinations ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-1">Selecciona tus destinos preferidos</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {destinationPreferences.map((dest) => (
                              <div
                                key={dest.value}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedDestinations.includes(dest.value)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleDestination(dest.value)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  {dest.icon}
                                </div>
                                <span className="text-xs">{dest.label}</span>
                              </div>
                            ))}
                            {/* Display custom destinations */}
                            {customDestinations.map(customDest => (
                              <div
                                key={customDest}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedDestinations.includes(customDest)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleDestination(customDest)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  ⭐
                                </div>
                                <span className="text-xs">{customDest}</span>
                              </div>
                            ))}
                          </div>
                            <div className="flex mt-3">
                            <Input
                              placeholder="Agregar destino personalizado..."
                              value={newDestinationInput}
                              onChange={(e) => {
                              if (e.target.value.length <= 20) {
                                setNewDestinationInput(e.target.value);
                              }
                              }}
                              onKeyDown={(e) => {
                              if (e.key === 'Enter' && newDestinationInput.trim()) {
                                handleAddCustomDestination();
                              }
                              }}
                              className="bg-indigo-950 border-indigo-500/30 text-white rounded-r-none h-7 text-xs mr-1"
                            />
                            <Button
                              onClick={handleAddCustomDestination}
                              disabled={!newDestinationInput.trim()}
                              className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none h-7 text-xs"
                            >
                              Agregar
                            </Button>
                            </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          {eventPreferences?.preferredDestinations?.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {eventPreferences.preferredDestinations.map((dest) => (
                                <div
                                  key={dest}
                                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                    {getDestinationIcon(dest)}
                                  </div>
                                  <span className="text-xs">{dest}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-400 text-sm mb-2">No has seleccionado destinos todavía</p>
                              <Button
                                variant="link"
                                className="text-indigo-400 hover:text-indigo-300 text-xs"
                                onClick={() => setIsEditingDestinations(true)}
                              >
                                Agregar destinos
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Temporadas preferidas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Temporadas preferidas</h3>
                        {!isEditingSeasons ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                            onClick={() => {
                              setIsEditingSeasons(true)
                              setEditedSeasons([...(eventPreferences?.seasonalPreferences || [])])
                            }}
                          >
                            <Edit2 size={12} className="mr-1" /> Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingSeasons(false)
                                setEditedSeasons([...(eventPreferences?.seasonalPreferences || [])])
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveSeasons}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditingSeasons ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-1">Selecciona tus temporadas preferidas</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {travelSeasons.map((season) => (
                              <div
                                key={season.value}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedSeasons.includes(season.value)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleSeason(season.value)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  {season.icon}
                                </div>
                                <span className="text-xs">{season.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          {eventPreferences?.seasonalPreferences?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {eventPreferences.seasonalPreferences.map((season) => (
                                <div
                                  key={season}
                                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                    {getSeasonIcon(season)}
                                  </div>
                                  <span className="text-xs">{season}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-400 text-sm mb-2">No has seleccionado temporadas todavía</p>
                              <Button
                                variant="link"
                                className="text-indigo-400 hover:text-indigo-300 text-xs"
                                onClick={() => setIsEditingSeasons(true)}
                              >
                                Agregar temporadas
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Fechas bloqueadas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Fechas bloqueadas</h3>
                        {!showDatePicker ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                            onClick={() => setShowDatePicker(true)}
                          >
                            <Calendar size={12} className="mr-1" /> Seleccionar fechas
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => setShowDatePicker(false)}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveBlockedDates}
                            >
                              <Save size={12} className="mr-1" /> Guardar fechas
                            </Button>
                          </div>
                        )}
                      </div>

                      {showDatePicker ? (
                        <div className="space-y-3">
                          <DatePicker
                            selected={null}
                            onChange={(date) => {
                              if (date) {
                                const dateString = date.toDateString();
                                const existingDateIndex = blockedDates.findIndex(d => d.toDateString() === dateString);

                                if (existingDateIndex === -1) {
                                  // Add new date if not already selected
                                  setBlockedDates([...blockedDates, date]);
                                } else {
                                  // Remove date if already selected (double-click)
                                  setBlockedDates(blockedDates.filter((_, index) => index !== existingDateIndex));
                                }
                              }
                            }}
                            inline
                            highlightDates={blockedDates}
                            className="bg-indigo-950 border-indigo-500/30"
                          />
                          <div className="flex flex-wrap gap-2 mt-2">
                            {blockedDates.map((date, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="flex items-center gap-1 border-indigo-500/30 bg-indigo-950/50"
                              >
                                {formatDate(date)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-gray-400 hover:text-white hover:bg-transparent"
                                  onClick={() => setBlockedDates(blockedDates.filter((_, i) => i !== index))}
                                >
                                  <X size={12} />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-4">
                          <p className="text-xs text-gray-400 mb-2">
                            Fechas en las que no estarás disponible para viajar:
                          </p>
                          {blockedDates.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {blockedDates.map((date, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="border-indigo-500/30 bg-indigo-950/50"
                                >
                                  {formatDate(date)}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 text-sm py-2">
                              No has seleccionado fechas bloqueadas
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Disponibilidad general */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Disponibilidad general</h3>
                        {!isEditingAvailability ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                            onClick={() => setIsEditingAvailability(true)}
                          >
                            <Edit2 size={12} className="mr-1" /> Editar
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingAvailability(false)
                                setTravelAvailability({
                                  currentYear: true,
                                  nextYear: true,
                                  followingYear: true,
                                })
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveAvailability}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditingAvailability ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-3">Indica tu disponibilidad general para viajar:</p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="currentYear" className="text-sm">
                                {new Date().getFullYear()} (Año actual)
                              </Label>
                              <Switch
                                id="currentYear"
                                checked={travelAvailability.currentYear}
                                onCheckedChange={(checked) =>
                                  setTravelAvailability({ ...travelAvailability, currentYear: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="nextYear" className="text-sm">
                                {new Date().getFullYear() + 1} (Próximo año)
                              </Label>
                              <Switch
                                id="nextYear"
                                checked={travelAvailability.nextYear}
                                onCheckedChange={(checked) =>
                                  setTravelAvailability({ ...travelAvailability, nextYear: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="followingYear" className="text-sm">
                                {new Date().getFullYear() + 2}
                              </Label>
                              <Switch
                                id="followingYear"
                                checked={travelAvailability.followingYear}
                                onCheckedChange={(checked) =>
                                  setTravelAvailability({ ...travelAvailability, followingYear: checked })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-400 mb-3">Indica tu disponibilidad general para viajar:</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium">{new Date().getFullYear()}</p>
                              <p className="text-xs mt-1 text-indigo-300">
                                {travelAvailability.currentYear ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                            <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium">{new Date().getFullYear() + 1}</p>
                              <p className="text-xs mt-1 text-indigo-300">
                                {travelAvailability.nextYear ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                            <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium">{new Date().getFullYear() + 2}</p>
                              <p className="text-xs mt-1 text-indigo-300">
                                {travelAvailability.followingYear ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
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