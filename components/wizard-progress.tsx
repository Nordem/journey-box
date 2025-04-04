"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface Step {
  title: string
  description: string
}

interface WizardProgressProps {
  steps: Step[]
  currentStep: number
}

export default function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative">
        {/* Progress bar */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200">
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
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted || isCurrent
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 bg-white"
                  }`}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                    backgroundColor: isCompleted || isCurrent ? "var(--primary)" : "#fff",
                    borderColor: isCompleted || isCurrent ? "var(--primary)" : "#d1d5db",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className={isCurrent ? "text-white" : "text-gray-500"}>
                      {index + 1}
                    </span>
                  )}
                </motion.div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-gray-500"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

