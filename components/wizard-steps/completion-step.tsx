"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Calendar, MapPin, Clock, Users } from "lucide-react"

interface CompletionStepProps {
  isMobile: boolean
}

export default function CompletionStep({ isMobile }: CompletionStepProps) {
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
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">Registration Complete!</h2>
        <p className="text-gray-400">
          Thank you for completing your registration. Here's what happens next:
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
                  <h4 className="text-white font-medium">Event Matching</h4>
                  <p className="text-gray-400 text-sm">
                    We'll start matching you with events based on your preferences and availability.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-1" />
                <div>
                  <h4 className="text-white font-medium">Location-Based Events</h4>
                  <p className="text-gray-400 text-sm">
                    You'll receive notifications for events happening in your area.
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
                    You'll be matched with groups that share similar interests and preferences.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </Card>

        <Card className="p-6 bg-gray-800/80 border-gray-700">
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Your Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <h4 className="text-white font-medium">Event Types</h4>
                  <p className="text-gray-400 text-sm">
                    Based on your selected categories and vibe keywords.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <h4 className="text-white font-medium">Group Size</h4>
                  <p className="text-gray-400 text-sm">
                    Matched with events that fit your preferred group size.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <h4 className="text-white font-medium">Restrictions</h4>
                  <p className="text-gray-400 text-sm">
                    Events will respect your specified restrictions and preferences.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <h4 className="text-white font-medium">Availability</h4>
                  <p className="text-gray-400 text-sm">
                    Events will be scheduled according to your calendar availability.
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

