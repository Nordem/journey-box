"use client"

import { motion } from "framer-motion"

interface Step {
  title: string;
  component: React.ReactNode;
}

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  isMobile: boolean;
  isTablet: boolean;
}

export default function WizardProgress({ currentStep, totalSteps, steps, isMobile, isTablet }: WizardProgressProps) {
  return (
    <div className="relative">
      <div className="text-center mb-4">
        <motion.h1
          className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 ${isMobile ? "text-xl" : "text-3xl"}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {steps[currentStep].title}
        </motion.h1>
      </div>

      {!isMobile && (
        <div className="hidden sm:flex justify-between mb-4 relative">
          <div className="absolute top-1/2 h-0.5 w-full bg-gray-200 -translate-y-1/2 z-0"></div>

          {steps.map((step: Step, index: number) => (
            <div key={index} className="z-10 flex flex-col items-center">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-gray-100"
                } text-white text-sm font-medium`}
                initial={{ scale: 0.8 }}
                animate={{
                  scale: index === currentStep ? 1.1 : 1,
                  background: index <= currentStep ? "linear-gradient(to right, #3b82f6, #4f46e5)" : "#f3f4f6",
                }}
                transition={{ duration: 0.3 }}
              >
                <span className={index <= currentStep ? "text-white" : "text-gray-400"}>
                  {index + 1}
                </span>
              </motion.div>
              {!isTablet && (
                <span className="text-xs mt-1 text-gray-600 hidden md:block">
                  {step.title}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={`${isMobile ? "flex" : "sm:hidden"} justify-between items-center`}>
        <span className="text-sm text-gray-600">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <motion.div
          className="bg-gray-100 h-2 flex-1 mx-2 rounded-full overflow-hidden"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            animate={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </div>
    </div>
  )
}

