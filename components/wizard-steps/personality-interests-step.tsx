"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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

  const handleAdditionalInfo = (value: string) => {
    updateData({
      ...data,
      additionalInfo: value
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido a Journey Box, Carlos!</h1>
        <p className="text-gray-600">
          Personaliza tu experiencia compartiendo tus preferencias y descubre viajes hechos para ti.
          Cuéntanos sobre tus gustos para ofrecerte experiencias únicas y conectarte con personas afines.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Experiencias personalizadas</h3>
            <p className="text-sm text-gray-600">Viajes y actividades adaptados a tus gustos</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Encuentra afinidades</h3>
            <p className="text-sm text-gray-600">Conecta con compañeros que comparten tus intereses</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Mejora el team building</h3>
            <p className="text-sm text-gray-600">Actividades grupales que realmente disfrutarás</p>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">😊 Rasgos de personalidad</h2>
        <p className="text-gray-600 mb-4">Selecciona los rasgos que mejor te describen</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {personalityTraits.map(({ icon, label }) => (
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
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">❤️ Intereses y hobbies</h2>
        <p className="text-gray-600 mb-4">Selecciona tus intereses principales</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {hobbiesAndInterests.map(({ icon, label }) => (
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