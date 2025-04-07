import { Users, Edit3, Trash2 } from "lucide-react"
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
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="relative w-full md:w-48 h-48 md:h-32 flex-shrink-0">
            <Image
              src={trip.imageUrl || "/placeholder.svg"}
              alt={trip.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h3 className="text-lg font-semibold">{trip.title}</h3>
                <p className="text-sm text-muted-foreground">{trip.location}</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewParticipants}
                  className="flex-1 md:flex-none"
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Ver Participantes</span>
                  <span className="md:hidden">Participantes</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="flex-1 md:flex-none"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Editar</span>
                  <span className="md:hidden">Editar</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="flex-1 md:flex-none"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">Eliminar</span>
                  <span className="md:hidden">Eliminar</span>
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fechas</p>
                <p className="font-medium">{trip.dates}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponibilidad</p>
                <p className="font-medium">{trip.availability}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio Empleado</p>
                <p className="font-medium">{formatPrice(trip.employeePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precio Regular</p>
                <p className="font-medium">{formatPrice(trip.regularPrice)}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}