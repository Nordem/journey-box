"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

interface AvailabilityStepProps {
  data: {
    seasonalPreferences: string[];
    groupSizePreference: string[];
    blockedDates: string[];
  };
  updateData: (data: any) => void;
}

const seasons = [
  { icon: "🌸", label: "Primavera" },
  { icon: "☀️", label: "Verano" },
  { icon: "🍂", label: "Otoño" },
  { icon: "❄️", label: "Invierno" }
]

const groupSizes = [
  { value: "individual", label: "Individual", description: "Experiencias individuales" },
  { value: "small_group", label: "Grupo pequeño", description: "2-10 personas" },
  { value: "large_group", label: "Grupo grande", description: "Más de 30 personas" }
]

export default function AvailabilityStep({ data, updateData }: AvailabilityStepProps) {
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(data.seasonalPreferences || [])
  const [selectedGroupSizes, setSelectedGroupSizes] = useState<string[]>(data.groupSizePreference || [])
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    data.blockedDates.map(date => new Date(date))
  )
  const [newSeason, setNewSeason] = useState("")
  const [customSeasons, setCustomSeasons] = useState<Array<{icon: string, label: string}>>([])

  const toggleSeason = (season: string) => {
    setSelectedSeasons(prev => 
      prev.includes(season) ? prev.filter(s => s !== season) : [...prev, season]
    )
    updateData({
      ...data,
      seasonalPreferences: selectedSeasons.includes(season)
        ? selectedSeasons.filter(s => s !== season)
        : [...selectedSeasons, season]
    })
  }

  const addCustomSeason = () => {
    if (newSeason.trim() && !selectedSeasons.includes(newSeason.trim())) {
      const season = newSeason.trim();
      setCustomSeasons(prev => [...prev, { icon: "✨", label: season }]);
      const updatedSeasons = [...selectedSeasons, season];
      setSelectedSeasons(updatedSeasons);
      updateData({
        ...data,
        seasonalPreferences: updatedSeasons
      });
      setNewSeason("");
    }
  }

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return
    setSelectedDates(dates)
    updateData({
      ...data,
      blockedDates: dates.map(date => date.toISOString())
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Disponibilidad y temporadas</h1>
        <p className="text-gray-400 mb-6">
          Cuéntanos cuándo prefieres viajar y participar en actividades
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Temporadas preferidas</h2>
        <p className="text-sm text-gray-400 mb-4">Selecciona las temporadas que prefieres para viajar</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...seasons, ...customSeasons].map(({ icon, label }) => (
            <Button
              key={label}
              variant={selectedSeasons.includes(label) ? "default" : "outline"}
              className="flex items-center gap-2 h-12"
              onClick={() => toggleSeason(label)}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Fechas bloqueadas</h2>
        <p className="text-sm text-gray-400 mb-4">Selecciona fechas en las que no estarás disponible</p>
        <Calendar
          mode="multiple"
          selected={selectedDates}
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </Card>
    </div>
  )
} 