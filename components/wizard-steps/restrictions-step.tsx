"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"
import { Family, Users, Briefcase } from "lucide-react"

interface RestrictionsData {
  avoidFamilyKidsEvents: boolean
  avoidCrowdedDaytimeConferences: boolean
  avoidOverlyFormalNetworking: boolean
}

interface RestrictionsStepProps {
  data: RestrictionsData
  updateData: (data: RestrictionsData) => void
  isMobile: boolean
}

export default function RestrictionsStep({ data, updateData, isMobile }: RestrictionsStepProps) {
  const [avoidFamilyKidsEvents, setAvoidFamilyKidsEvents] = useState(
    data.avoidFamilyKidsEvents || false,
  )
  const [avoidCrowdedDaytimeConferences, setAvoidCrowdedDaytimeConferences] = useState(
    data.avoidCrowdedDaytimeConferences || false,
  )
  const [avoidOverlyFormalNetworking, setAvoidOverlyFormalNetworking] = useState(
    data.avoidOverlyFormalNetworking || false,
  )

  useEffect(() => {
    updateData({
      avoidFamilyKidsEvents,
      avoidCrowdedDaytimeConferences,
      avoidOverlyFormalNetworking,
    })
  }, [avoidFamilyKidsEvents, avoidCrowdedDaytimeConferences, avoidOverlyFormalNetworking, updateData])

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
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-white">Event Restrictions</h2>
        <p className="text-gray-400">
          Let us know what types of events you'd prefer to avoid.
        </p>
      </motion.div>

      <Card className="p-6 bg-gray-800/80 border-gray-700">
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidFamilyKidsEvents"
                checked={avoidFamilyKidsEvents}
                onCheckedChange={(checked) => setAvoidFamilyKidsEvents(checked as boolean)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <div className="flex items-center space-x-2">
                <Family className="h-4 w-4 text-gray-400" />
                <Label htmlFor="avoidFamilyKidsEvents" className="text-white">
                  Avoid family and kids events
                </Label>
              </div>
            </div>
            <p className="text-gray-400 text-sm ml-6">
              Skip events that are primarily focused on family activities or children.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidCrowdedDaytimeConferences"
                checked={avoidCrowdedDaytimeConferences}
                onCheckedChange={(checked) => setAvoidCrowdedDaytimeConferences(checked as boolean)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <Label htmlFor="avoidCrowdedDaytimeConferences" className="text-white">
                  Avoid crowded daytime conferences
                </Label>
              </div>
            </div>
            <p className="text-gray-400 text-sm ml-6">
              Skip large conferences and events during daytime hours.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="avoidOverlyFormalNetworking"
                checked={avoidOverlyFormalNetworking}
                onCheckedChange={(checked) => setAvoidOverlyFormalNetworking(checked as boolean)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <div className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                <Label htmlFor="avoidOverlyFormalNetworking" className="text-white">
                  Avoid overly formal networking events
                </Label>
              </div>
            </div>
            <p className="text-gray-400 text-sm ml-6">
              Skip events that are too formal or strictly business-focused.
            </p>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

