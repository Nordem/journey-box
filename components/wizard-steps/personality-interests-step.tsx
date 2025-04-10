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
    <div className="space-y-8">

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Intereses y hobbies</h2>
        <p className="text-sm text-gray-400 mb-4">Selecciona tus intereses principales</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...hobbiesAndInterests, ...customInterests].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedInterests.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2 h-12"
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
            className="flex-1"
          />
          <Button onClick={addCustomInterest} variant="default">
            Agregar
          </Button>
        </div>
      </Card>
    </div>
  )
} 