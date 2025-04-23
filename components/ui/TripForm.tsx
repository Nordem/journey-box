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
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { DateRange, DayPicker } from "react-day-picker"
import { SelectRangeEventHandler } from "react-day-picker"
import { Calendar as CalendarIcon } from "lucide-react"
import "react-day-picker/dist/style.css"
import { uploadToPinata, removeFromPinata } from "@/lib/pinata"

interface TripFormProps {
    onSubmit: (formData: any) => void
    onCancel: () => void
    editingTrip?: any
}

interface FormData {
    name: string
    location: string
    description: string
    startDate: string
    endDate: string
    maxParticipants: string
    originalPrice: string
    finalPrice: string
    tripManager: string
    hotelName: string
    hotelDescription: string
    hotelAmenities: string
    hotelIncludes: string
    hotelExcludes: string
    imageUrl: string
    galleryImages: string[]
}

interface SubmitData {
    name: string
    location: string
    description: string
    startDate: string
    endDate: string
    maxParticipants: number
    originalPrice: number
    finalPrice: number
    tripManager: string
    hotelName: string
    hotelDescription: string
    hotelAmenities: string[]
    hotelIncludes: string[]
    hotelExcludes: string[]
    imageUrl: string
    galleryImages: string[]
}

interface CompleteDateRange {
    from: Date;
    to: Date;
}

