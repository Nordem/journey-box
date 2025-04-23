"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface AvailabilityStepProps {
  data: {
    seasonalPreferences: string[];
    groupSizePreference: string[];
    blockedDates: string[];
  };
  updateData: (data: any) => void;
}

const seasons = [
  { value: "spring", icon: "🌸", label: "Primavera" },
  { value: "summer", icon: "☀️", label: "Verano" },
  { value: "autumn", icon: "🍂", label: "Otoño" },
  { value: "winter", icon: "❄️", label: "Invierno" }
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
    if (selectedSeasons.includes(season)) {
      setSelectedSeasons(prev => prev.filter(s => s !== season));
    } else if (selectedSeasons.length < 4) {
      setSelectedSeasons(prev => [...prev, season]);
    }
    updateData({
      ...data,
      seasonalPreferences: selectedSeasons.includes(season)
        ? selectedSeasons.filter(s => s !== season)
        : selectedSeasons.length < 4 ? [...selectedSeasons, season] : selectedSeasons
    });
  }

  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
    setSelectedDates(dates);
    updateData({
      ...data,
      blockedDates: dates.map(date => date.toISOString())
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Disponibilidad y temporadas
        </h2>
        <p className="text-gray-400 mt-2">Cuéntanos cuándo prefieres viajar y participar en actividades</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="text-sm font-medium flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2 text-indigo-400" />
            Temporadas preferidas para viajar
          </div>

          <div className="grid grid-cols-4 gap-1 mt-2">
            {seasons.map(({ value, icon, label }) => (
              <div
                key={value}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border cursor-pointer transition-all text-center ${
                  selectedSeasons.includes(value)
                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30"
                }`}
                onClick={() => toggleSeason(value)}
              >
                <div className="text-base">{icon}</div>
                <div className="text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          {selectedSeasons.length === 4 && (
            <p className="text-xs text-gray-400 mt-2">Has seleccionado el máximo de temporadas permitidas (4)</p>
          )}
        </div>

        <div className="space-y-3 mt-4">
          <div className="text-sm font-medium">Fechas bloqueadas</div>
          <p className="text-xs text-gray-400">Selecciona fechas en las que no estarás disponible</p>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-500/20 text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDates.length > 0 ? (
                  <span>{selectedDates.length} fechas seleccionadas</span>
                ) : (
                  <span>Seleccionar fechas bloqueadas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-indigo-950/90 border border-indigo-500/30" align="start">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleDateSelect}
                className="rounded-md border-0"
                locale={es}
              />
            </PopoverContent>
          </Popover>

          {selectedDates.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedDates.map((date, index) => (
                <Badge key={index} variant="outline" className="bg-indigo-950/30">
                  {format(date, "d MMM yyyy", { locale: es })}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => {
                      const newDates = selectedDates.filter((d) => d !== date)
                      setSelectedDates(newDates)
                      updateData({
                        ...data,
                        blockedDates: newDates.map(date => date.toISOString())
                      })
                    }}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 