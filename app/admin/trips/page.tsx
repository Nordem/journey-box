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

// Define initial trips data structure
const initialTrips: Trip[] = [
  {
    id: 1,
    title: "Sample Event",
    location: "Sample Location",
    dates: "Jan 1-5, 2024",
    availability: 100,
    employeePrice: 1000,
    regularPrice: 2000,
    description: "Sample description",
    imageUrl: "/placeholder.svg",
    hasVideo: false,
    participants: [],
    tripManager: "John Doe - Events",
  }
]

export default function AdminTripsPage() {
  const [showForm, setShowForm] = useState(false)
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const { toast } = useToast()

  // Load trips on init
  useEffect(() => {
    // Here you would typically fetch from your API
    // For now using localStorage as placeholder
    if (typeof window !== "undefined") {
      const savedTrips = localStorage.getItem("adminTrips")
      if (savedTrips) {
        try {
          setTrips(JSON.parse(savedTrips))
        } catch (e) {
          console.error("Error parsing saved trips:", e)
          setTrips(initialTrips)
          localStorage.setItem("adminTrips", JSON.stringify(initialTrips))
        }
      } else {
        setTrips(initialTrips)
        localStorage.setItem("adminTrips", JSON.stringify(initialTrips))
      }
    }
  }, [])

  const handleSubmit = (formData: FormData) => {
    // Create a new trip object from the form data
    const newTrip: Trip = {
      id: editingTrip?.id || Date.now().toString(),
      title: formData.get('title') as string,
      location: formData.get('location') as string,
      dates: formData.get('dates') as string,
      availability: parseInt(formData.get('availability') as string),
      employeePrice: parseFloat(formData.get('employeePrice') as string),
      regularPrice: parseFloat(formData.get('regularPrice') as string),
      description: formData.get('description') as string,
      imageUrl: formData.get('imageUrl') as string,
      hasVideo: formData.get('hasVideo') === 'true',
      videoUrl: formData.get('videoUrl') as string || '',
      participants: [],
      tripManager: formData.get('tripManager') as string,
      hotel: {
        name: formData.get('hotelName') as string,
        description: formData.get('hotelDescription') as string,
        amenities: (formData.get('hotelAmenities') as string).split(',').map(item => item.trim()),
      },
      // Includes and excludes
      includes: (formData.get('includes') as string).split('\n').filter(item => item.trim()),
      excludes: (formData.get('excludes') as string).split('\n').filter(item => item.trim()),
      // Itinerary
      itinerary: [
        {
          title: formData.get('day1Title') as string,
          activities: (formData.get('day1Activities') as string).split('\n').filter(item => item.trim()),
        },
        {
          title: formData.get('day2Title') as string,
          activities: (formData.get('day2Activities') as string).split('\n').filter(item => item.trim()),
        },
      ],
    };

    // Add gallery images
    const galleryImagesCount = parseInt(formData.get('galleryImagesCount') as string) || 0;
    newTrip.galleryImages = [];
    for (let i = 0; i < galleryImagesCount; i++) {
      const imageUrl = formData.get(`galleryImage${i}`) as string;
      if (imageUrl) {
        newTrip.galleryImages.push(imageUrl);
      }
    }

    // Add additional days to the itinerary
    const additionalDaysCount = parseInt(formData.get('additionalDaysCount') as string) || 0;
    for (let i = 0; i < additionalDaysCount; i++) {
      const title = formData.get(`additionalDay${i}Title`) as string;
      const activities = (formData.get(`additionalDay${i}Activities`) as string).split('\n').filter(item => item.trim());
      
      if (title && activities.length > 0) {
        newTrip.itinerary?.push({
          title,
          activities,
        });
      }
    }

    // Update the trips state
    if (editingTrip) {
      setTrips(trips.map(trip => trip.id === editingTrip.id ? newTrip : trip));
      toast({
        title: "Evento creado exitosamente",
        description: "Los cambios se han guardado.",
      });
    } else {
      setTrips([...trips, newTrip]);
      toast({
        title: "Evento creado exitosamente",
        description: "El nuevo evento ha sido agregado al catálogo.",
      });
    }

    // Save to localStorage
    const updatedTrips = editingTrip 
      ? trips.map(trip => trip.id === editingTrip.id ? newTrip : trip) 
      : [...trips, newTrip];
    localStorage.setItem('adminTrips', JSON.stringify(updatedTrips));

    // Close the form
    setShowForm(false);
    setEditingTrip(null);
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setShowForm(true)
  }

  const confirmDeleteTrip = (trip: Trip) => {
    setTripToDelete(trip)
    setShowDeleteConfirm(true)
  }

  const handleDeleteTrip = () => {
    if (!tripToDelete) return
    
    const updatedTrips = trips.filter((trip) => trip.id !== tripToDelete.id)
    setTrips(updatedTrips)

    if (typeof window !== "undefined") {
      localStorage.setItem("adminTrips", JSON.stringify(updatedTrips))
    }

    toast({
      title: "Evento eliminado",
      description: `El evento ${tripToDelete.title} ha sido eliminado exitosamente.`,
    })

    setShowDeleteConfirm(false)
    setTripToDelete(null)
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