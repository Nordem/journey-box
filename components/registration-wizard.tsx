"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UserProfileStep from "./wizard-steps/user-profile-step"
import EventPreferencesStep from "./wizard-steps/event-preferences-step"
import RestrictionsStep from "./wizard-steps/restrictions-step"
import HistoryStep from "./wizard-steps/history-step"
import OutcomesStep from "./wizard-steps/outcomes-step"
import CalendarStep from "./wizard-steps/calendar-step"
import DeliverablesStep from "./wizard-steps/deliverables-step"
import CompletionStep from "./wizard-steps/completion-step"
import WizardProgress from "./wizard-progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useToast } from "@/hooks/use-toast"

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
  goals: string[];
}

interface EventPreferencesData {
  categories: string[];
  vibeKeywords: string[];
  idealTimeSlots: string[];
  budget: string;
  preferredGroupType: string[];
  preferredEventSize: string[];
  maxDistanceKm: number;
}

interface RestrictionsData {
  avoidCrowdedDaytimeConferences: boolean;
  avoidOverlyFormalNetworking: boolean;
  avoidFamilyKidsEvents: boolean;
  noFamilyKidsEvents: boolean;
}

interface HistoryData {
  recentEventsAttended: any[];
  eventFeedback: any[];
}

interface IdealOutcome {
  description: string;
}

interface FormData {
  userProfile: UserProfileData;
  eventPreferences: EventPreferencesData;
  restrictions: RestrictionsData;
  history: HistoryData;
  idealOutcomes: IdealOutcome[];
  calendarEvents: Record<string, string>;
  deliverables: Deliverable[];
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
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    userProfile: {
      name: "",
      location: "",
      currentTravelLocation: "",
      languages: [],
      personalityTraits: [],
      goals: [],
    },
    eventPreferences: {
      categories: [],
      vibeKeywords: [],
      idealTimeSlots: [],
      budget: "",
      preferredGroupType: [],
      preferredEventSize: [],
      maxDistanceKm: 1000,
    },
    restrictions: {
      avoidCrowdedDaytimeConferences: false,
      avoidOverlyFormalNetworking: false,
      avoidFamilyKidsEvents: false,
      noFamilyKidsEvents: false,
    },
    history: {
      recentEventsAttended: [],
      eventFeedback: [],
    },
    idealOutcomes: [],
    calendarEvents: {},
    deliverables: [],
  })

  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const totalSteps = 8

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
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      // Scroll to top on mobile when changing steps
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      // Scroll to top on mobile when changing steps
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const requestBody = {
        userProfile: formData.userProfile,
        eventPreferences: formData.eventPreferences,
        restrictions: formData.restrictions,
        history: formData.history,
        idealOutcomes: formData.idealOutcomes,
        calendarEvents: Object.entries(formData.calendarEvents || {}).map(([date, event]) => {
          const [status = "", description = ""] = (event || "").split(" – ")
          return { date, status, description }
        }),
        deliverables: formData.deliverables,
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
        console.error("Failed to parse response as JSON:", e)
        console.error("Response content type:", response.headers.get("content-type"))
        console.error("Response text:", text.substring(0, 1000)) // Log first 1000 chars in case response is very long
        
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

      console.log("Registration successful:", data)
      toast({
        title: "Success!",
        description: "Your profile has been created successfully.",
        variant: "default",
      })
      
      // Move to the completion step
      setCurrentStep(totalSteps - 1)
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create profile"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps: Step[] = [
    {
      title: "Basic Info",
      description: "Tell us about yourself",
      component: (
        <UserProfileStep
          data={formData.userProfile}
          updateData={(data: UserProfileData) => setFormData({ ...formData, userProfile: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Event Preferences",
      description: "What kind of events do you like?",
      component: (
        <EventPreferencesStep
          data={formData.eventPreferences}
          updateData={(data: EventPreferencesData) => setFormData({ ...formData, eventPreferences: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Restrictions",
      description: "What would you prefer to avoid?",
      component: (
        <RestrictionsStep
          data={formData.restrictions}
          updateData={(data: RestrictionsData) => setFormData({ ...formData, restrictions: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Event History",
      description: "Tell us about your past experiences",
      component: (
        <HistoryStep
          data={formData.history}
          updateData={(data: HistoryData) => setFormData({ ...formData, history: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Ideal Outcomes",
      description: "What do you want to achieve?",
      component: (
        <OutcomesStep
          data={formData.idealOutcomes.map(o => o.description)}
          updateData={(data: string[]) => setFormData({ ...formData, idealOutcomes: data.map(d => ({ description: d })) })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Calendar",
      description: "When are you available?",
      component: (
        <CalendarStep
          data={formData.calendarEvents}
          updateData={(data: Record<string, string>) => setFormData({ ...formData, calendarEvents: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Deliverables",
      description: "What are your goals?",
      component: (
        <DeliverablesStep
          data={formData.deliverables}
          updateData={(data: Deliverable[]) => setFormData({ ...formData, deliverables: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Complete",
      description: "Review your profile",
      component: (
        <CompletionStep
          data={{
            ...formData,
            userProfile: {
              ...formData.userProfile,
              currentTravelLocation: formData.userProfile.currentTravelLocation || "",
            },
            calendarEvents: Object.entries(formData.calendarEvents).map(([date, event]) => {
              const [status = "", description = ""] = (event || "").split(" – ")
              return { date, status, description }
            }),
          }}
          isMobile={isMobile}
        />
      ),
    },
  ]

  return (
    <div className="w-full max-w-4xl flex flex-col gap-4">
      {/* Main content card */}
      <motion.div
        className="bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-200 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <WizardProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={steps}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Navigation buttons in separate card */}
      <motion.div
        className="bg-white/95 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="group relative overflow-hidden bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700"
            size={isMobile ? "sm" : "default"}
          >
            <span className="relative z-10 flex items-center">
              <ChevronLeft className={`${isMobile ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4"}`} />
              {isMobile ? "Back" : "Previous"}
            </span>
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              size={isMobile ? "sm" : "default"}
            >
              <span className="relative z-10 flex items-center">
                {isMobile ? "Next" : "Continue"}
                <ChevronRight className={`${isMobile ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"}`} />
              </span>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
              size={isMobile ? "sm" : "default"}
            >
              <span className="relative z-10 flex items-center">
                {isSubmitting ? "Saving..." : "Save Profile"}
                {!isSubmitting && <Save className={`${isMobile ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"}`} />}
              </span>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}