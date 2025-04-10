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
    const totalQuestions = 16 // Total number of fields across all steps
    let answeredQuestions = 0

    // Step 1: Interests & Destinations
    if (formData.userProfile.personalityTraits.length > 0) answeredQuestions++
    if (formData.userProfile.hobbiesAndInterests.length > 0) answeredQuestions++
    if (formData.eventPreferences.preferredExperiences.length > 0) answeredQuestions++
    if (formData.eventPreferences.preferredDestinations.length > 0) answeredQuestions++
    if (formData.eventPreferences.teamBuildingPrefs.preferredActivities.length > 0) answeredQuestions++
    if (formData.eventPreferences.teamBuildingPrefs.location) answeredQuestions++
    if (formData.eventPreferences.teamBuildingPrefs.duration) answeredQuestions++
    if (formData.eventPreferences.teamBuildingPrefs.suggestions) answeredQuestions++

    // Step 2: Availability
    if (formData.eventPreferences.seasonalPreferences.length > 0) answeredQuestions++
    if (formData.eventPreferences.groupSizePreference.length > 0) answeredQuestions++
    if (formData.eventPreferences.blockedDates.length > 0) answeredQuestions++
    if (formData.userProfile.name) answeredQuestions++
    if (formData.userProfile.location) answeredQuestions++
    if (formData.userProfile.currentTravelLocation) answeredQuestions++
    if (formData.userProfile.languages.length > 0) answeredQuestions++
    if (formData.userProfile.nearestAirport) answeredQuestions++

    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  const completionPercentage = calculateCompletionPercentage()

  return (
    <div className="mb-8">
      {!isLastStep && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-indigo-300">
              Progreso: {completionPercentage}%
            </div>
            <div className="text-sm text-indigo-300">
              Paso {currentStep + 1} de {steps.length}
            </div>
          </div>

          <div className="relative h-2 w-full rounded-full bg-indigo-900/50 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

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
                      isCompleted 
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                        : isCurrent
                        ? "bg-indigo-800/50 text-white border border-indigo-500/30"
                        : "bg-indigo-900/30 text-indigo-400 border border-indigo-500/20"
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
                    <p className={`text-xs font-medium ${
                      isCurrent 
                        ? "text-white" 
                        : isCompleted
                        ? "text-indigo-300"
                        : "text-indigo-400"
                    }`}>
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

