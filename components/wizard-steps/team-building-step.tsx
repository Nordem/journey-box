"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface TeamBuildingStepProps {
  data: {
    teamBuildingPrefs?: {
      preferredActivities: string[];
      location: 'office' | 'outside' | 'both';
      duration: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days';
      suggestions?: string;
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
  const [location, setLocation] = useState<'office' | 'outside' | 'both'>(
    data.teamBuildingPrefs?.location || 'both'
  )
  const [duration, setDuration] = useState<'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days'>(
    data.teamBuildingPrefs?.duration || 'half_day'
  )
  const [newActivity, setNewActivity] = useState("")
  const [customActivities, setCustomActivities] = useState<Array<{icon: string, label: string}>>([])

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
    )
    updateData({
      ...data,
      teamBuildingPrefs: {
        ...data.teamBuildingPrefs,
        preferredActivities: selectedActivities.includes(activity)
          ? selectedActivities.filter(a => a !== activity)
          : [...selectedActivities, activity]
      }
    })
  }

  const addCustomActivity = () => {
    if (newActivity.trim() && !selectedActivities.includes(newActivity.trim())) {
      const activity = newActivity.trim();
      setCustomActivities(prev => [...prev, { icon: "✨", label: activity }]);
      const updatedActivities = [...selectedActivities, activity];
      setSelectedActivities(updatedActivities);
      updateData({
        ...data,
        teamBuildingPrefs: {
          ...data.teamBuildingPrefs,
          preferredActivities: updatedActivities
        }
      });
      setNewActivity("");
    }
  }

  const handleLocationChange = (value: 'office' | 'outside' | 'both') => {
    setLocation(value)
    updateData({
      ...data,
      teamBuildingPrefs: {
        ...data.teamBuildingPrefs,
        location: value
      }
    })
  }

  const handleDurationChange = (value: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days') => {
    setDuration(value)
    updateData({
      ...data,
      teamBuildingPrefs: {
        ...data.teamBuildingPrefs,
        duration: value
      }
    })
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
        <p className="text-gray-600 mb-6">
          Ayúdanos a crear experiencias de equipo que realmente disfrutes
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Actividades que te interesan</h2>
        <p className="text-gray-600 mb-4">Selecciona las actividades de team building que prefieres</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...activities, ...customActivities].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedActivities.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2"
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
          />
          <Button onClick={addCustomActivity} variant="outline">
            Agregar
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">¿Dónde prefieres las actividades?</h2>
        <RadioGroup
          value={location}
          onValueChange={(value: 'office' | 'outside' | 'both') => handleLocationChange(value)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="office" id="office" />
            <Label htmlFor="office">Dentro de la oficina</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="outside" id="outside" />
            <Label htmlFor="outside">Fuera de la oficina</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="both" id="both" />
            <Label htmlFor="both">Ambas</Label>
          </div>
        </RadioGroup>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Duración preferida</h2>
        <RadioGroup
          value={duration}
          onValueChange={(value: 'less_than_2h' | 'half_day' | 'full_day' | 'multiple_days') => 
            handleDurationChange(value)
          }
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="less_than_2h" id="less_than_2h" />
            <Label htmlFor="less_than_2h">Menos de 2 horas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="half_day" id="half_day" />
            <Label htmlFor="half_day">Medio día</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="full_day" id="full_day" />
            <Label htmlFor="full_day">Día completo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multiple_days" id="multiple_days" />
            <Label htmlFor="multiple_days">Más de un día</Label>
          </div>
        </RadioGroup>
      </Card>

      <div>
        <Label htmlFor="suggestions">¿Tienes alguna sugerencia específica?</Label>
        <Textarea
          id="suggestions"
          value={data.teamBuildingPrefs?.suggestions || ""}
          onChange={(e) => handleSuggestions(e.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  )
} 