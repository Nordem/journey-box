"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Briefcase, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Calendar, DollarSign, MapPin, Clock, Tag } from "lucide-react"

interface EventPreferencesData {
  categories: string[];
  vibeKeywords: string[];
  idealTimeSlots: string[];
  budget: string;
  preferredGroupType: string[];
  preferredEventSize: string[];
  maxDistanceKm: number;
  restrictions: {
    avoidFamilyKidsEvents: boolean;
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
  };
}

interface EventPreferencesStepProps {
  data: EventPreferencesData;
  updateData: (data: EventPreferencesData) => void;
  isMobile: boolean;
}

export default function EventPreferencesStep({ data, updateData, isMobile }: EventPreferencesStepProps) {
  const [categories, setCategories] = useState<string[]>(data.categories || [])
  const [vibeKeywords, setVibeKeywords] = useState<string[]>(data.vibeKeywords || [])
  const [idealTimeSlots, setIdealTimeSlots] = useState<string[]>(data.idealTimeSlots || [])
  const [budget, setBudget] = useState(data.budget || "medium")
  const [preferredGroupType, setPreferredGroupType] = useState<string[]>(data.preferredGroupType || [])
  const [preferredEventSize, setPreferredEventSize] = useState<string[]>(data.preferredEventSize || [])
  const [maxDistanceKm, setMaxDistanceKm] = useState(data.maxDistanceKm || 1000)
  const [restrictions, setRestrictions] = useState(data.restrictions || {
    avoidFamilyKidsEvents: false,
    avoidCrowdedDaytimeConferences: false,
    avoidOverlyFormalNetworking: false
  })
  const [newCategory, setNewCategory] = useState("")
  const [newVibeKeyword, setNewVibeKeyword] = useState("")

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

  const timeSlotOptions = ["morning", "afternoon", "evening", "night"]
  const groupTypeOptions = ["solo", "small group", "large group", "networking"]
  const eventSizeOptions = ["intimate", "medium", "large", "massive"]

  useEffect(() => {
    // Only update if the data has actually changed
    const hasChanged = 
      JSON.stringify({
        categories,
        vibeKeywords,
        idealTimeSlots,
        budget,
        preferredGroupType,
        preferredEventSize,
        maxDistanceKm,
        restrictions
      }) !== JSON.stringify(data);

    if (hasChanged) {
      updateData({
        categories,
        vibeKeywords,
        idealTimeSlots,
        budget,
        preferredGroupType,
        preferredEventSize,
        maxDistanceKm,
        restrictions
      });
    }
  }, [
    categories,
    vibeKeywords,
    idealTimeSlots,
    budget,
    preferredGroupType,
    preferredEventSize,
    maxDistanceKm,
    restrictions,
    data,
    updateData
  ]);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory("")
    }
  }

  const removeCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category))
  }

  const addVibeKeyword = () => {
    if (newVibeKeyword.trim() && !vibeKeywords.includes(newVibeKeyword.trim())) {
      setVibeKeywords([...vibeKeywords, newVibeKeyword.trim()])
      setNewVibeKeyword("")
    }
  }

  const removeVibeKeyword = (keyword: string) => {
    setVibeKeywords(vibeKeywords.filter((k) => k !== keyword))
  }

  const toggleTimeSlot = (slot: string) => {
    const newSlots = idealTimeSlots.includes(slot)
      ? idealTimeSlots.filter((s) => s !== slot)
      : [...idealTimeSlots, slot]
    setIdealTimeSlots(newSlots)
  }

  const toggleGroupType = (type: string) => {
    const newTypes = preferredGroupType.includes(type)
      ? preferredGroupType.filter((t) => t !== type)
      : [...preferredGroupType, type]
    setPreferredGroupType(newTypes)
  }

  const toggleEventSize = (size: string) => {
    const newSizes = preferredEventSize.includes(size)
      ? preferredEventSize.filter((s) => s !== size)
      : [...preferredEventSize, size]
    setPreferredEventSize(newSizes)
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h2 className="text-2xl font-bold mb-2 text-white">Event Preferences</h2>
        <p className="text-gray-400">
          Tell us about your preferences for events and activities.
        </p>
      </motion.div>

      <Card className="p-6 bg-gray-800/80 border-gray-700">
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Categories</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="Add a category"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="bg-gray-700/70 text-white hover:bg-gray-600/70"
                >
                  {category}
                  <button
                    onClick={() => removeCategory(category)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Vibe Keywords</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={newVibeKeyword}
                onChange={(e) => setNewVibeKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addVibeKeyword()}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="Add a vibe keyword"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {vibeKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="bg-gray-700/70 text-white hover:bg-gray-600/70"
                >
                  {keyword}
                  <button
                    onClick={() => removeVibeKeyword(keyword)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Ideal Time Slots</Label>
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
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                  >
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Maximum Distance (km): {maxDistanceKm}</Label>
            <Slider
              value={[maxDistanceKm]}
              onValueChange={([value]) => setMaxDistanceKm(value)}
              max={100}
              step={1}
              className="[&_[role=slider]]:bg-blue-500"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Budget</Label>
            <RadioGroup value={budget} onValueChange={setBudget} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="budget-low" className="border-gray-300 text-blue-500" />
                <label htmlFor="budget-low" className="text-white text-sm">
                  Low
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="budget-medium" className="border-gray-300 text-blue-500" />
                <label htmlFor="budget-medium" className="text-white text-sm">
                  Medium
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="budget-high" className="border-gray-300 text-blue-500" />
                <label htmlFor="budget-high" className="text-white text-sm">
                  High
                </label>
              </div>
            </RadioGroup>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Preferred Group Type</Label>
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
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
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
            <Label className="text-white">Preferred Event Size</Label>
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
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white"
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Restrictions</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="avoidFamilyKidsEvents"
                  checked={restrictions.avoidFamilyKidsEvents}
                  onCheckedChange={(checked) => setRestrictions({ ...restrictions, avoidFamilyKidsEvents: checked as boolean })}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <Label htmlFor="avoidFamilyKidsEvents" className="text-white">
                    Avoid family and kids events
                  </Label>
                </div>
              </div>
              <p className="text-gray-400 text-sm ml-6">
                Skip events that are primarily focused on family activities or children.
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="avoidCrowdedDaytimeConferences"
                  checked={restrictions.avoidCrowdedDaytimeConferences}
                  onCheckedChange={(checked) => setRestrictions({ ...restrictions, avoidCrowdedDaytimeConferences: checked as boolean })}
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="avoidOverlyFormalNetworking"
                  checked={restrictions.avoidOverlyFormalNetworking}
                  onCheckedChange={(checked) => setRestrictions({ ...restrictions, avoidOverlyFormalNetworking: checked as boolean })}
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
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

