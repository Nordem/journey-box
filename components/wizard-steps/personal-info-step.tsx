"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Información personal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="location" className="text-sm font-medium">Ubicación de residencia</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Tijuana, B.C., México"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="airport" className="text-sm font-medium">Aeropuerto más cercano</Label>
            <Input
              id="airport"
              value={data.nearestAirport || ""}
              onChange={(e) => handleInputChange("nearestAirport", e.target.value)}
              placeholder="Tijuana, B.C., México"
              className="mt-2"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="additionalInfo" className="text-sm font-medium">
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
      </Card>
    </div>
  )
} 