"use client"

import { useState } from "react"
// import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { motion } from "framer-motion"
import { Check, Box, BarChart2, Users } from "lucide-react"

interface PersonalityInterestsStepProps {
  data: {
    personalityTraits: string[];
    hobbiesAndInterests: string[];
    additionalInfo?: string;
  };
  updateData: (data: any) => void;
}

const personalityTraits = [
  { icon: "👋", label: "Sociable" },
  { icon: "😌", label: "Introvertido" },
  { icon: "🎨", label: "Creativo" },
  { icon: "🚀", label: "Estructurado" },
  { icon: "🔍", label: "Curioso" },
  { icon: "🧗", label: "Aventurero" },
  { icon: "🧠", label: "Analítico" },
  { icon: "⚡", label: "Enérgico" }
]

const hobbiesAndInterests = [
  { icon: "📺", label: "Deportes por TV" },
  { icon: "🏃", label: "Actividades deportivas" },
  { icon: "🎵", label: "Música" },
  { icon: "🎭", label: "Arte" },
  { icon: "💻", label: "Tecnología" },
  { icon: "📚", label: "Lectura" },
  { icon: "👨‍🍳", label: "Cocina" },
  { icon: "🍖", label: "Parrilladas al aire libre" },
  { icon: "🤝", label: "Convivencias" },
  { icon: "🌱", label: "Jardinería" },
  { icon: "📷", label: "Fotografía" },
  { icon: "✂️", label: "Manualidades" },
  { icon: "🎮", label: "Videojuegos" },
  { icon: "💃", label: "Baile" },
  { icon: "🧘", label: "Yoga" },
  { icon: "🧘‍♂️", label: "Meditación" },
  { icon: "🔗", label: "Networking" },
  { icon: "📈", label: "Startups" },
  { icon: "🏎️", label: "Fórmula 1" },
  { icon: "🌳", label: "Naturaleza" },
  { icon: "🏟️", label: "Ir al estadio" },
  { icon: "🛠️", label: "Talleres creativos" },
  { icon: "🎤", label: "Conciertos" },
  { icon: "🏕️", label: "Actividades al aire libre" },
  { icon: "🎬", label: "Cine" }
]

export default function PersonalityInterestsStep({ data, updateData }: PersonalityInterestsStepProps) {
  const [selectedTraits, setSelectedTraits] = useState<string[]>(data.personalityTraits || [])
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.hobbiesAndInterests || [])
  const [newTrait, setNewTrait] = useState("")
  const [newInterest, setNewInterest] = useState("")
  const [customTraits, setCustomTraits] = useState<Array<{icon: string, label: string}>>([])
  const [customInterests, setCustomInterests] = useState<Array<{icon: string, label: string}>>([])

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    )
    updateData({
      ...data,
      personalityTraits: selectedTraits.includes(trait)
        ? selectedTraits.filter(t => t !== trait)
        : [...selectedTraits, trait]
    })
  }

  const addCustomTrait = () => {
    if (newTrait.trim() && !selectedTraits.includes(newTrait.trim())) {
      const trait = newTrait.trim();
      setCustomTraits(prev => [...prev, { icon: "✨", label: trait }]);
      const updatedTraits = [...selectedTraits, trait];
      setSelectedTraits(updatedTraits);
      updateData({
        ...data,
        personalityTraits: updatedTraits
      });
      setNewTrait("");
    }
  }

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
    updateData({
      ...data,
      hobbiesAndInterests: selectedInterests.includes(interest)
        ? selectedInterests.filter(i => i !== interest)
        : [...selectedInterests, interest]
    })
  }

  const addCustomInterest = () => {
    if (newInterest.trim() && !selectedInterests.includes(newInterest.trim())) {
      const interest = newInterest.trim();
      setCustomInterests(prev => [...prev, { icon: "✨", label: interest }]);
      const updatedInterests = [...selectedInterests, interest];
      setSelectedInterests(updatedInterests);
      updateData({
        ...data,
        hobbiesAndInterests: updatedInterests
      });
      setNewInterest("");
    }
  }

  const handleAdditionalInfo = (value: string) => {
    updateData({
      ...data,
      additionalInfo: value
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          ¡Bienvenido a Journey Box!
        </h2>
        <p className="text-gray-400 mt-2">
          Personaliza tu experiencia compartiendo tus preferencias y descubre viajes hechos para ti.
        </p>
      </div>

      <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Box className="h-5 w-5 text-indigo-400 mr-2" />
              <span className="font-medium text-indigo-300">Experiencias personalizadas</span>
            </div>
            <p className="text-sm text-gray-300">Viajes y actividades adaptados a tus gustos</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <BarChart2 className="h-5 w-5 text-pink-400 mr-2" />
              <span className="font-medium text-pink-300">Encuentra afinidades</span>
            </div>
            <p className="text-sm text-gray-300">Conecta con compañeros que comparten tus intereses</p>
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Users className="h-5 w-5 text-purple-400 mr-2" />
              <span className="font-medium text-purple-300">Mejora el team building</span>
            </div>
            <p className="text-sm text-gray-300">Actividades grupales que realmente disfrutarás</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-3">
          <div className="text-sm font-medium flex items-center">
            <Check className="h-4 w-4 mr-2 text-pink-400" />
            Intereses y hobbies
          </div>
          <p className="text-xs text-gray-400">Selecciona tus intereses principales</p>

          <div className="flex flex-wrap gap-1 mt-2">
            {[...hobbiesAndInterests, ...customInterests].map(({ icon, label }) => (
              <div
                key={label}
                className={`flex items-center px-2 py-1 rounded-full border cursor-pointer transition-all ${
                  selectedInterests.includes(label)
                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30"
                }`}
                onClick={() => toggleInterest(label)}
              >
                <span className="mr-0.5">{icon}</span>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center mt-3 space-x-2">
            <Input
              placeholder="Agregar interés personalizado..."
              className="bg-indigo-950/20 border-indigo-500/30 text-white text-xs"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
            />
            <Button
              size="sm"
              onClick={addCustomInterest}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Agregar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 