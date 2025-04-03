"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Calendar, MapPin, Clock, Users, Loader2, AlertCircle } from "lucide-react"

interface CompletionStepProps {
  isMobile: boolean
  isSubmitting?: boolean
  isSaving?: boolean
  saveCompleted?: boolean
  error?: string | null
  email?: string
}

export default function CompletionStep({ 
  isMobile, 
  isSubmitting = false, 
  isSaving = false, 
  saveCompleted = false,
  error = null,
  email = ""
}: CompletionStepProps) {
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

  if (isSubmitting || isSaving) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Processing Registration</h2>
          <p className="text-gray-400">
            Please wait while we complete your registration...
          </p>
        </motion.div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Registration Error</h2>
          <p className="text-gray-400">
            {error}
          </p>
        </motion.div>
      </motion.div>
    )
  }

  if (saveCompleted) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Registration Complete!</h2>
          <p className="text-gray-400 mb-4">
            Thank you for completing your registration. We've sent a verification email to {email}.
          </p>
          <p className="text-gray-400">
            Please check your email and click the verification link to activate your account.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-gray-800/80 border-gray-700">
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="text-white font-medium">Email Verification</h4>
                    <p className="text-gray-400 text-sm">
                      Verify your email address to activate your account.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="text-white font-medium">Event Matching</h4>
                    <p className="text-gray-400 text-sm">
                      We'll start matching you with events based on your preferences.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="text-white font-medium">Time Slot Matching</h4>
                    <p className="text-gray-400 text-sm">
                      Events will be scheduled according to your preferred time slots.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <h4 className="text-white font-medium">Group Matching</h4>
                    <p className="text-gray-400 text-sm">
                      You'll be matched with groups that share similar interests.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card>

          <Card className="p-6 bg-gray-800/80 border-gray-700">
            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">What to Expect</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <h4 className="text-white font-medium">Email Verification</h4>
                    <p className="text-gray-400 text-sm">
                      Check your inbox for the verification email. If you don't see it, please check your spam folder.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <h4 className="text-white font-medium">Account Activation</h4>
                    <p className="text-gray-400 text-sm">
                      Once verified, your account will be activated and you can start using Journey Box.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <h4 className="text-white font-medium">Event Notifications</h4>
                    <p className="text-gray-400 text-sm">
                      You'll receive notifications about events that match your preferences.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Card>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Ready to Complete Registration</h2>
        <p className="text-gray-400 mb-4">
          Please click the "Save Profile" button below to complete your registration.
        </p>
        <p className="text-gray-400">
          After saving, you'll receive a verification email to activate your account.
        </p>
      </motion.div>
    </motion.div>
  )
}

