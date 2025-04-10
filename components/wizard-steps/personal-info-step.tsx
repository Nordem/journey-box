"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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
  const [customLanguages, setCustomLanguages] = useState<Array<{icon: string, label: string}>>([])

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
    <div className="space-y-6 sm:space-y-8">
      <Card className="p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Información personal</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm font-medium">Nombre completo</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Tu nombre completo"
              className="text-sm sm:text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-xs sm:text-sm font-medium">Ubicación de residencia</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Tijuana, B.C., México"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="airport" className="text-xs sm:text-sm font-medium">Aeropuerto más cercano</Label>
            <Input
              id="airport"
              value={data.nearestAirport || ""}
              onChange={(e) => handleInputChange("nearestAirport", e.target.value)}
              placeholder="Tijuana, B.C., México"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="additionalInfo" className="text-xs sm:text-sm font-medium">
              Algo que quieras agregar para entender mejor tus preferencias
            </Label>
            <Textarea
              id="additionalInfo"
              placeholder="Comparte cualquier información adicional que nos ayude a personalizar tu experiencia"
              value={data.additionalInfo || ""}
              onChange={(e) => handleAdditionalInfo(e.target.value)}
              className="text-sm sm:text-base min-h-[100px]"
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 