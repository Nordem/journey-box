"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface CompletionStepProps {
  data: any
  isMobile: boolean
}

export default function CompletionStep({ data, isMobile }: CompletionStepProps) {
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
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
        <p className="text-gray-600">
          Thank you for creating your profile. We've sent a verification email to <span className="font-medium">{data.email}</span>.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps</h3>
              <ol className="space-y-2 text-sm text-blue-800">
                <li>1. Check your email for a verification link</li>
                <li>2. Click the link to verify your account</li>
                <li>3. You'll be redirected to your personal dashboard</li>
              </ol>
              <p className="mt-4 text-sm text-blue-700">
                If you don't see the email, please check your spam folder.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-4">
        <Button 
          variant="default" 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          onClick={goToDashboard}
        >
          <span className="mr-2">Go to Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-sm text-gray-500 mt-2">
          You'll need to verify your email to access all features
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

