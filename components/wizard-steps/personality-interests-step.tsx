"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
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
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">¡Bienvenido a Journey Box, Carlos!</h1>
        <p className="text-sm sm:text-base text-gray-400">
          Personaliza tu experiencia compartiendo tus preferencias y descubre viajes hechos para ti.
        </p>
        <div className="bg-[#1a1b3b] rounded-2xl sm:rounded-3xl p-4 sm:p-8 mt-4 sm:mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <Box className="w-5 h-5 sm:w-6 sm:h-6 text-[#8b8cc7]" />
                <h3 className="text-lg sm:text-xl text-[#8b8cc7]">
                  Experiencias<br className="hidden sm:block" />personalizadas
                </h3>
              </div>
              <p className="text-white text-sm sm:text-md">
                Viajes y actividades<br className="hidden sm:block" />adaptados a tus gustos
              </p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#e991a9]" />
                <h3 className="text-lg sm:text-xl text-[#e991a9]">
                  Encuentra<br className="hidden sm:block" />afinidades
                </h3>
              </div>
              <p className="text-white text-sm sm:text-md">
                Conecta con compañeros<br className="hidden sm:block" />que comparten tus<br className="hidden sm:block" />intereses
              </p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#b48cc7]" />
                <h3 className="text-lg sm:text-xl text-[#b48cc7]">
                  Mejora el team<br className="hidden sm:block" />building
                </h3>
              </div>
              <p className="text-white text-sm sm:text-md">
                Actividades grupales que<br className="hidden sm:block" />realmente disfrutarás
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Intereses y hobbies</h2>
        <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Selecciona tus intereses principales</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {[...hobbiesAndInterests, ...customInterests].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedInterests.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2 h-10 sm:h-12 text-xs sm:text-sm"
              onClick={() => toggleInterest(label)}
            >
              <span>{icon}</span>
              <span className="truncate">{label}</span>
            </Button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Input
            placeholder="Agregar otro interés..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
            className="flex-1 text-sm sm:text-base"
          />
          <Button onClick={addCustomInterest} variant="default" className="w-full sm:w-auto">
            Agregar
          </Button>
        </div>
      </Card>
    </div>
  )
} 