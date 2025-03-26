"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function RestrictionsStep({ data, updateData, isMobile }) {
  const [avoidCrowdedDaytimeConferences, setAvoidCrowdedDaytimeConferences] = useState(
    data.avoidCrowdedDaytimeConferences || false,
  )
  const [avoidOverlyFormalNetworking, setAvoidOverlyFormalNetworking] = useState(
    data.avoidOverlyFormalNetworking || false,
  )
  const [noFamilyKidsEvents, setNoFamilyKidsEvents] = useState(data.noFamilyKidsEvents || false)

  useEffect(() => {
    // Only update when values actually change, not on every render
    const newData = {
      avoidCrowdedDaytimeConferences,
      avoidOverlyFormalNetworking,
      noFamilyKidsEvents,
    }

    // Check if data has actually changed before updating
    const hasChanged =
      avoidCrowdedDaytimeConferences !== data.avoidCrowdedDaytimeConferences ||
      avoidOverlyFormalNetworking !== data.avoidOverlyFormalNetworking ||
      noFamilyKidsEvents !== data.noFamilyKidsEvents

    if (hasChanged) {
      updateData(newData)
    }
  }, [avoidCrowdedDaytimeConferences, avoidOverlyFormalNetworking, noFamilyKidsEvents, data, updateData])

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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="text-center mb-4 sm:mb-6">
          <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white`}>Event Restrictions</h2>
          <p className="text-gray-400 text-sm">Let us know what types of events you'd like to avoid</p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 space-y-5 sm:space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-white text-sm sm:text-base">Avoid Crowded Daytime Conferences</Label>
            <p className="text-xs sm:text-sm text-gray-400">Skip large, busy conferences that happen during the day</p>
          </div>
          <Switch
            checked={avoidCrowdedDaytimeConferences}
            onCheckedChange={setAvoidCrowdedDaytimeConferences}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        <div className="border-t border-white/5 pt-5 sm:pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white text-sm sm:text-base">Avoid Overly Formal Networking</Label>
              <p className="text-xs sm:text-sm text-gray-400">Skip stiff, corporate-style networking events</p>
            </div>
            <Switch
              checked={avoidOverlyFormalNetworking}
              onCheckedChange={setAvoidOverlyFormalNetworking}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </div>

        <div className="border-t border-white/5 pt-5 sm:pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white text-sm sm:text-base">No Family/Kids Events</Label>
              <p className="text-xs sm:text-sm text-gray-400">Exclude events designed for families or children</p>
            </div>
            <Switch
              checked={noFamilyKidsEvents}
              onCheckedChange={setNoFamilyKidsEvents}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center text-gray-400 text-xs sm:text-sm mt-4">
        <p>These preferences help us filter out events that don't match your interests</p>
      </motion.div>
    </motion.div>
  )
}