export default function TripForm({ onSubmit, onCancel, editingTrip }: TripFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<FormData>({
        name: editingTrip?.title || "",
        location: editingTrip?.location || "",
        description: editingTrip?.description || "",
        startDate: editingTrip?.startDate || "",
        endDate: editingTrip?.endDate || "",
        maxParticipants: editingTrip?.availability?.toString() || "",
        originalPrice: editingTrip?.regularPrice?.toString() || "",
        finalPrice: editingTrip?.employeePrice?.toString() || "",
        tripManager: editingTrip?.tripManager || "",
        hotelName: editingTrip?.hotel?.name || "",
        hotelDescription: editingTrip?.hotel?.description || "",
        hotelAmenities: editingTrip?.hotel?.amenities?.join(", ") || "",
        hotelIncludes: editingTrip?.includes?.join("\n") || "",
        hotelExcludes: editingTrip?.excludes?.join("\n") || "",
        imageUrl: editingTrip?.imageUrl || "",
        galleryImages: editingTrip?.galleryImages || [],
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

    // Add state for date range
    const [date, setDate] = useState<DateRange | undefined>({
        from: editingTrip?.startDate ? new Date(editingTrip.startDate) : undefined,
        to: editingTrip?.endDate ? new Date(editingTrip.endDate) : undefined,
    });

    // Update form data when editingTrip changes
    useEffect(() => {
        if (editingTrip) {
            setFormData({
                name: editingTrip.title || "",
                location: editingTrip.location || "",
                description: editingTrip.description || "",
                startDate: editingTrip.startDate || "",
                endDate: editingTrip.endDate || "",
                maxParticipants: editingTrip.availability?.toString() || "",
                originalPrice: editingTrip.regularPrice?.toString() || "",
                finalPrice: editingTrip.employeePrice?.toString() || "",
                tripManager: editingTrip.tripManager || "",
                hotelName: editingTrip.hotel?.name || "",
                hotelDescription: editingTrip.hotel?.description || "",
                hotelAmenities: editingTrip.hotel?.amenities?.join(", ") || "",
                hotelIncludes: editingTrip.includes?.join("\n") || "",
                hotelExcludes: editingTrip.excludes?.join("\n") || "",
                imageUrl: editingTrip.imageUrl || "",
                galleryImages: editingTrip.galleryImages || [],
            });
        }
    }, [editingTrip]);

    // Type guard function to check if date range is complete
    const isCompleteDateRange = (range: DateRange | undefined): range is CompleteDateRange => {
        return !!range && !!range.from && !!range.to;
    };

    // Update form data when date range changes
    useEffect(() => {
        if (isCompleteDateRange(date)) {
            setFormData(prev => ({
                ...prev,
                startDate: date.from.toISOString(),
                endDate: date.to.toISOString(),
            }));
        }
    }, [date]);

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

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

            try {
                const ipfsUrl = await uploadToPinata(file);
                setImagePreview(ipfsUrl);
                setFormData(prev => ({ ...prev, imageUrl: ipfsUrl }));
                
                toast({
                    title: "Success",
                    description: "Image uploaded successfully",
                });
            } catch (error) {
                console.error('Error uploading image:', error);
                toast({
                    title: "Error",
                    description: "Failed to upload image",
                    variant: "destructive",
                });
            }
        }
    };

    // Handle gallery image upload
    const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

            try {
                const ipfsUrl = await uploadToPinata(file);
                setGalleryImages(prev => [...prev, {
                    id: `gallery-${Date.now()}`,
                    url: ipfsUrl
                }]);
                
                toast({
                    title: "Success",
                    description: "Gallery image uploaded successfully",
                });
            } catch (error) {
                console.error('Error uploading gallery image:', error);
                toast({
                    title: "Error",
                    description: "Failed to upload gallery image",
                    variant: "destructive",
                });
            }
        }
    };

    // Remove gallery image
    const removeGalleryImage = async (id: string) => {
        const imageToRemove = galleryImages.find(img => img.id === id);
        if (imageToRemove) {
            try {
                // Extract IPFS hash from the URL
                const ipfsHash = imageToRemove.url.split('/').pop();
                if (ipfsHash) {
                    await removeFromPinata(ipfsHash);
                }
                
                setGalleryImages(prev => prev.filter(img => img.id !== id));
                
                toast({
                    title: "Success",
                    description: "Image removed successfully",
                });
            } catch (error) {
                console.error('Error removing image:', error);
                toast({
                    title: "Error",
                    description: "Failed to remove image",
                    variant: "destructive",
                });
            }
        }
    };

    const [alert, setAlert] = useState<{ title: string; description: string } | null>(null);

    // Handle form submission
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Check if all required fields are filled
        const requiredFields = [
            { id: "name", value: formData.name, label: "Título del Evento" },
            { id: "location", value: formData.location, label: "Ubicación" },
            { id: "startDate", value: formData.startDate, label: "Fecha de inicio" },
            { id: "endDate", value: formData.endDate, label: "Fecha de fin" },
            { id: "maxParticipants", value: formData.maxParticipants, label: "Disponibilidad" },
            { id: "originalPrice", value: formData.originalPrice, label: "Precio Original" },
            { id: "finalPrice", value: formData.finalPrice, label: "Precio Final" },
            { id: "description", value: formData.description, label: "Descripción" },
            { id: "tripManager", value: formData.tripManager, label: "Gerente del Evento" },
            { id: "hotelName", value: formData.hotelName, label: "Nombre del Hotel" },
            { id: "hotelDescription", value: formData.hotelDescription, label: "Descripción del Hotel" },
            { id: "hotelAmenities", value: formData.hotelAmenities, label: "Amenidades del Hotel" },
            { id: "hotelIncludes", value: formData.hotelIncludes, label: "Incluye" },
            { id: "hotelExcludes", value: formData.hotelExcludes, label: "No Incluye" },
        ];

        const missingFields = requiredFields.filter(field => !field.value);
        if (missingFields.length > 0) {
            setAlert({
                title: "Campos requeridos",
                description: `Por favor completa los siguientes campos: ${missingFields.map(f => f.label).join(", ")}`,
            });
            return;
        }

        // Check if date range is selected
        if (!isCompleteDateRange(date)) {
            setAlert({
                title: "Fechas requeridas",
                description: "Por favor selecciona un rango de fechas para el evento",
            });
            return;
        }

        // Validate price fields
        const originalPrice = parseFloat(formData.originalPrice);
        const finalPrice = parseFloat(formData.finalPrice);

        if (isNaN(originalPrice) || isNaN(finalPrice)) {
            setAlert({
                title: "Precios inválidos",
                description: "Por favor ingresa valores numéricos válidos para los precios",
            });
            return;
        }

        if (originalPrice <= 0 || finalPrice <= 0) {
            setAlert({
                title: "Precios inválidos",
                description: "Los precios deben ser mayores a 0",
            });
            return;
        }

        if (finalPrice > originalPrice) {
            setAlert({
                title: "Precios inválidos",
                description: "El precio final no puede ser mayor al precio original",
            });
            return;
        }

        // Prepare data for submission
        const submitData: SubmitData = {
            ...formData,
            maxParticipants: parseInt(formData.maxParticipants),
            originalPrice: originalPrice,
            finalPrice: finalPrice,
            startDate: date.from.toISOString(),
            endDate: date.to.toISOString(),
            hotelAmenities: formData.hotelAmenities.split(",").map(item => item.trim()),
            hotelIncludes: formData.hotelIncludes.split("\n").filter(item => item.trim()),
            hotelExcludes: formData.hotelExcludes.split("\n").filter(item => item.trim()),
            imageUrl: formData.imageUrl,
            galleryImages: galleryImages.map(img => img.url),
        };

        onSubmit(submitData);
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
                <form onSubmit={handleFormSubmit} className="space-y-8">
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
                        </TabsList>

                        <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-250px)] pr-4">
                            <TabsContent value="basic" className="mt-0 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Título del Evento</Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., Summer Conference 2024"
                                            value={formData.name}
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

                                <div className="space-y-2">
                                    <Label>Fechas del Evento</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date?.from ? (
                                                    date.to ? (
                                                        <>
                                                            {format(date.from, "PPP", { locale: es })} -{" "}
                                                            {format(date.to, "PPP", { locale: es })}
                                                        </>
                                                    ) : (
                                                        format(date.from, "PPP", { locale: es })
                                                    )
                                                ) : (
                                                    <span>Selecciona un rango de fechas</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <DayPicker
                                                mode="range"
                                                defaultMonth={date?.from}
                                                selected={date}
                                                onSelect={setDate}
                                                numberOfMonths={2}
                                                locale={es}
                                                className="p-3"
                                                classNames={{
                                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                                    month: "space-y-4",
                                                    caption: "flex justify-center pt-1 relative items-center",
                                                    caption_label: "text-sm font-medium",
                                                    nav: "space-x-1 flex items-center",
                                                    nav_button: cn(
                                                        "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                                                    ),
                                                    nav_button_previous: "absolute left-1",
                                                    nav_button_next: "absolute right-1",
                                                    table: "w-full border-collapse space-y-1",
                                                    head_row: "flex",
                                                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                                    row: "flex w-full mt-2",
                                                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                                    day: cn(
                                                        "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                                                    ),
                                                    day_range_end: "day-range-end",
                                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                                    day_today: "bg-accent text-accent-foreground",
                                                    day_outside: "text-muted-foreground opacity-50",
                                                    day_disabled: "text-muted-foreground opacity-50",
                                                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                                    day_hidden: "invisible",
                                                }}
                                                components={{
                                                    IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                                                    IconRight: () => <ChevronRight className="h-4 w-4" />,
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Disponibilidad (%)</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="maxParticipants"
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="e.g., 75"
                                                className="pl-10"
                                                value={formData.maxParticipants}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Precio Original</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="originalPrice"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 1500.00"
                                                className="pl-10"
                                                value={formData.originalPrice}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Precio Final</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="finalPrice"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 1200.00"
                                                className="pl-10"
                                                value={formData.finalPrice}
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
                                            <Label htmlFor="galleryImages">Galería de Imágenes</Label>
                                        </div>
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
                                        <Label htmlFor="hotelIncludes">Incluye (un elemento por línea)</Label>
                                        <Textarea
                                            id="hotelIncludes"
                                            placeholder="Ej: Vuelos redondos Ciudad de México - Cancún&#10;Traslados aeropuerto - hotel - aeropuerto&#10;3 noches de alojamiento en hotel 5 estrellas"
                                            className="min-h-[120px]"
                                            value={formData.hotelIncludes}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelExcludes">No Incluye (un elemento por línea)</Label>
                                        <Textarea
                                            id="hotelExcludes"
                                            placeholder="Ej: Gastos personales y propinas&#10;Actividades no mencionadas en el itinerario&#10;Tratamientos de spa"
                                            className="min-h-[120px]"
                                            value={formData.hotelExcludes}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
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