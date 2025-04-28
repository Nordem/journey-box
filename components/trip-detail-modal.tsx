"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
    X,
    MapPin,
    Calendar,
    Clock,
    Users,
    Hotel,
    Plane,
    Utensils,
    Check,
    ChevronLeft,
    ChevronRight,
    Play,
    Volume2,
    VolumeX,
    UserCircle,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Trip {
    id: string;
    name: string;
    category: string;
    city: string;
    state?: string;
    country: string;
    description: string;
    imageUrl: string;
    galleryImages?: string[];
    startDate: string;
    endDate: string;
    activities: string[];
    highlights: string[];
    maxParticipants: number;
    originalPrice: number;
    finalPrice: number;
    isHighlight: boolean;
    location?: string;
    tripManager?: string;
    hotelName?: string;
    hotelDescription?: string;
    hotelAmenities: string[];
    hotelIncludes: string[];
    hotelExcludes: string[];
    itineraryAction?: EventItineraryActions[];
}

interface EventItineraryActions {
    id: string;
    eventId: string;
    dayTitle: string;
    title: string;
    startTime: string;
    responsible: string;
}

// Helper function to format price
const formatPrice = (price: number): string => {
    return `$${price.toLocaleString('es-MX')}`;
};

export default function TripDetailModal({
    trip,
    isOpen,
    onClose
}: {
    trip: Trip;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState("overview");
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Handle both structure formats for media gallery
    const mediaGallery = trip.galleryImages || [
        { url: trip.imageUrl || "/placeholder.svg", type: "image", alt: trip.name || trip.name }
    ];
    const currentMedia = mediaGallery[currentMediaIndex] || mediaGallery[0];
    const isVideo = typeof currentMedia === "object" && currentMedia?.type === "video";

    const nextMedia = () => {
        setCurrentMediaIndex((prev) => (prev === mediaGallery.length - 1 ? 0 : prev + 1));
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prev) => (prev === 0 ? mediaGallery.length - 1 : prev - 1));
    };

    const toggleMute = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted;
            setIsMuted(!isMuted);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
                className="relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl bg-gradient-to-b from-indigo-950/90 to-black/90 border border-indigo-500/30"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 border border-indigo-500/30 hover:bg-indigo-950/50 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Media Carousel */}
                <div className="relative h-80 w-full">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {isVideo ? (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    src={currentMedia.url}
                                    className="w-full h-full object-cover"
                                    autoPlay
                                    loop
                                    muted={isMuted}
                                    playsInline
                                />
                                {/* Video Controls */}
                                <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="w-8 h-8 rounded-full bg-black/50 border border-white/20 hover:bg-black/70"
                                        onClick={toggleMute}
                                    >
                                        {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                    </Button>
                                </div>
                                {/* Play indicator */}
                                <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/50 rounded-full p-1.5 border border-white/20">
                                    <Play size={14} className="text-white fill-white" />
                                </div>
                            </div>
                        ) : (
                            <Image
                                src={typeof currentMedia === "object" ? currentMedia.url : "/placeholder.svg"}
                                alt={typeof currentMedia === "object" ? currentMedia.alt || trip.name || trip.name || "Image" : trip.name || trip.name || "Image"}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>

                    {/* Carousel Navigation */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full h-10 w-10 z-10"
                        onClick={prevMedia}
                    >
                        <ChevronLeft size={20} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full h-10 w-10 z-10"
                        onClick={nextMedia}
                    >
                        <ChevronRight size={20} />
                    </Button>

                    {/* Media Indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-10">
                        {mediaGallery.map((media, index) => (
                            <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentMediaIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                                    }`}
                                onClick={() => setCurrentMediaIndex(index)}
                            />
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 to-transparent"></div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h2 className="text-3xl font-bold mb-2">{trip.name || trip.name}</h2>
                        <div className="flex items-center text-gray-300">
                            <MapPin size={16} className="mr-1 text-indigo-400" />
                            <span>{trip.location}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Trip Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                            <Calendar size={20} className="mr-3 text-indigo-400" />
                            <div>
                                <div className="text-sm text-gray-400">Fechas</div>
                                <div>
                                    {(() => {
                                        const startDate = new Date(trip.startDate);
                                        const endDate = new Date(trip.endDate);

                                        // Months
                                        const months = [
                                            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                                            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                                        ];

                                        // Format: if same month, show "20-25 Noviembre, 2024"
                                        if (startDate.getMonth() === endDate.getMonth() &&
                                            startDate.getFullYear() === endDate.getFullYear()) {
                                            return `${startDate.getDate()} - ${endDate.getDate()} ${months[startDate.getMonth()]}, ${startDate.getFullYear()}`;
                                        }
                                        // Format: if different months, show "30 Abril - 3 Mayo, 2024"
                                        else {
                                            const sameYear = startDate.getFullYear() === endDate.getFullYear();
                                            return `${startDate.getDate()} ${months[startDate.getMonth()]}${sameYear ? '' : ', ' + startDate.getFullYear()} - ${endDate.getDate()} ${months[endDate.getMonth()]}, ${endDate.getFullYear()}`;
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                            <Clock size={20} className="mr-3 text-purple-400" />
                            <div>
                                <div className="text-sm text-gray-400">Duración</div>
                                <div>
                                    {(() => {
                                        const startDate = new Date(trip.startDate);
                                        const endDate = new Date(trip.endDate);
                                        const timeDiff = endDate.getTime() - startDate.getTime();
                                        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                                        const nights = days - 1;
                                        return `${days} día${days > 1 ? "s" : ""} / ${nights} noche${nights > 1 ? "s" : ""}`;
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                            <Users size={20} className="mr-3 text-pink-400" />
                            <div>
                                <div className="text-sm text-gray-400">Disponibilidad</div>
                                <div className="flex items-center">
                                    <Progress
                                        value={trip.maxParticipants !== undefined ? trip.maxParticipants : 50}
                                        className={`h-1.5 w-24 bg-gray-700 mr-2 ${trip.maxParticipants === 0 ? "bg-red-500" :
                                            trip.maxParticipants !== undefined && trip.maxParticipants < 30 ? "bg-orange-500" : "bg-green-500"
                                            }`}
                                    />
                                    <span>
                                        {`${trip.maxParticipants} lugares`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 mb-4 rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 relative">
                        <div>
                            <div className="text-sm text-gray-400">Precio regular</div>
                            <div className="text-xl line-through text-gray-500">
                                {formatPrice(trip.originalPrice || 0)}
                            </div>
                        </div>
                        <div className="my-2 md:my-0">
                            <div className="text-sm text-gray-400">Descuento empleado</div>
                            <div className="text-lg text-green-400">
                                -{Math.round((1 - ((trip.finalPrice || 0) / (trip.originalPrice || 1))) * 100)}%
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-400">Tu precio</div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                {formatPrice(trip.finalPrice || 0)}
                            </div>
                        </div>
                        <span className="absolute right-2 bottom-1 text-[10px] text-gray-400 italic">
                            *Precios exclusivos para colaboradores
                        </span>
                    </div>

                    {/* Responsable del viaje - Información detallada */}
                    <div className="flex items-center p-4 rounded-lg bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 mb-6">
                        <div className="flex items-center w-full">
                            <div className="flex-shrink-0 mr-4">
                                <UserCircle size={28} className="text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-400 mb-1">Responsable del viaje</div>
                                <div className="text-lg font-medium text-white">
                                    {trip.tripManager ? trip.tripManager.split(" - ")[0] : trip.tripManager || "Laura Sánchez"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-transparent border border-indigo-500/30 rounded-xl overflow-hidden">
                            <TabsTrigger
                                value="overview"
                                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                            >
                                Descripción
                            </TabsTrigger>
                            <TabsTrigger
                                value="itinerary"
                                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                            >
                                Itinerario
                            </TabsTrigger>
                            <TabsTrigger
                                value="includes"
                                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                            >
                                Incluye
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-0">
                            <p className="text-gray-300 mb-4">{trip.description}</p>
                            {trip.hotelName && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold mb-3">Alojamiento</h4>
                                    <div className="flex items-start gap-4 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                                        <Hotel size={24} className="text-indigo-400 mt-1" />
                                        <div>
                                            <h5 className="font-medium">{trip.hotelName}</h5>
                                            <p className="text-gray-400 text-sm mb-2">{trip.hotelDescription}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {trip.hotelAmenities.map((amenity, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs px-2 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/20"
                                                    >
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="itinerary" className="pt-4">
                            <div className="space-y-6">
                                {/* Línea de tiempo vertical */}
                                <div className="relative">
                                    {trip.itineraryAction && trip.itineraryAction.length > 0 ? (
                                        trip.itineraryAction.map((action, index) => (
                                            <div key={index} className="mb-8 relative">
                                                {/* Indicador de día con gradiente */}
                                                <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg z-10">
                                                    <span className="text-white font-bold text-sm">{action.dayTitle}</span>
                                                </div>

                                                {/* Línea vertical */}
                                                {index < (trip.itineraryAction?.length || 0) - 1 && (
                                                    <div className="absolute left-6 top-12 w-0.5 h-full bg-blue-600/50 z-0"></div>
                                                )}

                                                {/* Contenido del día */}
                                                <div className="ml-16 bg-indigo-950/80 rounded-xl border border-indigo-900/50 shadow-lg overflow-hidden">
                                                    <div className="p-4 border-b border-indigo-800/50">
                                                        <h4 className="text-lg font-semibold text-white">{action.title}</h4>
                                                    </div>
                                                    <div className="p-4">
                                                        <ul className="space-y-3">
                                                            <li className="flex items-center text-sm text-gray-300">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-800/50 flex items-center justify-center mr-3 border border-indigo-700/50">
                                                                    <Clock className="h-4 w-4 text-blue-400" />
                                                                </div>
                                                                <span>{action.startTime}</span>
                                                            </li>
                                                            <li className="flex items-center text-sm text-gray-300">
                                                                <div className="h-8 w-8 rounded-full bg-indigo-800/50 flex items-center justify-center mr-3 border border-indigo-700/50">
                                                                    <UserCircle className="h-4 w-4 text-blue-400" />
                                                                </div>
                                                                <span>{action.responsible}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-center">No hay información del itinerario disponible.</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="includes" className="mt-0">
                            {(!trip.hotelIncludes?.length && !trip.hotelExcludes?.length) ? (
                                <p className="text-gray-400 text-center">No hay información disponible sobre lo que incluye o no incluye el viaje.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="bg-emerald-500/20 p-1 rounded-full">
                                                <Check size={12} className="text-emerald-400" />
                                            </div>
                                            <h4 className="text-base font-medium text-emerald-300">El viaje incluye</h4>
                                        </div>
                                        {trip.hotelIncludes?.length ? (
                                            <ul className="space-y-3 pl-1.5">
                                                {trip.hotelIncludes.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-2.5">
                                                        <div className="min-w-2.5 h-2.5 flex items-center justify-center">
                                                            <div className="w-0.5 h-0.5 rounded-full bg-emerald-400"></div>
                                                        </div>
                                                        <span className="text-sm text-gray-300">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400">No hay información disponible.</p>
                                        )}
                                    </div>
                                    <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="bg-rose-500/20 p-1 rounded-full">
                                                <X size={12} className="text-rose-400" />
                                            </div>
                                            <h4 className="text-base font-medium text-rose-300">El viaje no incluye</h4>
                                        </div>
                                        {trip.hotelExcludes?.length ? (
                                            <ul className="space-y-3 pl-1.5">
                                                {trip.hotelExcludes.map((item, index) => (
                                                    <li key={index} className="flex items-start gap-2.5">
                                                        <div className="min-w-2.5 h-2.5 flex items-center justify-center">
                                                            <div className="w-0.5 h-0.5 rounded-full bg-rose-400"></div>
                                                        </div>
                                                        <span className="text-sm text-gray-300">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-400">No hay información disponible.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                            variant="outline"
                            className="flex-1 border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20 rounded-lg"
                            onClick={onClose}
                        >
                            Regresar
                        </Button>
                        {/* <Button
                            className={`flex-1 rounded-lg ${(trip.maxParticipants === undefined || trip.maxParticipants > 0)
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                                : "bg-gray-700 cursor-not-allowed"
                                }`}
                            disabled={trip.maxParticipants === 0}
                        >
                            {(trip.maxParticipants === undefined || trip.maxParticipants > 0) ? "Reservar ahora" : "Viaje agotado"}
                        </Button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}