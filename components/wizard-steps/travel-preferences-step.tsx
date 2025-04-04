"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface TravelPreferencesStepProps {
  data: {
    preferredExperiences: string[];
    preferredDestinations: string[];
  };
  updateData: (data: any) => void;
}

const experiences = [
  { icon: "🧖", label: "Relajación" },
  { icon: "🧗", label: "Aventura" },
  { icon: "🎓", label: "Aprendizaje" },
  { icon: "🗣️", label: "Socialización" },
  { icon: "🏛️", label: "Exploración cultural" },
  { icon: "🍽️", label: "Experiencias gastronómicas" },
  { icon: "💆", label: "Actividades de bienestar" }
]

const destinations = [
  { icon: "🏖️", label: "Playa" },
  { icon: "⛰️", label: "Montaña" },
  { icon: "🏰", label: "Ciudades históricas" },
  { icon: "🌾", label: "Pueblos Mágicos" },
  { icon: "🎢", label: "Parques temáticos" },
  { icon: "🍷", label: "Destinos gastronómicos" },
  { icon: "🦁", label: "Reservas naturales" },
  { icon: "🗿", label: "Sitios arqueológicos" },
  { icon: "🏙️", label: "Destinos urbanos modernos" }
]

export default function TravelPreferencesStep({ data, updateData }: TravelPreferencesStepProps) {
  const [selectedExperiences, setSelectedExperiences] = useState<string[]>(data.preferredExperiences || [])
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(data.preferredDestinations || [])
  const [newExperience, setNewExperience] = useState("")
  const [newDestination, setNewDestination] = useState("")
  const [customExperiences, setCustomExperiences] = useState<Array<{icon: string, label: string}>>([])
  const [customDestinations, setCustomDestinations] = useState<Array<{icon: string, label: string}>>([])

  const toggleExperience = (experience: string) => {
    setSelectedExperiences(prev => 
      prev.includes(experience) ? prev.filter(e => e !== experience) : [...prev, experience]
    )
    updateData({
      ...data,
      preferredExperiences: selectedExperiences.includes(experience)
        ? selectedExperiences.filter(e => e !== experience)
        : [...selectedExperiences, experience]
    })
  }

  const addCustomExperience = () => {
    if (newExperience.trim() && !selectedExperiences.includes(newExperience.trim())) {
      const experience = newExperience.trim();
      setCustomExperiences(prev => [...prev, { icon: "✨", label: experience }]);
      const updatedExperiences = [...selectedExperiences, experience];
      setSelectedExperiences(updatedExperiences);
      updateData({
        ...data,
        preferredExperiences: updatedExperiences
      });
      setNewExperience("");
    }
  }

  const toggleDestination = (destination: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destination) ? prev.filter(d => d !== destination) : [...prev, destination]
    )
    updateData({
      ...data,
      preferredDestinations: selectedDestinations.includes(destination)
        ? selectedDestinations.filter(d => d !== destination)
        : [...selectedDestinations, destination]
    })
  }

  const addCustomDestination = () => {
    if (newDestination.trim() && !selectedDestinations.includes(newDestination.trim())) {
      const destination = newDestination.trim();
      setCustomDestinations(prev => [...prev, { icon: "✨", label: destination }]);
      const updatedDestinations = [...selectedDestinations, destination];
      setSelectedDestinations(updatedDestinations);
      updateData({
        ...data,
        preferredDestinations: updatedDestinations
      });
      setNewDestination("");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Tus preferencias de viaje</h1>
        <p className="text-gray-600 mb-6">
          Cuéntanos qué tipo de experiencias y destinos prefieres
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Experiencias que prefieres</h2>
        <p className="text-gray-600 mb-4">Selecciona los tipos de experiencias que más disfrutas</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...experiences, ...customExperiences].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedExperiences.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => toggleExperience(label)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Agregar otra experiencia..."
            value={newExperience}
            onChange={(e) => setNewExperience(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomExperience()}
          />
          <Button onClick={addCustomExperience} variant="outline">
            Agregar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Destinos que te atraen</h2>
        <p className="text-gray-600 mb-4">Selecciona los tipos de destinos que prefieres visitar</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...destinations, ...customDestinations].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedDestinations.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => toggleDestination(label)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Agregar otro destino..."
            value={newDestination}
            onChange={(e) => setNewDestination(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomDestination()}
          />
          <Button onClick={addCustomDestination} variant="outline">
            Agregar
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Sugerencia: Seleccionar tus destinos favoritos nos ayuda a ofrecerte experiencias más personalizadas
          y encontrar compañeros de viaje con intereses similares.
        </p>
      </Card>
    </div>
  )
} 