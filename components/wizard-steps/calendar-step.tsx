"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { CalendarDays, CalendarIcon, X, Plus } from "lucide-react"

export default function CalendarStep({ data, updateData, isMobile }) {
  const [calendarData, setCalendarData] = useState(data || {})
  const [selectedDate, setSelectedDate] = useState(null)
  const [eventType, setEventType] = useState("") // "Deliverable" or "Booked"
  const [eventDescription, setEventDescription] = useState("")

  useEffect(() => {
    // Only update when values actually change, not on every render
    if (JSON.stringify(calendarData) !== JSON.stringify(data)) {
      updateData(calendarData)
    }
  }, [calendarData, data, updateData])

  const addCalendarEvent = () => {
    if (selectedDate && eventType && eventDescription) {
      const dateStr = selectedDate.toISOString().split("T")[0]
      setCalendarData({
        ...calendarData,
        [dateStr]: `${eventType} – ${eventDescription}`,
      })
      setEventDescription("")
      setEventType("")
    }
  }

  const removeCalendarEvent = (dateStr) => {
    const newCalendarData = { ...calendarData }
    delete newCalendarData[dateStr]
    setCalendarData(newCalendarData)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

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

  // Function to determine if a date has an event
  const dateHasEvent = (date) => {
    const dateStr = date.toISOString().split("T")[0]
    return dateStr in calendarData
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="text-center mb-4 sm:mb-6">
          <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white`}>Calendar Availability</h2>
          <p className="text-gray-400 text-sm">Let us know your schedule to find events that fit your calendar</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="text-white text-sm"
              modifiers={{
                booked: (date) => {
                  const dateStr = date.toISOString().split("T")[0]
                  return dateStr in calendarData && calendarData[dateStr].startsWith("Booked")
                },
                deliverable: (date) => {
                  const dateStr = date.toISOString().split("T")[0]
                  return dateStr in calendarData && calendarData[dateStr].startsWith("Deliverable")
                },
              }}
              modifiersClassNames={{
                booked: "bg-indigo-900/50 text-white border border-indigo-500/30",
                deliverable: "bg-pink-900/50 text-white border border-pink-500/30",
              }}
            />
          </div>

          <Button
            variant="outline"
            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-sm"
            size={isMobile ? "sm" : "default"}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Connect Your Calendar
          </Button>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-600 mr-1"></div>
              <span className="text-gray-300">Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-pink-600 mr-1"></div>
              <span className="text-gray-300">Deliverable</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4"
            >
              <h3 className="text-white font-medium text-sm flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>

              <div className="space-y-3">
                <div>
                  <Label className="text-white text-xs sm:text-sm">Event Type</Label>
                  <div className="flex space-x-2 mt-1">
                    <Button
                      type="button"
                      variant={eventType === "Deliverable" ? "default" : "outline"}
                      className={
                        eventType === "Deliverable"
                          ? "bg-pink-600 hover:bg-pink-700 text-white"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }
                      onClick={() => setEventType("Deliverable")}
                      size={isMobile ? "sm" : "default"}
                    >
                      Deliverable
                    </Button>
                    <Button
                      type="button"
                      variant={eventType === "Booked" ? "default" : "outline"}
                      className={
                        eventType === "Booked"
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                      }
                      onClick={() => setEventType("Booked")}
                      size={isMobile ? "sm" : "default"}
                    >
                      Booked
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-white text-xs sm:text-sm">Description</Label>
                  <div className="flex mt-1">
                    <Input
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500 rounded-r-none text-sm"
                      placeholder="Event description"
                      onKeyDown={(e) => e.key === "Enter" && addCalendarEvent()}
                    />
                    <button
                      type="button"
                      onClick={addCalendarEvent}
                      disabled={!eventType || !eventDescription}
                      className="px-3 sm:px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-r-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={isMobile ? 16 : 18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <Label className="text-white text-sm">Your Calendar Events</Label>
            <div className="space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2">
              {Object.entries(calendarData).length > 0 ? (
                Object.entries(calendarData)
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([dateStr, event], index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex justify-between items-center p-2 sm:p-3 rounded-lg ${
                        event.startsWith("Deliverable")
                          ? "bg-pink-900/20 border border-pink-500/30"
                          : "bg-indigo-900/20 border border-indigo-500/30"
                      }`}
                    >
                      <div>
                        <p className="text-white text-xs sm:text-sm font-medium">{formatDate(dateStr)}</p>
                        <p className="text-gray-300 text-xs">{event}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCalendarEvent(dateStr)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={isMobile ? 14 : 16} />
                      </button>
                    </motion.div>
                  ))
              ) : (
                <p className="text-gray-400 text-xs sm:text-sm">No events added yet. Select a date to add an event.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

