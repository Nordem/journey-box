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
    Play,
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
import { ValidationModal } from "@/components/ui/validation-modal"

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
    galleryImages: Array<{ url: string; type: 'image' | 'video' }>
    itineraryActions: ItineraryAction[]
}

interface ItineraryAction {
    id?: string
    dayTitle: string
    title: string
    startTime: string
    responsible: string
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
    galleryImages: Array<{ url: string; type: 'image' | 'video' }>
    itineraryActions: ItineraryAction[]
}

interface CompleteDateRange {
    from: Date;
    to: Date;
}

// Add new interface for form validation
interface FormValidation {
    [key: string]: boolean;
}

interface GalleryMedia {
    id: string;
    url: string;
    type: 'image' | 'video';
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
        itineraryActions: editingTrip?.itineraryActions || [],
    });

    // Add state for image preview
    const [imagePreview, setImagePreview] = useState<string>(editingTrip?.imageUrl || "");

    // Add state for gallery media
    const [galleryMedia, setGalleryMedia] = useState<GalleryMedia[]>(
        editingTrip?.galleryImages?.map((url: string, index: number) => ({
            id: `gallery-${index}`,
            url,
            type: 'image'
        })) || []
    );

    // Add state for date range
    const [date, setDate] = useState<DateRange | undefined>({
        from: editingTrip?.startDate ? new Date(editingTrip.startDate) : undefined,
        to: editingTrip?.endDate ? new Date(editingTrip.endDate) : undefined,
    });

    // Add state for form validation
    const [formValidation, setFormValidation] = useState<FormValidation>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

    // Update form data when editingTrip changes
    useEffect(() => {
        if (editingTrip) {
            const startDate = editingTrip.startDate ? new Date(editingTrip.startDate) : undefined;
            const endDate = editingTrip.endDate ? new Date(editingTrip.endDate) : undefined;
            
            setDate({
                from: startDate,
                to: endDate
            });

            setFormData({
                name: editingTrip.title || "",
                location: editingTrip.location || "",
                description: editingTrip.description || "",
                startDate: startDate?.toISOString() || "",
                endDate: endDate?.toISOString() || "",
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
                itineraryActions: editingTrip.itineraryActions || [],
            });

            // Update gallery media state with proper type detection
            setGalleryMedia(
                (editingTrip.galleryImages || []).map((media: any, index: number) => {
                    const url = typeof media === 'string' ? media : media.url;
                    const type = typeof media === 'string' 
                        ? (url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image')
                        : media.type;
                    
                    return {
                        id: `gallery-${index}`,
                        url,
                        type
                    };
                })
            );
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

    // Add validation function
    const validateField = (fieldId: string, value: string | string[] | ItineraryAction[]) => {
        if (Array.isArray(value)) {
            const isValid = value.length > 0;
            setFormValidation(prev => ({ ...prev, [fieldId]: isValid }));
            return isValid;
        }
        const isValid = value.toString().trim() !== '';
        setFormValidation(prev => ({ ...prev, [fieldId]: isValid }));
        return isValid;
    };

    // Modify handleInputChange to include validation
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value, type } = e.target;
        setTouchedFields(prev => new Set(prev).add(id));

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [id]: checkbox.checked }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
            validateField(id, value);
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

    // Handle gallery media upload
    const handleGalleryMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check if file is an image or video
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                toast({
                    title: "Invalid file type",
                    description: "Please upload an image or video file.",
                    variant: "destructive",
                });
                return;
            }

            try {
                const ipfsUrl = await uploadToPinata(file);
                const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
                
                setGalleryMedia(prev => [...prev, {
                    id: `gallery-${Date.now()}`,
                    url: ipfsUrl,
                    type: mediaType
                }]);
                
                toast({
                    title: "Success",
                    description: `Media uploaded successfully`,
                });
            } catch (error) {
                console.error('Error uploading media:', error);
                toast({
                    title: "Error",
                    description: "Failed to upload media",
                    variant: "destructive",
                });
            }
        }
    };

    // Remove gallery media
    const removeGalleryMedia = async (id: string) => {
        const mediaToRemove = galleryMedia.find(media => media.id === id);
        if (mediaToRemove) {
            try {
                // First remove from UI state
                setGalleryMedia(prev => prev.filter(media => media.id !== id));
                
                // Then try to remove from Pinata
                const ipfsHash = mediaToRemove.url.split('/').pop();
                if (ipfsHash) {
                    try {
                        await removeFromPinata(ipfsHash);
                        toast({
                            title: "Success",
                            description: "Media removed successfully",
                        });
                    } catch (error) {
                        console.error('Error removing from Pinata:', error);
                        // Even if Pinata removal fails, we've already removed it from the UI
                        toast({
                            title: "Warning",
                            description: "Media removed from gallery but may still exist in storage",
                            variant: "default",
                        });
                    }
                }
            } catch (error) {
                console.error('Error removing media:', error);
                toast({
                    title: "Error",
                    description: "Failed to remove media",
                    variant: "destructive",
                });
            }
        }
    };

    const [alert, setAlert] = useState<{ title: string; description: string } | null>(null);

    // Handle itinerary action changes
    const handleItineraryActionChange = (index: number, field: keyof ItineraryAction, value: string) => {
        setFormData(prev => {
            const newActions = [...prev.itineraryActions];
            newActions[index] = { ...newActions[index], [field]: value };
            return { ...prev, itineraryActions: newActions };
        });
    };

    // Add new itinerary action
    const addItineraryAction = () => {
        setFormData(prev => ({
            ...prev,
            itineraryActions: [
                ...prev.itineraryActions,
                { dayTitle: "", title: "", startTime: "", responsible: "" }
            ]
        }));
    };

    // Remove itinerary action
    const removeItineraryAction = (index: number) => {
        setFormData(prev => ({
            ...prev,
            itineraryActions: prev.itineraryActions.filter((_, i) => i !== index)
        }));
    };

    // Add new state for validation modal
    const [validationModal, setValidationModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        missingFields: string[];
    }>({
        isOpen: false,
        title: "",
        description: "",
        missingFields: []
    });

    // Modify handleFormSubmit to include validation
    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validate all required fields
        const requiredFields = [
            { id: 'name', label: 'Nombre del Evento' },
            { id: 'location', label: 'Ubicación' },
            { id: 'description', label: 'Descripción' },
            { id: 'maxParticipants', label: 'Cupo' },
            { id: 'originalPrice', label: 'Precio Original' },
            { id: 'finalPrice', label: 'Precio Final' },
            { id: 'tripManager', label: 'Gerente del Evento' }
        ];

        const missingFields = requiredFields
            .filter(field => {
                const value = formData[field.id as keyof FormData];
                return !value || value.toString().trim() === '';
            })
            .map(field => field.label);

        if (missingFields.length > 0) {
            setValidationModal({
                isOpen: true,
                title: "Error",
                description: "Por favor completa todos los campos requeridos",
                missingFields
            });
            return;
        }

        if (!date?.from || !date?.to) {
            setValidationModal({
                isOpen: true,
                title: "Error",
                description: "Por favor selecciona un rango de fechas válido",
                missingFields: ["Rango de fechas"]
            });
            return;
        }

        const submitData: SubmitData = {
            ...formData,
            startDate: date.from.toISOString(),
            endDate: date.to.toISOString(),
            maxParticipants: parseInt(formData.maxParticipants),
            originalPrice: parseFloat(formData.originalPrice),
            finalPrice: parseFloat(formData.finalPrice),
            hotelAmenities: formData.hotelAmenities.split(",").map(item => item.trim()),
            hotelIncludes: formData.hotelIncludes.split("\n").map(item => item.trim()),
            hotelExcludes: formData.hotelExcludes.split("\n").map(item => item.trim()),
            galleryImages: galleryMedia.map(media => ({
                url: media.url,
                type: media.type
            })),
            itineraryActions: formData.itineraryActions.map(action => ({
                ...action,
                id: action.id || undefined
            }))
        };

        onSubmit(submitData);
    };

    // Add helper function to show required indicator
    const RequiredIndicator = () => (
        <span className="text-yellow-500 ml-1">*</span>
    );

    // Add helper function to show error message
    const ErrorMessage = ({ fieldId }: { fieldId: string }) => {
        if (!touchedFields.has(fieldId)) return null;
        return !formValidation[fieldId] ? (
            <p className="text-sm text-red-500 mt-1">Este campo es requerido</p>
        ) : null;
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
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="hotel">Hotel</TabsTrigger>
                            <TabsTrigger value="images">Imágenes</TabsTrigger>
                            <TabsTrigger value="itinerary">Itinerario</TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-250px)] pr-4">
                            <TabsContent value="general" className="mt-0 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>
                                            Título del Evento <RequiredIndicator />
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="e.g., Summer Conference 2024"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={cn(
                                                touchedFields.has('name') && !formValidation['name'] && "border-red-500"
                                            )}
                                        />
                                        <ErrorMessage fieldId="name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Ubicación <RequiredIndicator />
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="location"
                                                placeholder="e.g., San Francisco, CA"
                                                className={cn(
                                                    "pl-10",
                                                    touchedFields.has('location') && !formValidation['location'] && "border-red-500"
                                                )}
                                                value={formData.location}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <ErrorMessage fieldId="location" />
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
                                        <Label>
                                            Cupo <RequiredIndicator />
                                        </Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="maxParticipants"
                                                type="number"
                                                min="0"
                                                max="10000"
                                                placeholder="e.g., 75"
                                                className={cn(
                                                    "pl-10",
                                                    touchedFields.has('maxParticipants') && !formValidation['maxParticipants'] && "border-red-500"
                                                )}
                                                value={formData.maxParticipants}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <ErrorMessage fieldId="maxParticipants" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>
                                            Precio Original <RequiredIndicator />
                                        </Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="originalPrice"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 1500.00"
                                                className={cn(
                                                    "pl-10",
                                                    touchedFields.has('originalPrice') && !formValidation['originalPrice'] && "border-red-500"
                                                )}
                                                value={formData.originalPrice}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <ErrorMessage fieldId="originalPrice" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>
                                            Precio Final <RequiredIndicator />
                                        </Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="finalPrice"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="e.g., 1200.00"
                                                className={cn(
                                                    "pl-10",
                                                    touchedFields.has('finalPrice') && !formValidation['finalPrice'] && "border-red-500"
                                                )}
                                                value={formData.finalPrice}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <ErrorMessage fieldId="finalPrice" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Descripción <RequiredIndicator />
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Describe el evento, sus atractivos y experiencias..."
                                        className={cn(
                                            "min-h-[120px]",
                                            touchedFields.has('description') && !formValidation['description'] && "border-red-500"
                                        )}
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                    <ErrorMessage fieldId="description" />
                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Gerente del Evento <RequiredIndicator />
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="tripManager"
                                            placeholder="e.g., John Smith - Recursos Humanos"
                                            className={cn(
                                                "pl-10",
                                                touchedFields.has('tripManager') && !formValidation['tripManager'] && "border-red-500"
                                            )}
                                            value={formData.tripManager}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <ErrorMessage fieldId="tripManager" />
                                </div>
                            </TabsContent>

                            <TabsContent value="hotel" className="mt-0 space-y-4">
                                <div className="space-y-4">
                                    <h3 className="text-md font-medium">Información del Hotel</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelName">
                                            Nombre del Hotel
                                        </Label>
                                        <div className="relative">
                                            <Hotel className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="hotelName"
                                                placeholder="Ej: Paradisus Playa del Carmen"
                                                className={cn(
                                                    "pl-10",
                                                    touchedFields.has('hotelName') && !formValidation['hotelName'] && "border-red-500"
                                                )}
                                                value={formData.hotelName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <ErrorMessage fieldId="hotelName" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelDescription">
                                            Descripción del Hotel
                                        </Label>
                                        <Textarea
                                            id="hotelDescription"
                                            placeholder="Describe el hotel, sus instalaciones y servicios..."
                                            className={cn(
                                                "min-h-[100px]",
                                                touchedFields.has('hotelDescription') && !formValidation['hotelDescription'] && "border-red-500"
                                            )}
                                            value={formData.hotelDescription}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <ErrorMessage fieldId="hotelDescription" />

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelAmenities">
                                            Amenidades (separadas por coma)
                                        </Label>
                                        <Input
                                            id="hotelAmenities"
                                            placeholder="Ej: Todo incluido, Spa, Piscinas, WiFi gratis"
                                            value={formData.hotelAmenities}
                                            onChange={handleInputChange}
                                            className={cn(
                                                touchedFields.has('hotelAmenities') && !formValidation['hotelAmenities'] && "border-red-500"
                                            )}
                                        />
                                    </div>
                                    <ErrorMessage fieldId="hotelAmenities" />
                                </div>

                                <Separator className="my-4" />

                                <div className="space-y-4">
                                    <h3 className="text-md font-medium">Incluye y No Incluye</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelIncludes">
                                            Incluye (un elemento por línea)
                                        </Label>
                                        <Textarea
                                            id="hotelIncludes"
                                            placeholder="Ej: Vuelos redondos Ciudad de México - Cancún&#10;Traslados aeropuerto - hotel - aeropuerto&#10;3 noches de alojamiento en hotel 5 estrellas"
                                            className={cn(
                                                "min-h-[120px]",
                                                touchedFields.has('hotelIncludes') && !formValidation['hotelIncludes'] && "border-red-500"
                                            )}
                                            value={formData.hotelIncludes}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <ErrorMessage fieldId="hotelIncludes" />

                                    <div className="space-y-2">
                                        <Label htmlFor="hotelExcludes">
                                            No Incluye (un elemento por línea)
                                        </Label>
                                        <Textarea
                                            id="hotelExcludes"
                                            placeholder="Ej: Gastos personales y propinas&#10;Actividades no mencionadas en el itinerario&#10;Tratamientos de spa"
                                            className={cn(
                                                "min-h-[120px]",
                                                touchedFields.has('hotelExcludes') && !formValidation['hotelExcludes'] && "border-red-500"
                                            )}
                                            value={formData.hotelExcludes}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <ErrorMessage fieldId="hotelExcludes" />
                                </div>
                            </TabsContent>

                            <TabsContent value="images" className="mt-0 space-y-4">
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
                                                        click para seleccionar
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
                                            <Label htmlFor="galleryMedia">Galería de Medios</Label>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                            {galleryMedia.map((media) => (
                                                <div key={media.id} className="relative group">
                                                    {media.type === 'image' ? (
                                                        <img
                                                            src={media.url}
                                                            alt="Gallery"
                                                            className="w-full h-48 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={media.url}
                                                            className="w-full h-48 object-cover rounded-lg"
                                                            controls
                                                        >
                                                            <source src={media.url} type="video/mp4" />
                                                        </video>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeGalleryMedia(media.id)}
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
                                                    Haz click para agregar más medios a la galería
                                                </p>
                                                <Input
                                                    id="galleryMediaUpload"
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    className="hidden"
                                                    onChange={handleGalleryMediaUpload}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById("galleryMediaUpload")?.click()}
                                                >
                                                    Agregar Medio
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="itinerary">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Itinerario del Evento</CardTitle>
                                        <CardDescription>
                                            Agrega las actividades del itinerario día por día
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-4">
                                            {formData.itineraryActions.map((action, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`dayTitle-${index}`}>Día</Label>
                                                            <Input
                                                                id={`dayTitle-${index}`}
                                                                value={action.dayTitle}
                                                                onChange={(e) => handleItineraryActionChange(index, 'dayTitle', e.target.value)}
                                                                placeholder="Ej: Día 1"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor={`startTime-${index}`}>Hora</Label>
                                                            <Input
                                                                id={`startTime-${index}`}
                                                                type="time"
                                                                value={action.startTime}
                                                                onChange={(e) => handleItineraryActionChange(index, 'startTime', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`title-${index}`}>Actividad</Label>
                                                        <Input
                                                            id={`title-${index}`}
                                                            value={action.title}
                                                            onChange={(e) => handleItineraryActionChange(index, 'title', e.target.value)}
                                                            placeholder="Descripción de la actividad"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`responsible-${index}`}>Responsable</Label>
                                                        <Input
                                                            id={`responsible-${index}`}
                                                            value={action.responsible}
                                                            onChange={(e) => handleItineraryActionChange(index, 'responsible', e.target.value)}
                                                            placeholder="Persona a cargo"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => removeItineraryAction(index)}
                                                    >
                                                        Eliminar Actividad
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addItineraryAction}
                                                className="w-full"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Agregar Actividad
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
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
                <ValidationModal
                    isOpen={validationModal.isOpen}
                    onClose={() => setValidationModal(prev => ({ ...prev, isOpen: false }))}
                    title={validationModal.title}
                    description={validationModal.description}
                    missingFields={validationModal.missingFields}
                />
            </CardContent>
        </Card>
    )
}