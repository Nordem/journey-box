"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface TeamBuildingStepProps {
  data: {
    teamBuildingPrefs: {
      preferredActivities: string[];
      location: 'office' | 'outside' | 'both';
      duration: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days';
      suggestions: string;
    };
  };
  updateData: (data: any) => void;
}

const activities = [
  { icon: "👥", label: "Dinámicas de grupo" },
  { icon: "🔄", label: "Talleres colaborativos" },
  { icon: "🌳", label: "Actividades al aire libre" },
  { icon: "🔐", label: "Salas de juego" },
  { icon: "🏆", label: "Actividades deportivas" },
  { icon: "🎨", label: "Actividades creativas" },
  { icon: "🤝", label: "Soft Skills" },
  { icon: "🛠️", label: "Hard Skills" }
]

export default function TeamBuildingStep({ data, updateData }: TeamBuildingStepProps) {
  const [selectedActivities, setSelectedActivities] = useState<string[]>(
    data.teamBuildingPrefs?.preferredActivities || []
  )
  const [location, setLocation] = useState<'office' | 'outside' | 'both' | undefined>(
    data.teamBuildingPrefs?.location
  )
  const [duration, setDuration] = useState<'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days' | undefined>(
    data.teamBuildingPrefs?.duration
  )
  const [newActivity, setNewActivity] = useState("")
  const [customActivities, setCustomActivities] = useState<Array<{icon: string, label: string}>>([])

  useEffect(() => {
    // Update form data whenever state changes
    updateData({
      ...data,
      teamBuildingPrefs: {
        ...data.teamBuildingPrefs,
        preferredActivities: selectedActivities,
        location,
        duration,
        suggestions: data.teamBuildingPrefs?.suggestions || ""
      }
    })
  }, [selectedActivities, location, duration])

  const handleLocationChange = (value: 'office' | 'outside' | 'both') => {
    setLocation(value)
  }

  const handleDurationChange = (value: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days') => {
    setDuration(value)
  }

  const toggleActivity = (activity: string) => {
    const newSelectedActivities = selectedActivities.includes(activity)
      ? selectedActivities.filter(a => a !== activity)
      : [...selectedActivities, activity]
    setSelectedActivities(newSelectedActivities)
  }

  const addCustomActivity = () => {
    if (newActivity.trim() && !selectedActivities.includes(newActivity.trim())) {
      const activity = newActivity.trim();
      setCustomActivities(prev => [...prev, { icon: "✨", label: activity }]);
      setSelectedActivities(prev => [...prev, activity]);
      setNewActivity("");
    }
  }

  const handleSuggestions = (value: string) => {
    updateData({
      ...data,
      teamBuildingPrefs: {
        ...data.teamBuildingPrefs,
        suggestions: value
      }
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Actividades de Team Building</h1>
        <p className="text-gray-400 mb-6">
          Ayúdanos a crear experiencias de equipo que realmente disfrutes
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Actividades que te interesan</h2>
        <p className="text-sm text-gray-400 mb-4">Selecciona las actividades de team building que prefieres</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...activities, ...customActivities].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedActivities.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2 h-12"
              onClick={() => toggleActivity(label)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Button>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Agregar otra actividad..."
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addCustomActivity()}
            className="flex-1"
          />
          <Button onClick={addCustomActivity} variant="default">
            Agregar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">¿Dónde prefieres las actividades?</h2>
        <p className="text-sm text-gray-400 mb-4">Selecciona tu preferencia de ubicación</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant={location === 'office' ? "default" : "outline"}
            className="h-12"
            onClick={() => handleLocationChange('office')}
          >
            Dentro de la oficina
          </Button>
          <Button
            variant={location === 'outside' ? "default" : "outline"}
            className="h-12"
            onClick={() => handleLocationChange('outside')}
          >
            Fuera de la oficina
          </Button>
          <Button
            variant={location === 'both' ? "default" : "outline"}
            className="h-12"
            onClick={() => handleLocationChange('both')}
          >
            Ambas
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Duración preferida</h2>
        <p className="text-sm text-gray-400 mb-4">Selecciona la duración que prefieres para las actividades</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant={duration === 'less_than_2h' ? "default" : "outline"}
            className="h-12"
            onClick={() => handleDurationChange('less_than_2h')}
          >
            Menos de 2 horas
          </Button>
          <Button
            variant={duration === 'half_day' ? "default" : "outline"}
            className="h-12"
            onClick={() => handleDurationChange('half_day')}
          >
            Medio día
          </Button>
          <Button
            variant={duration === 'full_day' ? "default" : "outline"}
            className="h-12"
            onClick={() => handleDurationChange('full_day')}
          >
            Día completo
          </Button>
          <Button
            variant={duration === 'multiple_days' ? "default" : "outline"}
            className="h-12"
            onClick={() => handleDurationChange('multiple_days')}
          >
            Más de un día
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Sugerencias</h2>
        <p className="text-sm text-gray-400 mb-4">¿Tienes alguna sugerencia específica?</p>
        <Input
          value={data.teamBuildingPrefs?.suggestions || ""}
          onChange={(e) => handleSuggestions(e.target.value)}
          placeholder="Comparte tus ideas y sugerencias..."
          className="mt-2"
        />
      </Card>
    </div>
  )
} 