"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface Step {
  title: string
  description: string
}

interface FormData {
  userProfile: {
    name: string;
    location: string;
    currentTravelLocation?: string;
    languages: string[];
    personalityTraits: string[];
    hobbiesAndInterests: string[];
    additionalInfo?: string;
    nearestAirport?: string;
    goals: string[];
  };
  eventPreferences: {
    preferredExperiences: string[];
    preferredDestinations: string[];
    teamBuildingPrefs?: {
      preferredActivities: string[];
      location: 'office' | 'outside' | 'both';
      duration: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days';
      suggestions?: string;
    };
    seasonalPreferences: string[];
    groupSizePreference: string[];
    blockedDates: string[];
  };
}

interface WizardProgressProps {
  steps: Step[]
  currentStep: number
  formData: FormData
}

export default function WizardProgress({ steps, currentStep, formData }: WizardProgressProps) {
  const isLastStep = currentStep === steps.length - 1

  const calculateCompletionPercentage = () => {
    const totalQuestions = 15 // Total number of questions across all steps
    let answeredQuestions = 0

    // Check userProfile fields
    if (formData.userProfile.name) answeredQuestions++
    if (formData.userProfile.location) answeredQuestions++
    if (formData.userProfile.languages.length > 0) answeredQuestions++
    if (formData.userProfile.personalityTraits.length > 0) answeredQuestions++
    if (formData.userProfile.hobbiesAndInterests.length > 0) answeredQuestions++
    if (formData.userProfile.goals.length > 0) answeredQuestions++

    // Check eventPreferences fields
    if (formData.eventPreferences.preferredExperiences.length > 0) answeredQuestions++
    if (formData.eventPreferences.preferredDestinations.length > 0) answeredQuestions++
    if (formData.eventPreferences.seasonalPreferences.length > 0) answeredQuestions++
    if (formData.eventPreferences.groupSizePreference.length > 0) answeredQuestions++
    if (formData.eventPreferences.blockedDates.length > 0) answeredQuestions++

    // Check teamBuildingPrefs fields
    if (formData.eventPreferences.teamBuildingPrefs) {
      if (formData.eventPreferences.teamBuildingPrefs.preferredActivities.length > 0) answeredQuestions++
      if (formData.eventPreferences.teamBuildingPrefs.location) answeredQuestions++
      if (formData.eventPreferences.teamBuildingPrefs.duration) answeredQuestions++
    }

    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  const completionPercentage = calculateCompletionPercentage()

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {isLastStep ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-6"
        >
          <h3 className="text-lg font-semibold text-primary mb-2">Perfil completado {completionPercentage}%</h3>
          <p className="text-gray-600">
            ¡Gracias por compartir tus preferencias! Ahora podremos ofrecerte experiencias personalizadas y conectarte con personas afines.
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200">
            <motion.div
              className="absolute top-0 left-0 h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep

              return (
                <div
                  key={step.title}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <motion.div
                    className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                      isCompleted || isCurrent
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">
                        {index + 1}
                      </span>
                    )}
                  </motion.div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${isCurrent ? "text-primary" : "text-gray-500"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

