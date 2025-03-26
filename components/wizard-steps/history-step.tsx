"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Trash2 } from "lucide-react"

export default function HistoryStep({ data, updateData, isMobile }) {
  const [recentEventsAttended, setRecentEventsAttended] = useState(data.recentEventsAttended || [])
  const [eventName, setEventName] = useState("")
  const [eventFeedback, setEventFeedback] = useState(data.eventFeedback || {})
  const [currentEventForFeedback, setCurrentEventForFeedback] = useState("")
  const [currentFeedback, setCurrentFeedback] = useState("")

  useEffect(() => {
    // Only update when values actually change, not on every render
    const newData = {
      recentEventsAttended,
      eventFeedback,
    }

    // Check if data has actually changed before updating
    const hasChanged =
      JSON.stringify(recentEventsAttended) !== JSON.stringify(data.recentEventsAttended) ||
      JSON.stringify(eventFeedback) !== JSON.stringify(data.eventFeedback)

    if (hasChanged) {
      updateData(newData)
    }
  }, [recentEventsAttended, eventFeedback, data, updateData])

  const addEvent = () => {
    if (eventName && !recentEventsAttended.includes(eventName)) {
      setRecentEventsAttended([...recentEventsAttended, eventName])
      setEventName("")
    }
  }

  const removeEvent = (event) => {
    setRecentEventsAttended(recentEventsAttended.filter((e) => e !== event))

    // Also remove any feedback for this event
    const newFeedback = { ...eventFeedback }
    delete newFeedback[event]
    setEventFeedback(newFeedback)
  }

  const addFeedback = () => {
    if (currentEventForFeedback && currentFeedback) {
      setEventFeedback({
        ...eventFeedback,
        [currentEventForFeedback]: currentFeedback,
      })
      setCurrentFeedback("")
      setCurrentEventForFeedback("")
    }
  }

  const removeFeedback = (event) => {
    const newFeedback = { ...eventFeedback }
    delete newFeedback[event]
    setEventFeedback(newFeedback)
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-white">Recent Events Attended</Label>
        <div className="flex">
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500 rounded-r-none"
            placeholder="Add an event you've attended"
            onKeyDown={(e) => e.key === "Enter" && addEvent()}
          />
          <button
            type="button"
            onClick={addEvent}
            className="px-3 sm:px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-r-md flex items-center justify-center"
          >
            <Plus size={isMobile ? 16 : 18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {recentEventsAttended.map((event, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-purple-900/50 hover:bg-purple-800/50 text-white border border-purple-500/30 px-2 py-1 text-xs sm:text-sm"
            >
              {event}
              <button
                type="button"
                onClick={() => removeEvent(event)}
                className="ml-1 sm:ml-2 text-white/70 hover:text-white"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </Badge>
          ))}
        </div>

        {recentEventsAttended.length === 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Add events you've recently attended to help us understand your preferences.
          </p>
        )}
      </motion.div>

      {recentEventsAttended.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-2">
          <Label className="text-white">Event Feedback</Label>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">Select an event to provide feedback</Label>
              <select
                value={currentEventForFeedback}
                onChange={(e) => setCurrentEventForFeedback(e.target.value)}
                className="w-full bg-white/5 border-white/10 text-white rounded-md p-2 focus:border-purple-500 focus:ring-purple-500 text-sm"
              >
                <option value="">Select an event</option>
                {recentEventsAttended
                  .filter((event) => !eventFeedback[event])
                  .map((event, index) => (
                    <option key={index} value={event}>
                      {event}
                    </option>
                  ))}
              </select>
            </div>

            {currentEventForFeedback && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Your feedback for {currentEventForFeedback}</Label>
                <Textarea
                  value={currentFeedback}
                  onChange={(e) => setCurrentFeedback(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500 text-sm"
                  placeholder="What did you like or dislike about this event?"
                  rows={3}
                />
                <button
                  type="button"
                  onClick={addFeedback}
                  className="mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center text-sm"
                >
                  <Plus size={isMobile ? 14 : 16} className="mr-1 sm:mr-2" />
                  Add Feedback
                </button>
              </div>
            )}
          </div>

          {Object.keys(eventFeedback).length > 0 && (
            <div className="mt-4 space-y-3">
              <Label className="text-white">Your Feedback</Label>
              <div className="space-y-3">
                {Object.entries(eventFeedback).map(([event, feedback], index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 relative"
                  >
                    <h3 className="text-purple-400 font-medium text-sm">{event}</h3>
                    <p className="text-white mt-1 text-sm">{feedback}</p>
                    <button
                      type="button"
                      onClick={() => removeFeedback(event)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      <Trash2 size={isMobile ? 14 : 16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

