"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"

interface UserProfileData {
  name: string;
  location: string;
  currentTravelLocation?: string;
  languages: string[];
  personalityTraits: string[];
  goals: string[];
}

interface UserProfileStepProps {
  data: UserProfileData;
  updateData: (data: UserProfileData) => void;
  isMobile: boolean;
}

export default function UserProfileStep({ data, updateData, isMobile }: UserProfileStepProps) {
  const [name, setName] = useState(data.name || "")
  const [location, setLocation] = useState(data.location || "")
  const [currentTravelLocation, setCurrentTravelLocation] = useState(data.currentTravelLocation || "")
  const [language, setLanguage] = useState("")
  const [languages, setLanguages] = useState(data.languages || [])
  const [trait, setTrait] = useState("")
  const [personalityTraits, setPersonalityTraits] = useState(data.personalityTraits || [])
  const [goal, setGoal] = useState("")
  const [goals, setGoals] = useState(data.goals || [])

  // Suggested options
  const suggestedTraits = [
    "chill",
    "social",
    "creative",
    "ambitious",
    "curious",
    "adventurous",
    "analytical",
    "energetic",
  ]
  const suggestedGoals = [
    "meet new people",
    "find networking opportunities",
    "discover party scenes",
    "attend music, art, or tech events",
    "explore indie scenes",
    "learn about startups",
  ]

  useEffect(() => {
    // Only update when values actually change, not on every render
    const newData = {
      name,
      location,
      currentTravelLocation,
      languages,
      personalityTraits,
      goals,
    }

    // Check if data has actually changed before updating
    const hasChanged =
      name !== data.name ||
      location !== data.location ||
      currentTravelLocation !== data.currentTravelLocation ||
      JSON.stringify(languages) !== JSON.stringify(data.languages) ||
      JSON.stringify(personalityTraits) !== JSON.stringify(data.personalityTraits) ||
      JSON.stringify(goals) !== JSON.stringify(data.goals)

    if (hasChanged) {
      updateData(newData)
    }
  }, [name, location, currentTravelLocation, languages, personalityTraits, goals, data, updateData])

  const addLanguage = () => {
    if (language && !languages.includes(language)) {
      setLanguages([...languages, language])
      setLanguage("")
    }
  }

  const removeLanguage = (lang: string) => {
    setLanguages(languages.filter((l: string) => l !== lang))
  }

  const addTrait = (t: string) => {
    if (t && !personalityTraits.includes(t)) {
      setPersonalityTraits([...personalityTraits, t])
      setTrait("")
    }
  }

  const removeTrait = (t: string) => {
    setPersonalityTraits(personalityTraits.filter((pt: string) => pt !== t))
  }

  const addGoal = (g: string) => {
    if (g && !goals.includes(g)) {
      setGoals([...goals, g])
      setGoal("")
    }
  }

  const removeGoal = (g: string) => {
    setGoals(goals.filter((gl: string) => gl !== g))
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
        <Label htmlFor="name" className="text-gray-700">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Your name"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="location" className="text-gray-700">
          Home Location
        </Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Tijuana, B.C., Mexico"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="currentTravelLocation" className="text-gray-700">
          Current Travel Location
        </Label>
        <Input
          id="currentTravelLocation"
          value={currentTravelLocation}
          onChange={(e) => setCurrentTravelLocation(e.target.value)}
          className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Tokyo, Japan"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label htmlFor="languages" className="text-gray-700">
          Languages
        </Label>
        <div className="flex">
          <Input
            id="languages"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-r-none"
            placeholder="Add a language"
            onKeyDown={(e) => e.key === "Enter" && addLanguage()}
          />
          <button
            type="button"
            onClick={addLanguage}
            className="px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center"
          >
            <Plus size={isMobile ? 16 : 18} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {languages.map((lang, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 px-2 py-1 text-xs sm:text-sm"
            >
              {lang}
              <button
                type="button"
                onClick={() => removeLanguage(lang)}
                className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </Badge>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Personality Traits</Label>
        <div className="flex">
          <Input
            value={trait}
            onChange={(e) => setTrait(e.target.value)}
            className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-r-none"
            placeholder="Add a trait"
            onKeyDown={(e) => e.key === "Enter" && addTrait(trait)}
          />
          <button
            type="button"
            onClick={() => addTrait(trait)}
            className="px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center"
          >
            <Plus size={isMobile ? 16 : 18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {personalityTraits.map((t, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200 px-2 py-1 text-xs sm:text-sm"
            >
              {t}
              <button
                type="button"
                onClick={() => removeTrait(t)}
                className="ml-1 sm:ml-2 text-indigo-600 hover:text-indigo-800"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </Badge>
          ))}
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Suggested traits:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {suggestedTraits
              .filter((t) => !personalityTraits.includes(t))
              .map((t, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 cursor-pointer text-xs"
                  onClick={() => addTrait(t)}
                >
                  + {t}
                </Badge>
              ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Goals</Label>
        <div className="flex">
          <Input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-r-none"
            placeholder="Add a goal"
            onKeyDown={(e) => e.key === "Enter" && addGoal(goal)}
          />
          <button
            type="button"
            onClick={() => addGoal(goal)}
            className="px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center"
          >
            <Plus size={isMobile ? 16 : 18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {goals.map((g, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 px-2 py-1 text-xs sm:text-sm"
            >
              {g}
              <button
                type="button"
                onClick={() => removeGoal(g)}
                className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </Badge>
          ))}
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Suggested goals:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {suggestedGoals
              .filter((g) => !goals.includes(g))
              .map((g, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 cursor-pointer text-xs"
                  onClick={() => addGoal(g)}
                >
                  + {g}
                </Badge>
              ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

