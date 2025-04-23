"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  User,
  Trash2,
  Search,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import TripListItem from "@/components/ui/TripListItem"
import TripForm from "@/components/ui/TripForm"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Define Trip interface
interface Trip {
  id: string | number;
  title: string;
  location: string;
  dates: string;
  availability: number;
  employeePrice: number;
  regularPrice: number;
  description: string;
  imageUrl: string;
  hasVideo: boolean;
  videoUrl?: string;
  participants: any[];
  tripManager: string;
  hotel?: {
    name: string;
    description: string;
    amenities: string[];
  };
  includes?: string[];
  excludes?: string[];
  itinerary?: Array<{
    title: string;
    activities: string[];
  }>;
  galleryImages?: string[];
}

export default function AdminTripsPage() {
  const [showForm, setShowForm] = useState(false)
  const [trips, setTrips] = useState<Trip[]>([])
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const { toast } = useToast()

  // Load trips on init
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) throw new Error('Failed to fetch events')
        const { events } = await response.json()
        setTrips(events.map((event: any) => ({
          id: event.id,
          title: event.name,
          location: event.location,
          dates: `${format(new Date(event.startDate), 'MMM d', { locale: es })} - ${format(new Date(event.endDate), 'MMM d, yyyy', { locale: es })}`,
          availability: event.maxParticipants,
          employeePrice: event.finalPrice,
          regularPrice: event.originalPrice,
          description: event.description,
          imageUrl: event.imageUrl || "/placeholder.svg",
          hasVideo: false,
          participants: [],
          tripManager: event.tripManager,
          hotel: {
            name: event.hotelName,
            description: event.hotelDescription,
            amenities: event.hotelAmenities || [],
          },
          includes: event.hotelIncludes || [],
          excludes: event.hotelExcludes || [],
          galleryImages: event.galleryImages || [],
        })))
      } catch (error) {
        console.error('Error fetching trips:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los eventos",
          variant: "destructive",
        })
      }
    }

    fetchTrips()
  }, [])

  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/events', {
        method: editingTrip ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTrip?.id,
          name: formData.name,
          location: formData.location,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          maxParticipants: formData.maxParticipants,
          originalPrice: formData.originalPrice,
          finalPrice: formData.finalPrice,
          tripManager: formData.tripManager,
          hotelName: formData.hotelName,
          hotelDescription: formData.hotelDescription,
          hotelAmenities: formData.hotelAmenities,
          hotelIncludes: formData.hotelIncludes,
          hotelExcludes: formData.hotelExcludes,
          imageUrl: formData.imageUrl,
          galleryImages: formData.galleryImages
        }),
      })

      if (!response.ok) throw new Error('Failed to save event')

      const savedEvent = await response.json()
      
      // Update the trips state
      if (editingTrip) {
        setTrips(trips.map(trip => trip.id === editingTrip.id ? {
          ...trip,
          title: savedEvent.name,
          location: savedEvent.location,
          dates: `${format(new Date(savedEvent.startDate), 'MMM d', { locale: es })} - ${format(new Date(savedEvent.endDate), 'MMM d, yyyy', { locale: es })}`,
          availability: savedEvent.maxParticipants,
          employeePrice: savedEvent.finalPrice,
          regularPrice: savedEvent.originalPrice,
          description: savedEvent.description,
          tripManager: savedEvent.tripManager,
          hotel: {
            name: savedEvent.hotelName,
            description: savedEvent.hotelDescription,
            amenities: savedEvent.hotelAmenities,
          },
          includes: savedEvent.hotelIncludes,
          excludes: savedEvent.hotelExcludes,
          imageUrl: savedEvent.imageUrl || "/placeholder.svg",
          galleryImages: savedEvent.galleryImages || []
        } : trip));
        toast({
          title: "Evento actualizado exitosamente",
          description: "Los cambios se han guardado.",
        });
      } else {
        setTrips([...trips, {
          id: savedEvent.id,
          title: savedEvent.name,
          location: savedEvent.location,
          dates: `${format(new Date(savedEvent.startDate), 'MMM d', { locale: es })} - ${format(new Date(savedEvent.endDate), 'MMM d, yyyy', { locale: es })}`,
          availability: savedEvent.maxParticipants,
          employeePrice: savedEvent.finalPrice,
          regularPrice: savedEvent.originalPrice,
          description: savedEvent.description,
          imageUrl: savedEvent.imageUrl || "/placeholder.svg",
          hasVideo: false,
          participants: [],
          tripManager: savedEvent.tripManager,
          hotel: {
            name: savedEvent.hotelName,
            description: savedEvent.hotelDescription,
            amenities: savedEvent.hotelAmenities,
          },
          includes: savedEvent.hotelIncludes,
          excludes: savedEvent.hotelExcludes,
          galleryImages: savedEvent.galleryImages || []
        }]);
        toast({
          title: "Evento creado exitosamente",
          description: "El nuevo evento ha sido agregado al catálogo.",
        });
      }

      // Close the form
      setShowForm(false);
      setEditingTrip(null);
    } catch (error) {
      console.error('Error saving event:', error)
      toast({
        title: "Error",
        description: "No se pudo guardar el evento",
        variant: "destructive",
      })
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setShowForm(true)
  }

  const confirmDeleteTrip = (trip: Trip) => {
    setTripToDelete(trip)
    setShowDeleteConfirm(true)
  }

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return
    
    try {
      const response = await fetch(`/api/events?id=${tripToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete event')

      const updatedTrips = trips.filter((trip) => trip.id !== tripToDelete.id)
      setTrips(updatedTrips)

      toast({
        title: "Evento eliminado",
        description: `El evento ${tripToDelete.title} ha sido eliminado exitosamente.`,
      })

      setShowDeleteConfirm(false)
      setTripToDelete(null)
    } catch (error) {
      console.error('Error deleting event:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive",
      })
    }
  }

  const handleViewParticipants = (trip: Trip) => {
    setSelectedTrip(trip)
    setShowParticipants(true)
  }

  const filteredTrips = trips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gestionar Viajes</h1>
          <p className="text-indigo-200">Administra los viajes y eventos disponibles</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Viaje
          </Button>
        </div>
      </div>

      {showForm ? (
        <TripForm
          onSubmit={handleSubmit}
          editingTrip={editingTrip}
          onCancel={() => {
            setShowForm(false)
            setEditingTrip(null)
          }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-300" />
                <Input
                  placeholder="Buscar viajes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-indigo-950/50 border-indigo-500/30 text-white placeholder:text-indigo-300 w-full"
                />
              </div>
              <Button variant="outline" className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30 w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-250px)]">
              <div className="grid gap-4">
                {filteredTrips.map((trip) => (
                  <TripListItem
                    key={trip.id}
                    trip={trip}
                    onEdit={() => handleEditTrip(trip)}
                    onDelete={() => confirmDeleteTrip(trip)}
                    onViewParticipants={() => handleViewParticipants(trip)}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
              <DialogHeader>
                <DialogTitle className="text-white">Confirmar Eliminación</DialogTitle>
                <DialogDescription className="text-indigo-200">
                  ¿Estás seguro de que deseas eliminar el viaje "{tripToDelete?.title}"? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteTrip}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Participants Dialog */}
          <Dialog open={showParticipants} onOpenChange={setShowParticipants}>
            <DialogContent className="max-w-2xl bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
              <DialogHeader>
                <DialogTitle className="text-white">Participantes</DialogTitle>
                <DialogDescription className="text-indigo-200">
                  Lista de participantes para {selectedTrip?.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedTrip?.participants && selectedTrip.participants.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTrip.participants.map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-indigo-900/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-200" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{participant.name}</p>
                            <p className="text-sm text-indigo-300">{participant.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-indigo-300">No hay participantes registrados para este viaje.</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Toaster />
    </div>
  )
}