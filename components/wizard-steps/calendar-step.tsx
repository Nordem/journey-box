"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { CalendarDays, CalendarIcon, X, Plus, Clock } from "lucide-react"
import type { DayPickerSingleProps } from "react-day-picker"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CalendarData {
  availableDays: Date[]
  preferredTimeSlots: string[]
}

interface CalendarStepProps {
  data: CalendarData
  updateData: (data: CalendarData) => void
  isMobile: boolean
}

const timeSlots = [
  "Morning (6am-12pm)",
  "Afternoon (12pm-5pm)",
  "Evening (5pm-9pm)",
  "Night (9pm-12am)",
]

export default function CalendarStep({ data, updateData, isMobile }: CalendarStepProps) {
  const [availableDays, setAvailableDays] = useState<Date[]>(data.availableDays || [])
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>(
    data.preferredTimeSlots || [],
  )

  useEffect(() => {
    updateData({
      availableDays,
      preferredTimeSlots,
    })
  }, [availableDays, preferredTimeSlots, updateData])

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

  const toggleTimeSlot = (slot: string) => {
    setPreferredTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-white">Availability</h2>
        <p className="text-gray-400">
          Select your available days and preferred time slots for events.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 bg-gray-800/80 border-gray-700">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Available Days</h3>
            </div>
            <Calendar
              mode="multiple"
              selected={availableDays}
              onSelect={(days) => setAvailableDays(days || [])}
              className="rounded-md border border-gray-700"
              classNames={{
                day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                day_today: "bg-gray-700 text-white",
                day_disabled: "text-gray-500",
                day_range_middle: "bg-gray-700 text-white",
                day_hidden: "invisible",
                head_cell: "text-gray-400",
                cell: "text-white",
                button: "hover:bg-gray-700",
              }}
            />
          </motion.div>
        </Card>

        <Card className="p-6 bg-gray-800/80 border-gray-700">
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-white">Preferred Time Slots</h3>
            </div>
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <motion.div
                  key={slot}
                  variants={itemVariants}
                  className={cn(
                    "flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors",
                    preferredTimeSlots.includes(slot)
                      ? "bg-blue-500/20 border border-blue-500"
                      : "bg-gray-700/50 border border-gray-600 hover:bg-gray-700",
                  )}
                  onClick={() => toggleTimeSlot(slot)}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      preferredTimeSlots.includes(slot)
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-500",
                    )}
                  >
                    {preferredTimeSlots.includes(slot) && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <Label className="text-white cursor-pointer">{slot}</Label>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Card>
      </div>
    </motion.div>
  )
}

