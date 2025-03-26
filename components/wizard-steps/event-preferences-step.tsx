"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"

interface EventPreferencesData {
  categories: string[];
  vibeKeywords: string[];
  idealTimeSlots: string[];
  budget: string;
  preferredGroupType: string[];
  preferredEventSize: string[];
  maxDistanceKm: number;
}

interface EventPreferencesStepProps {
  data: EventPreferencesData;
  updateData: (data: EventPreferencesData) => void;
  isMobile: boolean;
}

export default function EventPreferencesStep({ data, updateData, isMobile }: EventPreferencesStepProps) {
  const [categories, setCategories] = useState(data.categories || [])
  const [category, setCategory] = useState("")
  const [vibeKeywords, setVibeKeywords] = useState(data.vibeKeywords || [])
  const [vibe, setVibe] = useState("")
  const [idealTimeSlots, setIdealTimeSlots] = useState(data.idealTimeSlots || [])
  const [budget, setBudget] = useState(data.budget || "medium")
  const [preferredGroupType, setPreferredGroupType] = useState(data.preferredGroupType || [])
  const [preferredEventSize, setPreferredEventSize] = useState(data.preferredEventSize || [])
  const [maxDistanceKm, setMaxDistanceKm] = useState(data.maxDistanceKm || 20)

  // Suggested options
  const suggestedCategories = [
    "Electronic Music Events",
    "Startup & Tech Meetups",
    "Indie Art or Culture Pop-Ups",
    "Entrepreneur Networking Mixers",
    "Chill Social Hangouts",
    "DJ Performances",
    "AI/Creative Tech Conferences",
  ]

  const suggestedVibes = [
    "chill",
    "underground",
    "exclusive",
    "minimalist",
    "aesthetic",
    "intellectual",
    "experimental",
    "creative energy",
    "nightlife",
    "casual networking",
  ]

  const timeSlotOptions = ["mornings", "afternoons", "evenings", "nights", "weekends", "weekdays"]
  const groupTypeOptions = ["solo", "small group", "large group", "creative circles", "professional network"]
  const eventSizeOptions = ["intimate", "small", "medium", "large", "exclusive"]

  useEffect(() => {
    // Only update when values actually change, not on every render
    const newData = {
      categories,
      vibeKeywords,
      idealTimeSlots,
      budget,
      preferredGroupType,
      preferredEventSize,
      maxDistanceKm,
    }

    // Check if data has actually changed before updating
    const hasChanged =
      JSON.stringify(categories) !== JSON.stringify(data.categories) ||
      JSON.stringify(vibeKeywords) !== JSON.stringify(data.vibeKeywords) ||
      JSON.stringify(idealTimeSlots) !== JSON.stringify(data.idealTimeSlots) ||
      budget !== data.budget ||
      JSON.stringify(preferredGroupType) !== JSON.stringify(data.preferredGroupType) ||
      JSON.stringify(preferredEventSize) !== JSON.stringify(data.preferredEventSize) ||
      maxDistanceKm !== data.maxDistanceKm

    if (hasChanged) {
      updateData(newData)
    }
  }, [
    categories,
    vibeKeywords,
    idealTimeSlots,
    budget,
    preferredGroupType,
    preferredEventSize,
    maxDistanceKm,
    data,
    updateData,
  ])

  const addCategory = (cat: string) => {
    if (cat && !categories.includes(cat)) {
      const newCategories = [...categories, cat]
      setCategories(newCategories)
      updateData({ ...data, categories: newCategories })
      setCategory("")
    }
  }

  const removeCategory = (cat: string) => {
    setCategories(categories.filter((c) => c !== cat))
    updateData({ ...data, categories: categories.filter((c) => c !== cat) })
  }

  const addVibe = (v: string) => {
    if (v && !vibeKeywords.includes(v)) {
      const newVibes = [...vibeKeywords, v]
      setVibeKeywords(newVibes)
      updateData({ ...data, vibeKeywords: newVibes })
      setVibe("")
    }
  }

  const removeVibe = (v: string) => {
    setVibeKeywords(vibeKeywords.filter((vk) => vk !== v))
    updateData({ ...data, vibeKeywords: vibeKeywords.filter((vk) => vk !== v) })
  }

  const toggleTimeSlot = (slot: string) => {
    const newSlots = idealTimeSlots.includes(slot)
      ? idealTimeSlots.filter((s) => s !== slot)
      : [...idealTimeSlots, slot]
    setIdealTimeSlots(newSlots)
    updateData({ ...data, idealTimeSlots: newSlots })
  }

  const toggleGroupType = (type: string) => {
    const newTypes = preferredGroupType.includes(type)
      ? preferredGroupType.filter((t) => t !== type)
      : [...preferredGroupType, type]
    setPreferredGroupType(newTypes)
    updateData({ ...data, preferredGroupType: newTypes })
  }

  const toggleEventSize = (size: string) => {
    const newSizes = preferredEventSize.includes(size)
      ? preferredEventSize.filter((s) => s !== size)
      : [...preferredEventSize, size]
    setPreferredEventSize(newSizes)
    updateData({ ...data, preferredEventSize: newSizes })
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
        <Label className="text-gray-700">Event Categories</Label>
        <div className="flex">
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-r-none"
            placeholder="Add a category"
            onKeyDown={(e) => e.key === "Enter" && addCategory(category)}
          />
          <button
            type="button"
            onClick={() => addCategory(category)}
            className="px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center"
          >
            <Plus size={isMobile ? 16 : 18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((cat, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 border border-blue-200 px-2 py-1 text-xs sm:text-sm"
            >
              {cat}
              <button
                type="button"
                onClick={() => removeCategory(cat)}
                className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </Badge>
          ))}
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Suggested categories:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {suggestedCategories
              .filter((c) => !categories.includes(c))
              .map((c, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 cursor-pointer text-xs"
                  onClick={() => addCategory(c)}
                >
                  + {c}
                </Badge>
              ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Vibe Keywords</Label>
        <div className="flex">
          <Input
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className="bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-blue-500 rounded-r-none"
            placeholder="Add a vibe"
            onKeyDown={(e) => e.key === "Enter" && addVibe(vibe)}
          />
          <button
            type="button"
            onClick={() => addVibe(vibe)}
            className="px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md flex items-center justify-center"
          >
            <Plus size={isMobile ? 16 : 18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {vibeKeywords.map((v, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200 px-2 py-1 text-xs sm:text-sm"
            >
              {v}
              <button
                type="button"
                onClick={() => removeVibe(v)}
                className="ml-1 sm:ml-2 text-indigo-600 hover:text-indigo-800"
              >
                <X size={isMobile ? 12 : 14} />
              </button>
            </Badge>
          ))}
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-1">Suggested vibes:</p>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {suggestedVibes
              .filter((v) => !vibeKeywords.includes(v))
              .map((v, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-700 cursor-pointer text-xs"
                  onClick={() => addVibe(v)}
                >
                  + {v}
                </Badge>
              ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Ideal Time Slots</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {timeSlotOptions.map((slot) => (
            <div key={slot} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${slot}`}
                checked={idealTimeSlots.includes(slot)}
                onCheckedChange={() => toggleTimeSlot(slot)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <label
                htmlFor={`time-${slot}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                {slot.charAt(0).toUpperCase() + slot.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Maximum Distance (km): {maxDistanceKm}</Label>
        <Slider
          value={[maxDistanceKm]}
          onValueChange={([value]) => setMaxDistanceKm(value)}
          max={100}
          step={1}
          className="[&_[role=slider]]:bg-blue-500"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Budget</Label>
        <RadioGroup value={budget} onValueChange={setBudget} className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="low" id="budget-low" className="border-gray-300 text-blue-500" />
            <label htmlFor="budget-low" className="text-gray-700 text-sm">
              Low
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="medium" id="budget-medium" className="border-gray-300 text-blue-500" />
            <label htmlFor="budget-medium" className="text-gray-700 text-sm">
              Medium
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="high" id="budget-high" className="border-gray-300 text-blue-500" />
            <label htmlFor="budget-high" className="text-gray-700 text-sm">
              High
            </label>
          </div>
        </RadioGroup>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Preferred Group Type</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {groupTypeOptions.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`group-${type}`}
                checked={preferredGroupType.includes(type)}
                onCheckedChange={() => toggleGroupType(type)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <label
                htmlFor={`group-${type}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                {type
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </label>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2">
        <Label className="text-gray-700">Preferred Event Size</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {eventSizeOptions.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={preferredEventSize.includes(size)}
                onCheckedChange={() => toggleEventSize(size)}
                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              />
              <label
                htmlFor={`size-${size}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </label>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

