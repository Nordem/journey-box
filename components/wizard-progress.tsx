"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle } from "lucide-react"

interface Step {
  title: string;
  component: React.ReactNode;
  description: string;
}

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  isMobile: boolean;
  isTablet: boolean;
}

export default function WizardProgress({ currentStep, totalSteps, steps, isMobile, isTablet }: WizardProgressProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">
          {steps[currentStep].title}
        </h2>
        <span className="text-sm text-gray-400">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      <p className="text-gray-400 text-sm">
        {steps[currentStep].description}
      </p>

      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
          style={{
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
          }}
        />
        <div className="relative flex justify-between">
          {steps.map((_, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="relative"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {!isMobile && (
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs whitespace-nowrap ${
                    index === currentStep
                      ? "text-white font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {steps[index].title}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

