"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Compass } from "lucide-react"

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
  { icon: "🏙️", label: "Destinos urbanos" }
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
    <div className="space-y-6 mt-10">
      <div className="space-y-3">
        <div className="text-sm font-medium flex items-center">
          <Compass className="h-4 w-4 mr-2 text-purple-400" />
          Destinos que te atraen
        </div>
        <p className="text-xs text-gray-400">Selecciona los tipos de destinos que prefieres visitar</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
          {[...destinations, ...customDestinations].map(({ icon, label }) => (
            <div
              key={label}
              className={`flex items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center ${
                selectedDestinations.includes(label)
                  ? "border-indigo-500 bg-indigo-950/50 text-white"
                  : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30"
              }`}
              onClick={() => toggleDestination(label)}
            >
              <div>
                <div className="text-base mb-0.5">{icon}</div>
                <div className="text-xs">{label}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center mt-3 space-x-2">
          <Input
            placeholder="Agregar destino personalizado..."
            className="bg-indigo-950/20 border-indigo-500/30 text-white text-xs"
            value={newDestination}
            onChange={(e) => setNewDestination(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomDestination()}
          />
          <Button
            size="sm"
            onClick={addCustomDestination}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Agregar
          </Button>
        </div>
      </div>
    </div>
  )
} 