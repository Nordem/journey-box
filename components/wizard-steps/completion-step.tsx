"use client"

import { motion } from "framer-motion"
import { Clock, CheckCircle2, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface CompletionStepProps {
  data: any
  isMobile: boolean
  isSaving?: boolean
  saveCompleted?: boolean
}

export default function CompletionStep({ data, isMobile, isSaving = false, saveCompleted = false }: CompletionStepProps) {
  const router = useRouter()
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  const goToDashboard = () => {
    router.push('/dashboard')
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <div className={`${isSaving ? "bg-blue-100" : (saveCompleted ? "bg-green-100" : "bg-yellow-100")} p-3 rounded-full`}>
            {isSaving ? (
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            ) : (
              saveCompleted ? (
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              ) : (
                <Clock className="h-10 w-10 text-yellow-600" />
              )
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {isSaving ? "Profile Information Submitted" : (saveCompleted ? "Registration Complete!" : "Finalizing Registration")}
        </h2>
        <p className="text-gray-600">
          {isSaving ? (
            <>Your information is being processed and saved to our database. We've sent a verification email to <span className="font-medium">{data.email}</span>.</>
          ) : (
            saveCompleted ? (
              <>Your profile has been successfully saved to our database. We've sent a verification email to <span className="font-medium">{data.email}</span>.</>
            ) : (
              <>Your profile is being finalized. Please wait while we complete the process. A verification email will be sent to <span className="font-medium">{data.email}</span>.</>
            )
          )}
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">
                {isSaving || !saveCompleted ? "Complete Your Registration" : "Next Steps"}
              </h3>
              <ol className="space-y-2 text-sm text-blue-800">
                {(isSaving || !saveCompleted) && <li>1. Wait for your profile to be saved to our database</li>}
                <li>{(isSaving || !saveCompleted) ? "2" : "1"}. Check your email for a verification link</li>
                <li>{(isSaving || !saveCompleted) ? "3" : "2"}. Click the link to verify your account</li>
                <li>{(isSaving || !saveCompleted) ? "4" : "3"}. You'll be redirected to your personal dashboard</li>
              </ol>
              <p className="mt-4 text-sm text-blue-700">
                If you don't see the email{(isSaving || !saveCompleted) ? " after your profile is saved" : ""}, please check your spam folder.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {(isSaving || !saveCompleted) && (
        <motion.div 
          variants={itemVariants} 
          className="flex items-center justify-center py-4 space-x-2 text-blue-600"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">
            {isSaving ? "Saving profile information..." : "Finalizing your profile..."}
          </span>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="pt-4">
        <Button 
          variant="default" 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          onClick={goToDashboard}
          disabled={isSaving || !saveCompleted}
        >
          <span className="mr-2">Continue to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-sm text-gray-500 mt-2">
          {isSaving || !saveCompleted
            ? "Your dashboard will be fully accessible once your profile is saved and your email is verified" 
            : "Please verify your email before accessing your dashboard. Check your inbox for the verification link."}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="font-semibold">Your Profile Summary</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <span className="text-sm text-gray-500">Name:</span>
            <p className="font-medium">{data.userProfile.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Location:</span>
            <p className="font-medium">{data.userProfile.location}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Events Preferences:</span>
            <p className="font-medium">
              {data.eventPreferences.categories.join(', ') || 'None specified'}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Calendar Events:</span>
            <p className="font-medium">
              {data.calendarEvents.length} event(s) added
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

