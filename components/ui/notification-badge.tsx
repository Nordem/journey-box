"use client"

import { useEffect, useState } from "react"
import { getUnreadCount } from "@/lib/notifications"

interface NotificationBadgeProps {
  className?: string
}

export default function NotificationBadge({ className }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Cargar el conteo inicial
    setUnreadCount(getUnreadCount())

    // Configurar un evento personalizado para actualizar el contador
    const handleNotificationUpdate = () => {
      setUnreadCount(getUnreadCount())
    }

    window.addEventListener("notificationUpdate", handleNotificationUpdate)

    // Verificar periódicamente por nuevas notificaciones (cada 30 segundos)
    const interval = setInterval(() => {
      setUnreadCount(getUnreadCount())
    }, 30000)

    return () => {
      window.removeEventListener("notificationUpdate", handleNotificationUpdate)
      clearInterval(interval)
    }
  }, [])

  if (unreadCount === 0) return null

  return (
    <div
      className={`flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs font-bold ${className}`}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </div>
  )
}