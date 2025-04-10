"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface PersonalInfoStepProps {
  data: {
    name: string;
    location: string;
    nearestAirport?: string;
    languages: string[];
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
      <div>
        <h1 className="text-2xl font-bold mb-4">Informacion Personal</h1>
        <p className="text-gray-400 mb-6">
          Completa tu información personal
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Información personal</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Carlos Mendez"
            />
          </div>

          <div>
            <Label htmlFor="location">Ubicación de residencia</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Tijuana, B.C., México"
            />
          </div>

          <div>
            <Label htmlFor="airport">Aeropuerto más cercano</Label>
            <p className="text-sm text-gray-400 mb-2">Si es diferente a tu ubicación de residencia</p>
            <Input
              id="airport"
              value={data.nearestAirport || ""}
              onChange={(e) => handleInputChange("nearestAirport", e.target.value)}
              placeholder="Tijuana, B.C., México"
            />
          </div>

          <div>
            <Label>Idiomas</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {languages.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={selectedLanguages.includes(label) ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => toggleLanguage(label)}
                >
                  <span>{label}</span>
                </Button>
              ))}
              {customLanguages.map(({ icon, label }) => (
                <Button
                  key={label}
                  variant={selectedLanguages.includes(label) ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => toggleLanguage(label)}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </Button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Otro idioma..."
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomLanguage()}
              />
              <Button onClick={addCustomLanguage}>Agregar</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 