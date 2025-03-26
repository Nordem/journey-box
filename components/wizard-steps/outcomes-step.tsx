"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

export default function OutcomesStep({ data, updateData, isMobile }) {
  const [outcomes, setOutcomes] = useState(data || [])
  const [outcome, setOutcome] = useState("")

  // Suggested outcomes
  const suggestedOutcomes = [
    "Meet interesting people in music or tech",
    "Discover creative or artistic inspiration",
    "Build potential collaborations",
    "Enjoy music and good vibes",
    "Explore new venues with style",
    "Learn new skills or technologies",
    "Find potential business partners",
    "Expand professional network",
  ]

  useEffect(() => {
    // Only update when values actually change, not on every render
    if (JSON.stringify(outcomes) !== JSON.stringify(data)) {
      updateData(outcomes)
    }
  }, [outcomes, data, updateData])

  const addOutcome = (o) => {
    if (o && !outcomes.includes(o)) {
      setOutcomes([...outcomes, o])
      setOutcome("")
    }
  }

  const removeOutcome = (o) => {
    setOutcomes(outcomes.filter((item) => item !== o))
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
      <motion.div variants={itemVariants}>
        <div className="text-center mb-4 sm:mb-6">
          <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white`}>Ideal Outcomes</h2>
          <p className="text-gray-400 text-sm">What do you hope to achieve from attending events?</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-white">Your Ideal Outcomes</Label>
        <div className="flex">
          <Input
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            className="bg-white/5 border-white/10 text-white focus:border-purple-500 focus:ring-purple-500 rounded-r-none"
            placeholder="Add an outcome"
            onKeyDown={(e) => e.key === "Enter" && addOutcome(outcome)}
          />
          <button
            type="button"
            onClick={() => addOutcome(outcome)}
            className="px-3 sm:px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-r-md flex items-center justify-center"
          >
            <Plus size={isMobile ? 16 : 18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {outcomes.map((o, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-indigo-900/50 hover:bg-indigo-800/50 text-white border border-indigo-500/30 px-2 py-1 text-xs sm:text-sm"
            >
              {o}
              <button
                type="button"
                onClick={() => removeOutcome(o)}
                className="ml-1 sm:ml-2 text-white/70 hover:text-white"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </Badge>
          ))}
        </div>

        <div className="mt-3 sm:mt-4">
          <p className="text-xs text-gray-400 mb-1">Suggested outcomes:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {suggestedOutcomes
              .filter((o) => !outcomes.includes(o))
              .map((o, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 cursor-pointer text-xs"
                  onClick={() => addOutcome(o)}
                >
                  + {o}
                </Badge>
              ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 mt-4 sm:mt-6"
      >
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="bg-purple-600/20 rounded-full p-2 sm:p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={isMobile ? "20" : "24"}
              height={isMobile ? "20" : "24"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-400"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium text-sm sm:text-base">Why this matters</h3>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">
              Understanding your ideal outcomes helps us recommend events that align with your goals and aspirations.
              Whether you're looking to network, find inspiration, or just have a good time, we'll tailor our
              suggestions accordingly.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

