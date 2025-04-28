"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Check, Calendar, Phone, Mail, User, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useUserProfile } from "@/lib/context/user-profile-context"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

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
}

export default function BookingFlowModal({
    trip,
    isOpen,
    onClose
}: {
    trip: Trip
    isOpen: boolean
    onClose: () => void
}) {
    const [step, setStep] = useState(1)
    const [showAddCompanion, setShowAddCompanion] = useState(false)
    const [companions, setCompanions] = useState<Array<{
        id: number
        fullName: string
        birthDate: string
        phone: string
        email: string
    }>>([])
    const [currentCompanion, setCurrentCompanion] = useState({
        fullName: "",
        birthDate: "",
        phone: "",
        email: "",
    })
    const [errors, setErrors] = useState<{ fullName?: string; birthDate?: string; phone?: string; email?: string }>({})
    const { userProfile } = useUserProfile()
    const router = useRouter()
    const [sessionEmail, setSessionEmail] = useState<string>("")

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session?.user) {
                    router.push('/login')
                    return
                }

                setSessionEmail(session.user.email || "")

                // Fetch user profile
                const response = await fetch(`/api/user/${session.user.id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch user data')
                }

            } catch (error) {
                console.error("Error fetching user data:", error)
            }
        }

        fetchUserData()
    }, [router])

    // Validación de formulario
    const validateCompanionForm = () => {
        const newErrors: { fullName?: string; birthDate?: string; phone?: string; email?: string } = {}

        if (!currentCompanion.fullName.trim()) {
            newErrors.fullName = "El nombre es obligatorio"
        }

        if (!currentCompanion.birthDate) {
            newErrors.birthDate = "La fecha de nacimiento es obligatoria"
        } else {
            // Validar formato dd/mm/aaaa
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
            if (!dateRegex.test(currentCompanion.birthDate)) {
                newErrors.birthDate = "Formato inválido. Use DD/MM/AAAA"
            }
        }

        if (!currentCompanion.phone.trim()) {
            newErrors.phone = "El teléfono es obligatorio"
        } else if (!/^\d{10}$/.test(currentCompanion.phone.replace(/\D/g, ""))) {
            newErrors.phone = "Formato inválido (10 dígitos)"
        }

        if (!currentCompanion.email.trim()) {
            newErrors.email = "El correo es obligatorio"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentCompanion.email)) {
            newErrors.email = "Formato de correo inválido"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Manejar cambios en el formulario
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setCurrentCompanion({
            ...currentCompanion,
            [name]: value,
        })
    }

    // Agregar acompañante
    const handleAddCompanion = () => {
        if (validateCompanionForm()) {
            setCompanions([...companions, { ...currentCompanion, id: Date.now() }])
            setCurrentCompanion({
                fullName: "",
                birthDate: "",
                phone: "",
                email: "",
            })
            setShowAddCompanion(false)
        }
    }

    // Eliminar acompañante
    const handleRemoveCompanion = (id: number) => {
        setCompanions(companions.filter((companion) => companion.id !== id))
    }

    // Reiniciar el modal al cerrar
    const handleClose = () => {
        setStep(1)
        setShowAddCompanion(false)
        setCompanions([])
        setCurrentCompanion({
            fullName: "",
            birthDate: "",
            phone: "",
            email: "",
        })
        setErrors({})
        onClose()
    }

    const nextStep = () => {
        setStep((prev) => prev + 1)
    }

    const prevStep = () => {
        setStep((prev) => prev - 1)
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent
                className="sm:max-w-[500px] bg-gradient-to-b from-indigo-950/90 to-black/90 border border-indigo-500/30 text-white max-h-[80vh] overflow-y-auto"
            >
                <DialogHeader>
                    <DialogTitle className="text-xl bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {step === 1 ? "Reserva de Viaje" : "Resumen de Reserva"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        {step === 1 ? "¿Desea agregar a otra persona a su reserva?" : "Confirme los detalles de su reserva"}
                    </DialogDescription>
                </DialogHeader>

                {step === 1 ? (
                    <>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                                <div>
                                    <h3 className="font-medium">{trip.name}</h3>
                                    <p className="text-sm text-gray-400">
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
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Precio</p>
                                    <p className="font-bold text-indigo-400">
                                        {new Intl.NumberFormat("es-MX", {
                                            style: "currency",
                                            currency: "MXN",
                                            maximumFractionDigits: 0,
                                        }).format(trip.finalPrice)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 text-sm">
                                <p className="flex items-start">
                                    <span className="mr-2">⚠️</span>
                                    <span>
                                        Los acompañantes se cobrarán a precio regular de
                                        <span className="font-bold ml-1">
                                            {new Intl.NumberFormat("es-MX", {
                                                style: "currency",
                                                currency: "MXN",
                                                maximumFractionDigits: 0,
                                            }).format(trip.originalPrice)}
                                        </span>
                                        <span>
                                            por persona. El descuento de empleado solo aplica al titular.
                                        </span>
                                    </span>
                                </p>
                            </div>

                            {!showAddCompanion && companions.length === 0 && (
                                <div className="flex justify-between items-center">
                                    <Button
                                        variant="outline"
                                        className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                        onClick={() => setStep(2)}
                                    >
                                        No, continuar solo
                                    </Button>
                                    <Button
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                        onClick={() => setShowAddCompanion(true)}
                                    >
                                        Sí, agregar acompañante
                                    </Button>
                                </div>
                            )}

                            {companions.length > 0 && !showAddCompanion && (
                                <div className="space-y-4">
                                    <h3 className="font-medium">Acompañantes ({companions.length})</h3>

                                    {companions.map((companion) => (
                                        <div
                                            key={companion.id}
                                            className="flex justify-between items-center p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/10"
                                        >
                                            <div>
                                                <p className="font-medium">{companion.fullName}</p>
                                                <p className="text-xs text-gray-400">{companion.birthDate}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm text-pink-400 font-medium">
                                                    {new Intl.NumberFormat("es-MX", {
                                                        style: "currency",
                                                        currency: "MXN",
                                                        maximumFractionDigits: 0,
                                                    }).format(trip.originalPrice)}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                                    onClick={() => handleRemoveCompanion(companion.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-between">
                                        <Button
                                            variant="outline"
                                            className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                            onClick={() => setShowAddCompanion(true)}
                                        >
                                            <Plus size={16} className="mr-2" /> Agregar otro
                                        </Button>
                                        <Button
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                            onClick={() => setStep(2)}
                                        >
                                            Continuar <ChevronRight size={16} className="ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {showAddCompanion && (
                                <div className="space-y-4 p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                                    <h3 className="font-medium">Datos del acompañante</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className={errors.fullName ? "text-red-400" : ""}>
                                            Nombre completo
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                                            <Input
                                                id="fullName"
                                                name="fullName"
                                                value={currentCompanion.fullName}
                                                onChange={handleInputChange}
                                                placeholder="Nombre y apellidos"
                                                className={cn(
                                                    "bg-indigo-950/20 border-indigo-500/30 text-white pl-10",
                                                    errors.fullName && "border-red-400",
                                                )}
                                            />
                                        </div>
                                        {errors.fullName && <p className="text-xs text-red-400">{errors.fullName}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="birthDate" className={errors.birthDate ? "text-red-400" : ""}>
                                            Fecha de nacimiento
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                                            <Input
                                                id="birthDate"
                                                name="birthDate"
                                                value={currentCompanion.birthDate || ""}
                                                onFocus={(e) => e.target.type = "date"}
                                                onBlur={(e) => e.target.type = "text"}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value) {
                                                        const [year, month, day] = value.split("-");
                                                        const formattedDate = `${day}/${month}/${year}`;
                                                        setCurrentCompanion({
                                                            ...currentCompanion,
                                                            birthDate: formattedDate,
                                                        });
                                                    } else {
                                                        setCurrentCompanion({
                                                            ...currentCompanion,
                                                            birthDate: "",
                                                        });
                                                    }
                                                }}
                                                placeholder="DD/MM/AAAA"
                                                className={cn(
                                                    "bg-indigo-950/20 border-indigo-500/30 text-white pl-10",
                                                    errors.birthDate && "border-red-400",
                                                )}
                                            />
                                        </div>
                                        {errors.birthDate && <p className="text-xs text-red-400">{errors.birthDate}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className={errors.phone ? "text-red-400" : ""}>
                                            Número de teléfono
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-pink-400" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                value={currentCompanion.phone}
                                                onChange={handleInputChange}
                                                placeholder="10 dígitos"
                                                className={cn(
                                                    "bg-indigo-950/20 border-indigo-500/30 text-white pl-10",
                                                    errors.phone && "border-red-400",
                                                )}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className={errors.email ? "text-red-400" : ""}>
                                            Correo electrónico
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-indigo-400" />
                                            <Input
                                                id="email"
                                                name="email"
                                                value={currentCompanion.email}
                                                onChange={handleInputChange}
                                                placeholder="ejemplo@correo.com"
                                                className={cn(
                                                    "bg-indigo-950/20 border-indigo-500/30 text-white pl-10",
                                                    errors.email && "border-red-400",
                                                )}
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                                    </div>

                                    <div className="flex justify-between pt-2">
                                        <Button
                                            variant="outline"
                                            className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                            onClick={() => setShowAddCompanion(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                            onClick={handleAddCompanion}
                                        >
                                            Agregar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                                <h3 className="font-medium mb-2">Detalles del viaje</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-400">Destino:</div>
                                    <div>{trip.name}</div>
                                    <div className="text-gray-400">Ubicación:</div>
                                    <div>{trip.location}</div>
                                    <div className="text-gray-400">Fechas:</div>
                                    <div>
                                        {(() => {
                                            const startDate = new Date(trip.startDate);
                                            const endDate = new Date(trip.endDate);

                                            // Months in Spanish
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
                                    <div className="text-gray-400">Precio:</div>
                                    <div className="font-bold text-indigo-400">
                                        {new Intl.NumberFormat("es-MX", {
                                            style: "currency",
                                            currency: "MXN",
                                            maximumFractionDigits: 0,
                                        }).format(trip.finalPrice)}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                                <h3 className="font-medium mb-2">Titular de la reserva</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="text-gray-400">Nombre:</div>
                                    <div>{userProfile?.name}</div>
                                    <div className="text-gray-400">Correo:</div>
                                    <div>{sessionEmail}</div>
                                </div>
                            </div>

                            {companions.length > 0 && (
                                <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
                                    <h3 className="font-medium mb-2">Acompañantes ({companions.length})</h3>

                                    {companions.map((companion, index) => (
                                        <div key={companion.id} className="mb-3 last:mb-0">
                                            {index > 0 && <Separator className="my-3 bg-indigo-500/20" />}
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="text-gray-400">Nombre:</div>
                                                <div>{companion.fullName}</div>
                                                <div className="text-gray-400">Fecha de nacimiento:</div>
                                                <div>{companion.birthDate}</div>
                                                <div className="text-gray-400">Teléfono:</div>
                                                <div>{companion.phone}</div>
                                                <div className="text-gray-400">Correo:</div>
                                                <div>{companion.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30">
                                <h3 className="font-medium mb-3">Desglose de precios</h3>
                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <div>Titular (precio empleado):</div>
                                        <div className="font-medium text-indigo-400">
                                            {new Intl.NumberFormat("es-MX", {
                                                style: "currency",
                                                currency: "MXN",
                                                maximumFractionDigits: 0,
                                            }).format(trip.finalPrice)}
                                        </div>
                                    </div>

                                    {companions.length > 0 &&
                                        companions.map((companion, index) => (
                                            <div key={companion.id} className="flex justify-between items-center text-sm">
                                                <div>Acompañante {index + 1} (precio regular):</div>
                                                <div className="font-medium text-pink-400">
                                                    {new Intl.NumberFormat("es-MX", {
                                                        style: "currency",
                                                        currency: "MXN",
                                                        maximumFractionDigits: 0,
                                                    }).format(trip.originalPrice)}
                                                </div>
                                            </div>
                                        ))}

                                    <Separator className="my-2 bg-indigo-500/20" />

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-400">Total a pagar:</div>
                                        <div className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                            {new Intl.NumberFormat("es-MX", {
                                                style: "currency",
                                                currency: "MXN",
                                                maximumFractionDigits: 0,
                                            }).format(trip.finalPrice + companions.length * trip.originalPrice)}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-400 mt-2">
                                    <div>Personas: {companions.length + 1}</div>
                                    <div>
                                        Descuento empleado (solo titular): {Math.round((1 - trip.finalPrice / trip.originalPrice) * 100)}%
                                    </div>
                                    <div>Acompañantes: Precio regular sin descuento</div>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            {step > 1 ? (
                                <Button
                                    variant="outline"
                                    className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                    onClick={prevStep}
                                >
                                    Anterior
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                                    onClick={handleClose}
                                >
                                    Cancelar
                                </Button>
                            )}

                            {/* <Button
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                <Check size={16} className="mr-2" /> Confirmar Reserva
                            </Button> */}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}