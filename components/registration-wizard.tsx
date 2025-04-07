"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AuthStep from "./wizard-steps/auth-step"
import WizardProgress from "./wizard-progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import PersonalityInterestsStep from "./wizard-steps/personality-interests-step"
import TravelPreferencesStep from "./wizard-steps/travel-preferences-step"
import TeamBuildingStep from "./wizard-steps/team-building-step"
import AvailabilityStep from "./wizard-steps/availability-step"
import PersonalInfoStep from "./wizard-steps/personal-info-step"

interface Step {
  title: string;
  description: string;
  component: React.ReactNode;
}

interface CalendarEvent {
  date: string;
  status: string;
  description: string;
}

interface Deliverable {
  title: string;
  date: string;
  note: string;
}

interface UserProfileData {
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

interface EventPreferencesData {
  preferredExperiences: string[];
  preferredDestinations: string[];
  teamBuildingPrefs?: TeamBuildingPreferencesData;
  seasonalPreferences: string[];
  groupSizePreference: string[];
  blockedDates: string[];
  categories: string[];
  vibeKeywords: string[];
  budget?: string;
}

interface TeamBuildingPreferencesData {
  preferredActivities: string[];
  location: 'office' | 'outside' | 'both';
  duration: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days';
  suggestions?: string;
}

interface RestrictionsData {
  avoidFamilyKidsEvents: boolean
  avoidCrowdedDaytimeConferences: boolean
  avoidOverlyFormalNetworking: boolean
}

interface HistoryData {
  recentEventsAttended: any[];
  eventFeedback: any[];
}

interface IdealOutcome {
  description: string;
}

interface AuthData {
  email: string;
  password: string;
  confirmPassword?: string;
}

interface FormData {
  auth: AuthData;
  userProfile: UserProfileData;
  eventPreferences: EventPreferencesData;
}

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  isMobile: boolean;
}

export default function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveCompleted, setSaveCompleted] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    auth: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    userProfile: {
      name: "",
      location: "",
      currentTravelLocation: "",
      languages: [],
      personalityTraits: [],
      hobbiesAndInterests: [],
      additionalInfo: "",
      nearestAirport: "",
      goals: [],
    },
    eventPreferences: {
      preferredExperiences: [],
      preferredDestinations: [],
      teamBuildingPrefs: {
        preferredActivities: [],
        location: 'both',
        duration: 'half_day',
        suggestions: "",
      },
      seasonalPreferences: [],
      groupSizePreference: [],
      blockedDates: [],
      categories: [],
      vibeKeywords: [],
      budget: "",
    },
  })

  const steps = [
    {
      title: "Personalidad e Intereses",
      description: "Cuéntanos sobre ti y tus intereses",
      component: <PersonalityInterestsStep data={formData.userProfile} updateData={(data) => updateFormData("userProfile", data)} />
    },
    {
      title: "Preferencias de Viaje",
      description: "Selecciona tus experiencias y destinos preferidos",
      component: <TravelPreferencesStep data={formData.eventPreferences} updateData={(data) => updateFormData("eventPreferences", data)} />
    },
    {
      title: "Team Building",
      description: "Configura tus preferencias para actividades grupales",
      component: <TeamBuildingStep data={formData.eventPreferences} updateData={(data) => updateFormData("eventPreferences", data)} />
    },
    {
      title: "Disponibilidad",
      description: "Indica tus preferencias de tiempo y fechas",
      component: <AvailabilityStep data={formData.eventPreferences} updateData={(data) => updateFormData("eventPreferences", data)} />
    },
    {
      title: "Información Personal",
      description: "Completa tus datos personales",
      component: <PersonalInfoStep data={formData.userProfile} updateData={(data) => updateFormData("userProfile", data)} />
    },
    {
      title: "Crear Cuenta",
      description: "Configura tu cuenta para comenzar",
      component: <AuthStep data={formData.auth} updateData={(data) => updateFormData("auth", data)} />
    }
  ]

  const updateFormData = useCallback((section: keyof FormData, data: Partial<FormData[keyof FormData]>) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }))
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      setIsSaving(true)
      setSaveCompleted(false)
      
      // Show persistent toast while saving
      const savingToast = toast({
        title: "Saving Profile",
        description: "Please wait while we save your profile information...",
        variant: "default",
      })

      // Validate passwords match
      if (formData.auth.password !== formData.auth.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // 1. Create Supabase user
      console.log("Creating Supabase user...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.auth.email,
        password: formData.auth.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      })

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      console.log("User created successfully:", authData.user.id)

      // 2. Send user registration data to API
      const requestBody = {
        userId: authData.user.id,
        email: formData.auth.email,
        userProfile: formData.userProfile,
        eventPreferences: formData.eventPreferences,
      }

      console.log("Sending request to /api/register:", requestBody)

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))
      
      const text = await response.text()
      console.log("Raw response text:", text)

      // If the response is empty, handle it gracefully
      if (!text.trim()) {
        console.warn("Received empty response from server")
        throw new Error(`Server returned empty response with status ${response.status}`)
      }

      let data = null
      try {
        data = JSON.parse(text)
      } catch (e) {
        // If we got HTML instead of JSON, make the error more helpful
        if (text.trim().startsWith("<!DOCTYPE html>") || text.trim().startsWith("<html")) {
          throw new Error("Server returned HTML instead of JSON. This might indicate a server error.")
        }
        
        throw new Error(`Invalid JSON response from server (Status: ${response.status})`)
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `Registration failed: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      // Dismiss the saving toast
      savingToast.dismiss()
      toast({
        title: "Success!",
        description: "Your profile has been created successfully. Please check your email to verify your account.",
        variant: "default",
      })
      
      setIsSaving(false)
      setSaveCompleted(true)
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create profile"
      setError(errorMessage)
      setIsSaving(false)
      setSaveCompleted(false)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      // If Supabase user was created but profile saving failed, we might need to clean up
      // Consider adding code here to delete the Supabase user in case of failure
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black border border-indigo-500/30 rounded-2xl">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/login'}
            className="text-sm text-indigo-200 hover:text-white"
          >
            ¿Ya tienes una cuenta? Iniciar sesión
          </Button>
        </div>
        
        <WizardProgress 
          steps={steps} 
          currentStep={currentStep} 
          formData={formData}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md rounded-lg border border-indigo-500/30 p-6"
          >
            {steps[currentStep].component}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar y Continuar
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}