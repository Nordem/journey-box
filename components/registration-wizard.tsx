"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AuthStep from "./wizard-steps/auth-step"
import WizardProgress from "./wizard-progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save, Eye, EyeOff } from "lucide-react"
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
          <TeamBuildingStep data={formData.eventPreferences} updateData={(data) => updateFormData("eventPreferences", data)} />
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
      
      setIsSaving(false)
      setSaveCompleted(true)
      setShowSuccessModal(true)
      
      // Show success toast
      toast({
        title: "¡Perfil creado con éxito!",
        description: "Tu perfil ha sido creado correctamente. Por favor, verifica tu email para activar tu cuenta.",
        variant: "default",
      })
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
      <div>
        <h2 className="text-2xl font-bold mb-2 text-white">¡Casi listo!</h2>
        <p className="text-gray-400 mb-6">
          Registara tu cuenta de correo y crea tu contraseña
        </p>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-indigo-100 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.auth.email}
          onChange={(e) => updateFormData("auth", { email: e.target.value })}
          className="w-full px-4 py-2 bg-indigo-900/50 border border-indigo-700/50 rounded-lg text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="tu@email.com"
          required
        />
        <p className="mt-1 text-sm text-indigo-300">
          Usaremos este email para enviarte confirmaciones y actualizaciones sobre tus eventos.
        </p>

        <div className="mt-2 space-y-1">
          <p className="text-sm text-indigo-300">Tu contraseña debe tener:</p>
          <ul className="text-sm text-indigo-300 list-disc list-inside space-y-1">
            <li className={formData.auth.password.length >= 8 ? "text-green-400" : ""}>
              Al menos 8 caracteres
            </li>
            <li className={/[A-Z]/.test(formData.auth.password) ? "text-green-400" : ""}>
              Una letra mayúscula
            </li>
            <li className={/[a-z]/.test(formData.auth.password) ? "text-green-400" : ""}>
              Una letra minúscula
            </li>
            <li className={/\d/.test(formData.auth.password) ? "text-green-400" : ""}>
              Un número
            </li>
          </ul>
        </div>
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-indigo-100 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={formData.auth.password}
            onChange={(e) => updateFormData("auth", { password: e.target.value })}
            className="w-full px-4 py-2 bg-indigo-900/50 border border-indigo-700/50 rounded-lg text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
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
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-indigo-100 mb-2">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.auth.confirmPassword}
            onChange={(e) => updateFormData("auth", { confirmPassword: e.target.value })}
            className="w-full px-4 py-2 bg-indigo-900/50 border border-indigo-700/50 rounded-lg text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
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
          <p className={`mt-1 text-sm ${formData.auth.password === formData.auth.confirmPassword ? "text-green-400" : "text-red-400"}`}>
            {formData.auth.password === formData.auth.confirmPassword 
              ? "✓ Las contraseñas coinciden" 
              : "✗ Las contraseñas no coinciden"}
          </p>
        )}
      </div>
      <div className="mt-6 p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
        <h3 className="text-sm font-medium text-indigo-200 mb-2">Próximos pasos:</h3>
        <ol className="text-sm text-indigo-300 space-y-2 list-decimal list-inside">
          <li>Recibirás un email de verificación</li>
          <li>Confirma tu cuenta haciendo clic en el enlace del email</li>
          <li>Inicia sesión con tus credenciales</li>
          <li>¡Comienza a personalizar tus preferencias de eventos!</li>
        </ol>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black border border-indigo-500/30 rounded-2xl">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md rounded-lg border border-indigo-500/30 p-6 max-w-md w-full mx-4">
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