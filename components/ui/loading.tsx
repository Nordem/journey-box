"use client"

import { Loader2 } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Loading() {
  const pathname = usePathname()

  // Determinar si estamos en la página principal (Descubrir viajes)
  const isHomePage = pathname === "/" || pathname === "/discover"

  // Determinar si estamos en el formulario de bienvenida
  const isWelcomeForm = pathname?.includes("/onboarding") || pathname?.includes("/welcome")

  // Mensaje específico según la sección
  let loadingMessage = "El contenido estará disponible en breve."
  let loadingTitle = "Cargando contenido"

  // Solo para la página principal (descubrir viajes) mostramos el mensaje personalizado
  if (isHomePage && !isWelcomeForm) {
    loadingMessage = "En breve te mostraremos viajes increíbles para ti."
    loadingTitle = "Estamos buscando tu mejor experiencia"
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-3xl animate-pulse"></div>
        <div className="relative flex flex-col items-center gap-6 p-8 rounded-xl bg-black/60 backdrop-blur-md border border-indigo-500/20 shadow-xl">
          <div className="flex items-center gap-4">
            <Loader2 size={40} className="text-indigo-400 animate-spin" />
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-ping opacity-75"></div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></div>
          </div>

          <h2 className="text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {loadingTitle}
            </span>
          </h2>

          <p className="text-gray-300 max-w-md text-center">{loadingMessage}</p>

          <div className="flex gap-2 mt-2">
            <span
              className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="h-2 w-2 rounded-full bg-purple-500 animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="h-2 w-2 rounded-full bg-pink-500 animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  )
}