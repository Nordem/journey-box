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
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-6">
          <div className="relative w-48 h-32 flex-shrink-0">
            <Image
              src={trip.imageUrl || "/placeholder.svg"}
              alt={trip.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{trip.title}</h3>
                <p className="text-sm text-muted-foreground">{trip.location}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewParticipants}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Participants
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Dates</p>
                <p className="font-medium">{trip.dates}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p className="font-medium">{trip.availability}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employee Price</p>
                <p className="font-medium">${trip.employeePrice}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regular Price</p>
                <p className="font-medium">${trip.regularPrice}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}