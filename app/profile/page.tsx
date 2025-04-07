"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Perfil</h1>
          <p className="text-indigo-200">Gestiona tu información personal y preferencias</p>
        </div>
        <Button
          variant="outline"
          className="border-indigo-500/30 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
        >
          <Edit className="mr-2 h-4 w-4" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Personal Information Card */}
        <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white">Información Personal</CardTitle>
            <CardDescription className="text-indigo-200">Tu información básica de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Nombre</h3>
                <p className="text-lg text-white">David Sarmiento</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Ubicación</h3>
                <p className="text-lg text-white">Tlaxcala</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Aeropuerto más Cercano</h3>
                <p className="text-lg text-white">Puebla</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Idiomas</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Español
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Inglés
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Chino
                  </span>
                </div>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Información Adicional</h3>
                <p className="text-lg text-white">Me gusta la gastronomía</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personality and Interests Card */}
        <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white">Personalidad e Intereses</CardTitle>
            <CardDescription className="text-indigo-200">Tus rasgos, intereses y objetivos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Rasgos de Personalidad</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Sociable
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Creativo
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Estructurado
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Enérgico
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Aventurero
                  </span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Hobbies e Intereses</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                    Tecnología
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                    Convivencias
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                    Jardinería
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                    Actividades deportivas
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                    Networking
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-900/50 text-purple-200">
                    Cine
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Preferences Card */}
        <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
          <CardHeader>
            <CardTitle className="text-white">Preferencias de Eventos</CardTitle>
            <CardDescription className="text-indigo-200">Tus preferencias para eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="font-medium text-sm text-indigo-200 mb-1">Preferencias Estacionales</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Invierno
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Otoño
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Verano
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-900/50 text-indigo-200">
                    Primavera
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 