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
        <Label className="text-white text-lg font-semibold">Recent Events Attended</Label>
        <div className="flex">
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="bg-white/90 border-white/20 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500 rounded-r-none"
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
              className="bg-purple-900/50 hover:bg-purple-800/50 text-white border border-purple-500/30 px-3 py-1.5 text-sm"
            >
              {event}
              <button
                type="button"
                onClick={() => removeEvent(event)}
                className="ml-2 text-white/70 hover:text-white"
              >
                <X size={isMobile ? 14 : 16} />
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
        <motion.div variants={itemVariants} className="space-y-4">
          <Label className="text-white text-lg font-semibold">Event Feedback</Label>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white text-sm">Select an event to provide feedback</Label>
              <select
                value={currentEventForFeedback}
                onChange={(e) => setCurrentEventForFeedback(e.target.value)}
                className="w-full bg-white/10 border-white/20 text-white rounded-md p-2.5 focus:border-purple-500 focus:ring-purple-500 text-sm"
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
              <div className="space-y-3">
                <Label className="text-white text-sm">Your feedback for {currentEventForFeedback}</Label>
                <Textarea
                  value={currentFeedback}
                  onChange={(e) => setCurrentFeedback(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-500 focus:ring-purple-500 text-sm min-h-[120px] p-3"
                  placeholder="What did you like or dislike about this event?"
                  rows={4}
                />
                <button
                  type="button"
                  onClick={addFeedback}
                  className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md flex items-center justify-center text-sm font-medium"
                >
                  <Plus size={isMobile ? 16 : 18} className="mr-2" />
                  Add Feedback
                </button>
              </div>
            )}
          </div>

          {Object.keys(eventFeedback).length > 0 && (
            <div className="mt-6 space-y-4">
              <Label className="text-white text-lg font-semibold">Your Feedback</Label>
              <div className="space-y-4">
                {Object.entries(eventFeedback).map(([event, feedback], index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 border border-white/20 rounded-lg p-4 relative"
                  >
                    <h3 className="text-purple-400 font-medium text-sm mb-2">{event}</h3>
                    <p className="text-white/90 text-sm leading-relaxed">{feedback}</p>
                    <button
                      type="button"
                      onClick={() => removeFeedback(event)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                    >
                      <Trash2 size={isMobile ? 16 : 18} />
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

