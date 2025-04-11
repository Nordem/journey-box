"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Calendar, User } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface PersonalInfoStepProps {
  data: {
    name: string;
    location: string;
    nearestAirport?: string;
    languages: string[];
    additionalInfo?: string;
  };
  updateData: (data: any) => void;
}

const languages = [
  { value: "spanish", label: "Español" },
  { value: "english", label: "Inglés" }
]

export default function PersonalInfoStep({ data, updateData }: PersonalInfoStepProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(data.languages || [])
  const [customLanguage, setCustomLanguage] = useState("")
  const [customLanguages, setCustomLanguages] = useState<Array<{ icon: string, label: string }>>([])

  const handleInputChange = (field: string, value: string) => {
    updateData({
      ...data,
      [field]: value
    })
  }

  const handleAdditionalInfo = (value: string) => {
    updateData({
      ...data,
      additionalInfo: value
    })
  }

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev =>
      prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]
    )
    updateData({
      ...data,
      languages: selectedLanguages.includes(language)
        ? selectedLanguages.filter(l => l !== language)
        : [...selectedLanguages, language]
    })
  }

  const addCustomLanguage = () => {
    if (!customLanguage.trim()) return
    const newLanguage = customLanguage.trim()
    setCustomLanguages(prev => [...prev, { icon: "✨", label: newLanguage }])
    setSelectedLanguages(prev => [...prev, newLanguage])
    updateData({
      ...data,
      languages: [...selectedLanguages, newLanguage]
    })
    setCustomLanguage("")
  }

  return (
    <div className="space-y-6 mt-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Información personal
        </h2>
        <p className="text-gray-400 mt-2">Cuéntanos un poco sobre ti para personalizar tu experiencia</p>
      </div>

      <div className="space-y-6">


        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-medium flex items-center">
            <User className="h-4 w-4 mr-2 text-purple-400" />
            Nombre completo
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Tu nombre completo"
              className="bg-indigo-950/20 border-indigo-500/30 text-white pl-10"
              required
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-purple-400" />
            Ubicación de residencia
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
            <Input
              id="location"
              value={data.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Tijuana, B.C., México"
              className="bg-indigo-950/20 border-indigo-500/30 text-white pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-pink-400" />
            Aeropuerto más cercano
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
            <Input
              id="nearestAirport"
              value={data.nearestAirport || ""}
              onChange={(e) => handleInputChange("nearestAirport", e.target.value)}
              placeholder="Tijuana, B.C., México"
              className="bg-indigo-950/20 border-indigo-500/30 text-white pl-10"
            />
          </div>
          <p className="text-xs text-gray-500">Si es diferente a tu ubicación de residencia</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalInfo" className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
            Algo que quieras agregar para entender mejor tus preferencias
          </Label>
          <Textarea
            id="additionalInfo"
            placeholder="Comparte cualquier información adicional que nos ayude a personalizar tu experiencia..."
            value={data.additionalInfo || ""}
            onChange={(e) => handleAdditionalInfo(e.target.value)}
            className="bg-indigo-950/20 border-indigo-500/30 text-white min-h-[80px]"
          />
          <p className="text-xs text-gray-500">Esto nos ayuda a entender mejor tus preferencias</p>
        </div>

        <Separator className="bg-indigo-500/20" />
      </div>
    </div>
  )
} 