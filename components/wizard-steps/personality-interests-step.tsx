"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
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
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido a Journey Box!</h1>
        <p className="text-gray-400">
          Personaliza tu experiencia compartiendo tus preferencias y descubre viajes hechos para ti.
          Cuéntanos sobre tus gustos para ofrecerte experiencias únicas y conectarte con personas afines.
        </p>
        <div className="bg-[#1a1b3b] rounded-3xl p-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Box className="w-6 h-6 text-[#8b8cc7]" />
              <h3 className="text-xl text-[#8b8cc7]">
                Experiencias<br />personalizadas
              </h3>
            </div>
            <p className="text-white text-md">
              Viajes y actividades<br />adaptados a tus gustos
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <BarChart2 className="w-6 h-6 text-[#e991a9]" />
              <h3 className="text-xl text-[#e991a9]">
                Encuentra<br />afinidades
              </h3>
            </div>
            <p className="text-white text-md">
              Conecta con compañeros<br />que comparten tus<br />intereses
            </p>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-[#b48cc7]" />
              <h3 className="text-xl text-[#b48cc7]">
                Mejora el team<br />building
              </h3>
            </div>
            <p className="text-white text-md">
              Actividades grupales que<br />realmente disfrutarás
            </p>
          </div>
        </div>
      </div>

      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">😊 Rasgos de personalidad</h2>
        <p className="text-gray-400 mb-4">Selecciona los rasgos que mejor te describen</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...personalityTraits, ...customTraits].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedTraits.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => toggleTrait(label)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Agregar otro rasgo..."
            value={newTrait}
            onChange={(e) => setNewTrait(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomTrait()}
          />
          <Button onClick={addCustomTrait} variant="default">
            Agregar
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">❤️ Intereses y hobbies</h2>
        <p className="text-gray-400 mb-4">Selecciona tus intereses principales</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...hobbiesAndInterests, ...customInterests].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedInterests.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => toggleInterest(label)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Agregar otro interés..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
          />
          <Button onClick={addCustomInterest} variant="default">
            Agregar
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="additionalInfo">
          Algo que quieras agregar para entender mejor tus preferencias
        </Label>
        <Textarea
          id="additionalInfo"
          placeholder="Comparte cualquier información adicional que nos ayude a personalizar tu experiencia"
          value={data.additionalInfo || ""}
          onChange={(e) => handleAdditionalInfo(e.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  )
} 