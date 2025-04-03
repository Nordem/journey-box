// Tipos de notificaciones
export type NotificationType = "booking" | "cancellation" | "system" | "info"

// Interfaz para las notificaciones
export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  read: boolean
  data?: {
    tripId?: number
    tripTitle?: string
    userId?: string
    userName?: string
    companions?: number
  }
}

// Función para generar un ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Función para crear una nueva notificación
export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  data?: any,
): Notification => {
  return {
    id: generateId(),
    type,
    title,
    message,
    timestamp: Date.now(),
    read: false,
    data,
  }
}

// Función para guardar notificaciones en localStorage
export const saveNotifications = (notifications: Notification[]): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("adminNotifications", JSON.stringify(notifications))
  }
}

// Función para obtener notificaciones de localStorage
export const getNotifications = (): Notification[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("adminNotifications")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("Error parsing notifications:", e)
      }
    }
  }
  return []
}

// Función para marcar una notificación como leída
export const markAsRead = (notificationId: string): Notification[] => {
  const notifications = getNotifications()
  const updated = notifications.map((notification) =>
    notification.id === notificationId ? { ...notification, read: true } : notification,
  )
  saveNotifications(updated)
  return updated
}

// Función para marcar todas las notificaciones como leídas
export const markAllAsRead = (): Notification[] => {
  const notifications = getNotifications()
  const updated = notifications.map((notification) => ({ ...notification, read: true }))
  saveNotifications(updated)
  return updated
}

// Función para eliminar una notificación
export const deleteNotification = (notificationId: string): Notification[] => {
  const notifications = getNotifications()
  const updated = notifications.filter((notification) => notification.id !== notificationId)
  saveNotifications(updated)
  return updated
}

// Función para añadir una nueva notificación
export const addNotification = (notification: Notification): Notification[] => {
  const notifications = getNotifications()
  const updated = [notification, ...notifications]
  saveNotifications(updated)
  return updated
}

// Función para obtener el número de notificaciones no leídas
export const getUnreadCount = (): number => {
  const notifications = getNotifications()
  return notifications.filter((notification) => !notification.read).length
}