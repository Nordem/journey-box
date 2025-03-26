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

interface CalendarEvent {
  date: Date;
  status: string;
  description?: string;
}

interface Deliverable {
  title: string;
  date: Date;
  note?: string;
}

interface FormData {
  userProfile: {
    name: string;
    location: string;
    currentTravelLocation?: string;
    languages: string[];
    personalityTraits: string[];
    goals: string[];
  };
  eventPreferences: {
    categories: string[];
    vibeKeywords: string[];
    idealTimeSlots: string[];
    budget: string;
    preferredGroupType: string[];
    preferredEventSize: string[];
    maxDistanceKm: number;
  };
  restrictions: {
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
    avoidFamilyKidsEvents: boolean;
  };
  history: {
    recentEventsAttended: string[];
    eventFeedback: string[];
  };
  idealOutcomes: string[];
  calendarEvents: CalendarEvent[];
  deliverables: Deliverable[];
}

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  isMobile: boolean;
}

interface Step {
  title: string;
  component: React.ReactNode;
}

export default function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
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
      budget: "medium",
      preferredGroupType: [],
      preferredEventSize: [],
      maxDistanceKm: 20,
    },
    restrictions: {
      avoidCrowdedDaytimeConferences: false,
      avoidOverlyFormalNetworking: false,
      avoidFamilyKidsEvents: false,
    },
    history: {
      recentEventsAttended: [],
      eventFeedback: [],
    },
    idealOutcomes: [],
    calendarEvents: [],
    deliverables: [],
  })

  const isMobile = useMediaQuery("(max-width: 640px)")
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

      // Log the data being sent
      console.log('Sending data:', JSON.stringify({
        userProfile: formData.userProfile,
        eventPreferences: formData.eventPreferences,
        restrictions: formData.restrictions,
        history: formData.history,
        idealOutcomes: formData.idealOutcomes.map(description => ({ description })),
        calendarEvents: formData.calendarEvents.map(event => ({
          date: event.date,
          status: event.status,
          description: event.description
        })),
        deliverables: formData.deliverables.map(deliverable => ({
          title: deliverable.title,
          date: deliverable.date,
          note: deliverable.note
        }))
      }, null, 2));

      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile: formData.userProfile,
          eventPreferences: formData.eventPreferences,
          restrictions: formData.restrictions,
          history: formData.history,
          idealOutcomes: formData.idealOutcomes.map(description => ({ description })),
          calendarEvents: formData.calendarEvents.map(event => ({
            date: event.date,
            status: event.status,
            description: event.description
          })),
          deliverables: formData.deliverables.map(deliverable => ({
            title: deliverable.title,
            date: deliverable.date,
            note: deliverable.note
          }))
        }),
      });

      let data;
      try {
        const text = await response.text();
        console.log('Raw response:', text);
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create user profile');
      }

      if (!data?.user) {
        throw new Error('No user data received');
      }

      toast({
        title: "Success!",
        description: "Profile has been created successfully.",
        variant: "default",
      });

      setCurrentStep(totalSteps - 1);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps: Step[] = [
    {
      title: "Personal Profile",
      component: (
        <UserProfileStep
          data={formData.userProfile}
          updateData={(data: FormData['userProfile']) => updateFormData("userProfile", data)}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Event Preferences",
      component: (
        <EventPreferencesStep
          data={formData.eventPreferences}
          updateData={(data: FormData['eventPreferences']) => updateFormData("eventPreferences", data)}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Restrictions",
      component: (
        <RestrictionsStep
          data={formData.restrictions}
          updateData={(data: FormData['restrictions']) => updateFormData("restrictions", data)}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Event History",
      component: (
        <HistoryStep
          data={formData.history}
          updateData={(data: FormData['history']) => updateFormData("history", data)}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Ideal Outcomes",
      component: (
        <OutcomesStep
          data={formData.idealOutcomes}
          updateData={(data: string[]) => setFormData((prev) => ({ ...prev, idealOutcomes: data }))}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Calendar",
      component: (
        <CalendarStep
          data={formData.calendarEvents}
          updateData={(data: CalendarEvent[]) => setFormData((prev) => ({ ...prev, calendarEvents: data }))}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Deliverables",
      component: (
        <DeliverablesStep
          data={formData.deliverables}
          updateData={(data: Deliverable[]) => setFormData((prev) => ({ ...prev, deliverables: data }))}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Complete",
      component: <CompletionStep data={formData} isMobile={isMobile} />,
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