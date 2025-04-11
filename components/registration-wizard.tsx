"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AuthStep from "./wizard-steps/auth-step"
import WizardProgress from "./wizard-progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save, Eye, EyeOff, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import PersonalityInterestsStep from "./wizard-steps/personality-interests-step"
import TravelPreferencesStep from "./wizard-steps/travel-preferences-step"
import TeamBuildingStep from "./wizard-steps/team-building-step"
import AvailabilityStep from "./wizard-steps/availability-step"
import PersonalInfoStep from "./wizard-steps/personal-info-step"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

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

interface TeamBuildingPreferencesData {
  preferredActivities: string[];
  location?: 'office' | 'outside' | 'both';
  duration?: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days';
  suggestions?: string;
}

interface EventPreferencesData {
  preferredExperiences: string[];
  preferredDestinations: string[];
  teamBuildingPrefs: {
    preferredActivities: string[];
    location: 'office' | 'outside' | 'both';
    duration: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days';
    suggestions: string;
  };
  seasonalPreferences: string[];
  groupSizePreference: string[];
  blockedDates: string[];
  categories: string[];
  vibeKeywords: string[];
  budget: string;
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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

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
        location: 'office',
        duration: 'less_than_2h',
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
      title: "Intereses & Destinos",
      description: "Cuéntanos sobre tus intereses y destinos preferidos",
      component: (
        <>
          <PersonalityInterestsStep data={formData.userProfile} updateData={(data) => updateFormData("userProfile", data)} />
          <TravelPreferencesStep data={formData.eventPreferences} updateData={(data) => updateFormData("eventPreferences", data)} />
          {/* <TeamBuildingStep data={formData.eventPreferences} updateData={(data) => updateFormData("eventPreferences", data)} /> */}
        </>
      )
    },
    {
      title: "Disponibilidad",
      description: "Indica tus preferencias de tiempo y fechas",
      component: (
        <>
          <AvailabilityStep data={formData.eventPreferences} updateData={(data) => updateFormData("eventPreferences", data)} />
          <PersonalInfoStep data={formData.userProfile} updateData={(data) => updateFormData("userProfile", data)} />
        </>
      )
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
    if (currentStep === 0) {
      // Validate interests and destinations for the first step
      if (formData.userProfile.hobbiesAndInterests.length === 0) {
        setValidationError("Por favor selecciona al menos un interés para continuar")
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      if (formData.eventPreferences.preferredDestinations.length === 0) {
        setValidationError("Por favor selecciona al menos un tipo de destino para continuar")
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      
      // Clear validation error if all checks pass
      setValidationError(null)
    }

    if (currentStep === 1) {
      // Validate seasonal preferences and personal information for the second step
      if (formData.eventPreferences.seasonalPreferences.length === 0) {
        setValidationError("Por favor selecciona al menos una temporada preferida")
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      if (!formData.userProfile.name || !formData.userProfile.location || !formData.userProfile.nearestAirport) {
        setValidationError("Por favor completa tu nombre y ubicación")
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
      
      // Clear validation error if all checks pass
      setValidationError(null)
    }

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

      // Validate required fields
      if (!formData.userProfile.name) {
        throw new Error("Por favor ingresa tu nombre")
      }

      if (!formData.userProfile.location) {
        throw new Error("Por favor ingresa tu ubicación")
      }

      if (!formData.auth.email) {
        throw new Error("Por favor ingresa tu correo electrónico")
      }

      if (!formData.auth.password) {
        throw new Error("Por favor ingresa tu contraseña")
      }
      
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
      
      setIsSaving(false)
      setSaveCompleted(true)
      setShowSuccessModal(true)
      
      // Show success toast
      toast({
        title: "¡Perfil creado con éxito!",
        description: "Tu perfil ha sido creado correctamente. Por favor, verifica tu email para activar tu cuenta.",
        variant: "default",
      })

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderAuthStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Configura tu cuenta
        </h2>
        <p className="text-gray-400 mt-2">
          Crea tu cuenta para comenzar a disfrutar de experiencias personalizadas
        </p>
      </div>

      <div className="p-6 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.auth.email}
              onChange={(e) => updateFormData("auth", { email: e.target.value })}
              className="bg-black/50 border-indigo-500/30 text-white"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.auth.password}
                onChange={(e) => updateFormData("auth", { password: e.target.value })}
                className="bg-black/50 border-indigo-500/30 text-white pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar Contraseña
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.auth.confirmPassword}
                onChange={(e) => updateFormData("auth", { confirmPassword: e.target.value })}
                className="bg-black/50 border-indigo-500/30 text-white pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.auth.password && formData.auth.confirmPassword && (
              <p className={`text-sm ${formData.auth.password === formData.auth.confirmPassword ? "text-green-400" : "text-red-400"}`}>
                {formData.auth.password === formData.auth.confirmPassword 
                  ? "✓ Las contraseñas coinciden" 
                  : "✗ Las contraseñas no coinciden"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-400" />
            ¡Todo listo para comenzar!
          </h3>
          <Badge className="bg-green-600">100%</Badge>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          Al crear tu cuenta, aceptas nuestros términos y condiciones y política de privacidad.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950/95 to-black/100 border border-indigo-500/30 rounded-2xl">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-indigo-950/95 via-purple-950/95 to-black/95 backdrop-blur-md rounded-lg border border-indigo-500/30 p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/20 mb-4">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">¡Perfil creado con éxito!</h3>
              <p className="text-sm text-indigo-300 mb-6">
                Tu perfil ha sido creado correctamente. Por favor, verifica tu email para activar tu cuenta.
              </p>
              <Button
                onClick={() => {
                  setShowSuccessModal(false)
                  router.push('/login')
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 w-full"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Flash Error Message */}
        {validationError && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{validationError}</p>
            </div>
          </div>
        )}

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
            {currentStep === 2 ? renderAuthStep() : steps[currentStep].component}
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
                  Guardar Perfil
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