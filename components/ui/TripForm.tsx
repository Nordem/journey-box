"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Plus,
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
    X,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TripFormProps {
    onSubmit: (formData: FormData) => void
    onCancel: () => void
    editingTrip?: any
}

export default function TripForm({ onSubmit, onCancel, editingTrip }: TripFormProps) {
    const { toast } = useToast();
    // Add state to track form data
    const [formData, setFormData] = useState({
        title: editingTrip?.title || "",
        location: editingTrip?.location || "",
        dates: editingTrip?.dates || "",
        availability: editingTrip?.availability || "",
        employeePrice: editingTrip?.employeePrice || "",
        regularPrice: editingTrip?.regularPrice || "",
        description: editingTrip?.description || "",
        tripManager: editingTrip?.tripManager || "",
        hasVideo: editingTrip?.hasVideo || false,
        videoUrl: editingTrip?.videoUrl || "",
        hotelName: editingTrip?.hotel?.name || "",
        hotelDescription: editingTrip?.hotel?.description || "",
        hotelAmenities: editingTrip?.hotel?.amenities?.join(", ") || "",
        includes: editingTrip?.includes?.join("\n") || "",
        excludes: editingTrip?.excludes?.join("\n") || "",
        day1Title: editingTrip?.itinerary?.[0]?.title || "Llegada y bienvenida",
        day1Activities: editingTrip?.itinerary?.[0]?.activities?.join("\n") || "",
        day2Title: editingTrip?.itinerary?.[1]?.title || "Exploración",
        day2Activities: editingTrip?.itinerary?.[1]?.activities?.join("\n") || "",
        imageUrl: editingTrip?.imageUrl || "",
    });

    // Add state for image preview
    const [imagePreview, setImagePreview] = useState<string>(editingTrip?.imageUrl || "");

    // Add state for gallery images
    const [galleryImages, setGalleryImages] = useState<Array<{ id: string, url: string }>>(
        editingTrip?.galleryImages?.map((url: string, index: number) => ({
            id: `gallery-${index}`,
            url
        })) || []
    );

    // Add state to track additional days
    const [additionalDays, setAdditionalDays] = useState<Array<{ day: number, title: string, activities: string }>>(
        editingTrip?.itinerary && editingTrip.itinerary.length > 2
            ? editingTrip.itinerary.slice(2).map((day: any, index: number) => ({
                day: index + 3,
                title: day.title || `Día ${index + 3}`,
                activities: day.activities?.join("\n") || ""
            }))
            : []
    );

    // Update form data when editingTrip changes
    useEffect(() => {
        if (editingTrip) {
            setFormData({
                title: editingTrip.title || "",
                location: editingTrip.location || "",
                dates: editingTrip.dates || "",
                availability: editingTrip.availability || "",
                employeePrice: editingTrip.employeePrice || "",
                regularPrice: editingTrip.regularPrice || "",
                description: editingTrip.description || "",
                tripManager: editingTrip.tripManager || "",
                hasVideo: editingTrip.hasVideo || false,
                videoUrl: editingTrip.videoUrl || "",
                hotelName: editingTrip.hotel?.name || "",
                hotelDescription: editingTrip.hotel?.description || "",
                hotelAmenities: editingTrip.hotel?.amenities?.join(", ") || "",
                includes: editingTrip.includes?.join("\n") || "",
                excludes: editingTrip.excludes?.join("\n") || "",
                day1Title: editingTrip.itinerary?.[0]?.title || "Llegada y bienvenida",
                day1Activities: editingTrip.itinerary?.[0]?.activities?.join("\n") || "",
                day2Title: editingTrip.itinerary?.[1]?.title || "Exploración",
                day2Activities: editingTrip.itinerary?.[1]?.activities?.join("\n") || "",
                imageUrl: editingTrip.imageUrl || "",
            });

            // Set additional days
            if (editingTrip.itinerary && editingTrip.itinerary.length > 2) {
                setAdditionalDays(
                    editingTrip.itinerary.slice(2).map((day: any, index: number) => ({
                        day: index + 3,
                        title: day.title || `Día ${index + 3}`,
                        activities: day.activities?.join("\n") || ""
                    }))
                );
            }
        }
    }, [editingTrip]);

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [id]: checkbox.checked }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    // Handle additional day input changes
    const handleAdditionalDayChange = (index: number, field: 'title' | 'activities', value: string) => {
        setAdditionalDays(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    // Add a new day
    const addNewDay = () => {
        setAdditionalDays(prev => [
            ...prev,
            {
                day: prev.length + 3,
                title: `Día ${prev.length + 3}`,
                activities: ""
            }
        ]);
    };

    // Remove a day
    const removeDay = (index: number) => {
        setAdditionalDays(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            // Update day numbers
            return updated.map((day, i) => ({
                ...day,
                day: i + 3,
                title: day.title.includes("Día") ? `Día ${i + 3}` : day.title
            }));
        });
    };

    // Handle image upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload an image file.",
                    variant: "destructive",
                });
                return;
            }

            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setFormData(prev => ({ ...prev, imageUrl: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle gallery image upload
    const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload an image file.",
                    variant: "destructive",
                });
                return;
            }

            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setGalleryImages(prev => [...prev, {
                    id: `gallery-${Date.now()}`,
                    url: base64String
                }]);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove gallery image
    const removeGalleryImage = (id: string) => {
        setGalleryImages(prev => prev.filter(img => img.id !== id));
    };

    const [alert, setAlert] = useState<{ title: string; description: string } | null>(null);

    // Handle form submission
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if an image has been uploaded
        if (!imagePreview) {
            setAlert({
                title: "Imagen requerida",
                description: "Por favor, sube una imagen antes de guardar el evento.",
            });
            return;
        }
        setTimeout(() => {
            setAlert(null);
        }, 3000);
        
        // Create a FormData object with the current state
        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, value.toString());
        });

        // Add gallery images to FormData
        formDataObj.append("galleryImagesCount", galleryImages.length.toString());
        galleryImages.forEach((img, index) => {
            formDataObj.append(`galleryImage${index}`, img.url);
        });

        // Add additional days to FormData
        additionalDays.forEach((day, index) => {
            formDataObj.append(`additionalDay${index}Title`, day.title);
            formDataObj.append(`additionalDay${index}Activities`, day.activities);
        });

        // Add the count of additional days
        formDataObj.append("additionalDaysCount", additionalDays.length.toString());

        // Call the original onSubmit with the FormData
        onSubmit(formDataObj);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {editingTrip ? `Editar: ${editingTrip.title}` : "Agregar Evento"}
                </CardTitle>
                <CardDescription>
                    {editingTrip
                        ? "Modifica la información del evento existente."
                        : "Completa todos los campos para crear un nuevo evento en el catálogo."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Render the Alert component if alert state is set */}
                {alert && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>{alert.description}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-6 bg-transparent border border-indigo-500/30 rounded-xl p-2">
                            <TabsTrigger
                                value="basic"
                                className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r from-indigo-500/20 to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-400"
                            >
                                Información Básica
                            </TabsTrigger>
                            <TabsTrigger
                                value="media"
                                className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r from-indigo-500/20 to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-400"
                            >
                                Imágenes y Videos
                            </TabsTrigger>
                            <TabsTrigger
                                value="details"
                                className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r from-indigo-500/20 to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-400"
                            >
                                Detalles
                            </TabsTrigger>
                            <TabsTrigger
                                value="itinerary"
                                className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r from-indigo-500/20 to-purple-500/20 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-indigo-400"
                            >
                                Itinerario
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-250px)] pr-4">
                            <TabsContent value="basic" className="mt-0 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Título del Evento</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g., Summer Conference 2024"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ubicación</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="location"
                                                placeholder="e.g., San Francisco, CA"
                                                className="pl-10"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fechas</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="dates"
                                                placeholder="e.g., June 15-18, 2024"
                                                className="pl-10"
                                                value={formData.dates}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Disponibilidad (%)</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="availability"
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="e.g., 75"
                                                className="pl-10"
                                                value={formData.availability}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Precio Regular (USD)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="regularPrice"
                                                type="number"
                                                min="0"
                                                placeholder="e.g., 1200"
                                                className="pl-10"
                                                value={formData.regularPrice}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Precio Empleado (USD)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="employeePrice"
                                                type="number"
                                                min="0"
                                                placeholder="e.g., 300"
                                                className="pl-10"
                                                value={formData.employeePrice}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe el evento, sus atractivos y experiencias..."
                                        className="min-h-[120px]"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Gerente del Evento</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="tripManager"
                                            placeholder="e.g., John Smith - Recursos Humanos"
                                            className="pl-10"
                                            value={formData.tripManager}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="media" className="mt-0 space-y-4">
                                <div className="space-y-4">
                                    <div className="p-4 border border-dashed rounded-lg text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            {imagePreview ? (
                                                <div className="relative w-full max-w-md h-48">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="absolute top-2 right-2"
                                                        onClick={() => {
                                                            setImagePreview("");
                                                            setFormData(prev => ({ ...prev, imageUrl: "" }));
                                                        }}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">
                                                        Arrastra y suelta la imagen principal o haz click para seleccionar
                                                    </p>
                                                    <Input
                                                        id="imageUpload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}

                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="mt-2"
                                                        onClick={() => document.getElementById("imageUpload")?.click()}
                                                    >
                                                        Seleccionar Imagen
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                            <Label htmlFor="videoUrl">URL del Video (opcional)</Label>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="hasVideo"
                                                    className="mr-2"
                                                    checked={formData.hasVideo}
                                                    onChange={handleInputChange}
                                                />
                                                <Label htmlFor="hasVideo" className="text-sm">
                                                    Tiene video
                                                </Label>
                                            </div>
                                        </div>
                                        <Input
                                            id="videoUrl"
                                            placeholder="e.g., https://example.com/video.mp4"
                                            value={formData.videoUrl}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="font-medium mb-2">Galería de Imágenes</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Agrega más imágenes para mostrar en la galería del evento.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                            {galleryImages.map((img) => (
                                                <div key={img.id} className="relative group">
                                                    <img
                                                        src={img.url}
                                                        alt="Gallery"
                                                        className="w-full h-48 object-cover rounded-lg"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeGalleryImage(img.id)}
                                                    >
                                                        <X size={16} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 border border-dashed rounded-lg text-center">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    Haz click para agregar más imágenes a la galería
                                                </p>
                                                <Input
                                                    id="galleryUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleGalleryImageUpload}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById("galleryUpload")?.click()}
                                                >
                                                    Agregar Imagen
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="mt-0 space-y-4">
                                <div className="space-y-4">
                                    <h3 className="text-md font-medium">Información del Hotel</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelName">Nombre del Hotel</Label>
                                        <div className="relative">
                                            <Hotel className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="hotelName"
                                                placeholder="Ej: Paradisus Playa del Carmen"
                                                className="pl-10"
                                                value={formData.hotelName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelDescription">Descripción del Hotel</Label>
                                        <Textarea
                                            id="hotelDescription"
                                            placeholder="Describe el hotel, sus instalaciones y servicios..."
                                            className="min-h-[100px]"
                                            value={formData.hotelDescription}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelAmenities">Amenidades (separadas por coma)</Label>
                                        <Input
                                            id="hotelAmenities"
                                            placeholder="Ej: Todo incluido, Spa, Piscinas, WiFi gratis"
                                            value={formData.hotelAmenities}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-4">
                                    <h3 className="text-md font-medium">Incluye y No Incluye</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="includes">Incluye (un elemento por línea)</Label>
                                        <Textarea
                                            id="includes"
                                            placeholder="Ej: Vuelos redondos Ciudad de México - Cancún&#10;Traslados aeropuerto - hotel - aeropuerto&#10;3 noches de alojamiento en hotel 5 estrellas"
                                            className="min-h-[120px]"
                                            value={formData.includes}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="excludes">No Incluye (un elemento por línea)</Label>
                                        <Textarea
                                            id="excludes"
                                            placeholder="Ej: Gastos personales y propinas&#10;Actividades no mencionadas en el itinerario&#10;Tratamientos de spa"
                                            className="min-h-[120px]"
                                            value={formData.excludes}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="itinerary" className="mt-0 space-y-4">
                                <div className="space-y-6">
                                    <div className="p-4 rounded-lg border">
                                        <h4 className="text-md font-medium mb-3 flex items-center">
                                            <Plane size={18} className="text-muted-foreground mr-2" />
                                            Día 1: Llegada y bienvenida
                                        </h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="day1Title">Título del Día</Label>
                                            <Input
                                                id="day1Title"
                                                value={formData.day1Title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 mt-3">
                                            <Label htmlFor="day1Activities">Actividades (una por línea)</Label>
                                            <Textarea
                                                id="day1Activities"
                                                placeholder="Ej: Vuelo Ciudad de México - Cancún&#10;Traslado al hotel y check-in&#10;Cena de bienvenida en el restaurante principal"
                                                className="min-h-[100px]"
                                                value={formData.day1Activities}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-lg border">
                                        <h4 className="text-md font-medium mb-3 flex items-center">
                                            <Camera size={18} className="text-muted-foreground mr-2" />
                                            Día 2: Exploración
                                        </h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="day2Title">Título del Día</Label>
                                            <Input
                                                id="day2Title"
                                                value={formData.day2Title}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 mt-3">
                                            <Label htmlFor="day2Activities">Actividades (una por línea)</Label>
                                            <Textarea
                                                id="day2Activities"
                                                placeholder="Ej: Desayuno buffet en el hotel&#10;Excursión a las ruinas arqueológicas&#10;Almuerzo en restaurante local con vista al mar"
                                                className="min-h-[100px]"
                                                value={formData.day2Activities}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Days */}
                                    {additionalDays.map((day, index) => (
                                        <div key={index} className="p-4 rounded-lg border">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                                                <h4 className="text-md font-medium flex items-center">
                                                    <Plane size={18} className="text-muted-foreground mr-2" />
                                                    Día {day.day}: {day.title}
                                                </h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeDay(index)}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor={`additionalDay${index}Title`}>Título del Día</Label>
                                                <Input
                                                    id={`additionalDay${index}Title`}
                                                    value={day.title}
                                                    onChange={(e) => handleAdditionalDayChange(index, 'title', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2 mt-3">
                                                <Label htmlFor={`additionalDay${index}Activities`}>Actividades (una por línea)</Label>
                                                <Textarea
                                                    id={`additionalDay${index}Activities`}
                                                    placeholder="Ej: Desayuno buffet en el hotel&#10;Excursión a las ruinas arqueológicas&#10;Almuerzo en restaurante local con vista al mar"
                                                    className="min-h-[100px]"
                                                    value={day.activities}
                                                    onChange={(e) => handleAdditionalDayChange(index, 'activities', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={addNewDay}
                                    >
                                        <Plus size={16} className="mr-2" /> Añadir otro día
                                    </Button>
                                </div>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>

                    <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="w-full md:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="w-full md:w-auto">
                            <Check size={16} className="mr-2" /> {editingTrip ? "Actualizar Evento" : "Guardar Evento"}
                        </Button>
                    </div>
                </form>
                <Toaster />
            </CardContent>


        </Card>
    )
}