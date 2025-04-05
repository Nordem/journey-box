"use client"

import { useState, useEffect } from "react"
import {
  Edit3,
  Plus,
  X,
  Upload,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Hotel,
  Plane,
  Check,
  Camera,
  User,
  Trash2,
  Eye,
  Search,
  Filter,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import Sidebar2 from "@/components/ui/sidebar2"
import TripListItem from "@/components/ui/TripListItem"
import TripForm from "@/components/ui/TripForm"
import { cn } from "@/lib/utils"

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
  const [isCollapsed, setIsCollapsed] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false)

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
      imageUrl: formData.get('imageUrl') as string || '/placeholder.jpg',
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
    <div className="flex bg-black">
      <Sidebar2 
        isAdmin={true} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "ml-[70px]" : "ml-[250px]",
      )}>
        <main className="min-h-screen bg-black text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Gestionar Eventos
              </h1>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg"
                onClick={() => {
                  setEditingTrip(null)
                  setShowForm(!showForm)
                }}
              >
                {showForm ? (
                  <>
                    <X size={16} className="mr-2" /> Cancelar
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" /> Agregar Evento
                  </>
                )}
              </Button>
            </div>

            {showForm ? (
              <TripForm
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowForm(false)
                  setEditingTrip(null)
                }}
                editingTrip={editingTrip}
              />
            ) : (
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-transparent border border-indigo-500/30 rounded-xl overflow-hidden">
                  <TabsTrigger
                    value="list"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white data-[state=active]:shadow-none text-indigo-300 h-full rounded-l-xl"
                  >
                    Lista de Eventos
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white data-[state=active]:shadow-none text-indigo-300 h-full rounded-r-xl"
                  >
                    Estadísticas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="mt-0">
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                      <Input
                        placeholder="Buscar por destino o ubicación..."
                        className="bg-indigo-950/20 border-indigo-500/30 text-white pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {filteredTrips.length > 0 ? (
                    <div className="space-y-4">
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
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No se encontraron eventos que coincidan con tu búsqueda.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="stats" className="mt-0">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                      <Filter className="text-white" size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Estadísticas de Eventos</h3>
                    <p className="text-gray-400 mb-6 max-w-md">
                      Ver datos sobre reservas, destinos populares y tendencias de uso de la plataforma.
                    </p>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg">
                      Generar Reporte
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="bg-gradient-to-b from-indigo-950/90 to-black/90 border border-indigo-500/30 text-white">
              <DialogHeader>
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogDescription className="text-gray-400">
                  ¿Estás seguro de querer eliminar este evento? Esta acción no se puede deshacer.
                </DialogDescription>
              </DialogHeader>

              {tripToDelete && (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20 my-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={tripToDelete.imageUrl || "/placeholder.svg"}
                      alt={tripToDelete.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{tripToDelete.title}</h4>
                    <p className="text-sm text-gray-400">{tripToDelete.location}</p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDeleteTrip}>
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Toaster />
        </main>
      </div>
    </div>
  )
}