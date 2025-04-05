import { MapPin, Calendar, Users, User, Edit3, Trash2, Eye, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

interface TripListItemProps {
  trip: any
  onEdit: () => void
  onDelete: () => void
  onViewParticipants: () => void
}

export default function TripListItem({ trip, onEdit, onDelete, onViewParticipants }: TripListItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const totalParticipants = trip.participants ? trip.participants.length : 0
  const totalCompanions = trip.participants
    ? trip.participants.reduce((total: number, participant: any) => total + (participant.bookingData?.companions?.length || 0), 0)
    : 0
  const totalPeople = totalParticipants + totalCompanions

  return (
    <Card className="bg-indigo-950/30 border border-indigo-500/30 hover:bg-indigo-950/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative h-24 w-full md:w-40 rounded-md overflow-hidden flex-shrink-0">
            <Image src={trip.imageUrl || "/placeholder.svg"} alt={trip.title} fill className="object-cover" />
            {trip.hasVideo && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1 border border-white/20">
                <Play size={12} className="text-white fill-white" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-white">{trip.title}</h3>
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin size={12} className="mr-1" />
                  <span>{trip.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">Precio empleado</div>
                <div className="text-indigo-400 font-medium">{formatPrice(trip.employeePrice)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              <div className="flex items-center text-sm">
                <Calendar size={12} className="mr-1 text-purple-400" />
                <span className="text-gray-300">{trip.dates}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users size={12} className="mr-1 text-pink-400" />
                <span className="text-gray-300">Disponibles: {Math.round(trip.availability * 0.2)} lugares</span>
              </div>
              {trip.tripManager && (
                <div className="flex items-center text-sm col-span-2">
                  <User size={12} className="mr-1 text-teal-400" />
                  <span className="text-gray-300">Resp: {trip.tripManager.split(" - ")[0]}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center text-sm">
              <Users size={12} className="mr-1 text-indigo-400" />
              <span className="text-gray-300">
                Participantes:{" "}
                {totalPeople > 0
                  ? `${totalPeople} (${totalParticipants} titulares, ${totalCompanions} acompañantes)`
                  : "Sin registros"}
              </span>
            </div>
          </div>

          <div className="flex md:flex-col gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20 text-white"
              onClick={onViewParticipants}
            >
              <Eye size={14} className="mr-1" /> Participantes
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20 text-white"
              onClick={onEdit}
            >
              <Edit3 size={14} className="mr-1" /> Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/30 bg-red-950/20 hover:bg-red-500/20 text-red-400 hover:text-red-300"
              onClick={onDelete}
            >
              <Trash2 size={14} className="mr-1" /> Eliminar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}