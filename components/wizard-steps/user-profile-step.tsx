"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { User, MapPin, Globe, Languages, Heart, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

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
  const [languages, setLanguages] = useState<string[]>(data.languages || [])
  const [personalityTraits, setPersonalityTraits] = useState<string[]>(data.personalityTraits || [])
  const [goals, setGoals] = useState<string[]>(data.goals || [])
  const [newLanguage, setNewLanguage] = useState("")
  const [newTrait, setNewTrait] = useState("")
  const [newGoal, setNewGoal] = useState("")

  useEffect(() => {
    const hasChanged = 
      JSON.stringify({
        name,
        location,
        currentTravelLocation,
        languages,
        personalityTraits,
        goals
      }) !== JSON.stringify(data);

    if (hasChanged) {
      updateData({
        name,
        location,
        currentTravelLocation,
        languages,
        personalityTraits,
        goals
      });
    }
  }, [name, location, currentTravelLocation, languages, personalityTraits, goals, data, updateData]);

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()])
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setLanguages(languages.filter((l) => l !== language))
  }

  const addTrait = () => {
    if (newTrait.trim() && !personalityTraits.includes(newTrait.trim())) {
      setPersonalityTraits([...personalityTraits, newTrait.trim()])
      setNewTrait("")
    }
  }

  const removeTrait = (trait: string) => {
    setPersonalityTraits(personalityTraits.filter((t) => t !== trait))
  }

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()])
      setNewGoal("")
    }
  }

  const removeGoal = (goal: string) => {
    setGoals(goals.filter((g) => g !== goal))
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
      <motion.div
        variants={itemVariants}
        className="text-center mb-8"
      >
        <h1 className="text-2xl font-bold text-white mb-4">¡Bienvenido a Journey Box!</h1>
        <p className="text-gray-300 mb-6">
          Personaliza tu experiencia compartiendo tus preferencias y descubre viajes hechos para ti. Cuéntanos sobre tus gustos para ofrecerte experiencias únicas y conectarte con personas afines.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Experiencias personalizadas</h3>
            <p className="text-gray-300">Viajes y actividades adaptados a tus gustos</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Encuentra afinidades</h3>
            <p className="text-gray-300">Conecta con compañeros que comparten tus intereses</p>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Mejora el team building</h3>
            <p className="text-gray-300">Actividades grupales que realmente disfrutarás</p>
          </div>
        </div>
      </motion.div>

      <Card className="p-6 bg-gray-800/80 border-gray-700">
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="name" className="text-white">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="Your full name"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="location" className="text-white">Home Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="e.g., Tijuana, B.C., Mexico"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="currentTravelLocation" className="text-white">Current Travel Location</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="currentTravelLocation"
                value={currentTravelLocation}
                onChange={(e) => setCurrentTravelLocation(e.target.value)}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="e.g., Tokyo, Japan"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Languages</Label>
            <div className="relative">
              <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLanguage()}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="Add a language"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {languages.map((language) => (
                <Badge
                  key={language}
                  variant="secondary"
                  className="bg-gray-700/70 text-white hover:bg-gray-600/70"
                >
                  {language}
                  <button
                    onClick={() => removeLanguage(language)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Personality Traits</Label>
            <div className="relative">
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTrait()}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="Add a personality trait"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {personalityTraits.map((trait) => (
                <Badge
                  key={trait}
                  variant="secondary"
                  className="bg-gray-700/70 text-white hover:bg-gray-600/70"
                >
                  {trait}
                  <button
                    onClick={() => removeTrait(trait)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-white">Goals</Label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
                placeholder="Add a goal"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {goals.map((goal) => (
                <Badge
                  key={goal}
                  variant="secondary"
                  className="bg-gray-700/70 text-white hover:bg-gray-600/70"
                >
                  {goal}
                  <button
                    onClick={() => removeGoal(goal)}
                    className="ml-1 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

