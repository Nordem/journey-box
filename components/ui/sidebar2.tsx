"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  RefreshCw,
  Edit3,
  Users,
  BarChart2,
  Bell,
  Compass,
  Briefcase,
  Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface SidebarProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  className?: string
  onSignOut?: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  isAdmin?: boolean // Add this prop
}

export default function Sidebar2({
  userName = "User",
  userEmail = "",
  userAvatar = "",
  className,
  onSignOut,
  onRefresh,
  isRefreshing = false,
  isAdmin = false, // Add this prop with default value
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const mainNavItems = [
    {
      title: "Descubrir Viajes",
      href: "/dashboard",
      icon: Compass,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Mis Aventuras",
      href: "/dashboard",
      icon: Briefcase,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Favoritos",
      href: "/dashboard",
      icon: Heart,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Notificaciones",
      href: "/dashboard",
      icon: Bell,
      isActive: pathname === "/dashboard",
    },
  ]

  const adminNavItems = [
    {
      title: "Gestionar Viajes",
      href: "/admin/trips", //   href: "/admin/trips",
      icon: Edit3,
      isActive: pathname === "/admin/trips",
    },
    {
      title: "Participantes",
      href: "/dashboard",
      icon: Users,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Estadísticas",
      href: "/dashboard",
      icon: BarChart2,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Notificaciones",
      href: "/dashboard",
      icon: Bell,
      isActive: pathname === "/dashboard",
      showBadge: true,
    },
    {
      title: "Configuración",
      href: "/dashboard",
      icon: Settings,
      isActive: pathname === "/dashboard",
    },
  ]

  return (
    <div
      className={cn(
        "flex flex-col h-screen fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out border-r",
        isCollapsed ? "w-[70px]" : "w-[250px]",
        className,
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-8 h-6 w-6 rounded-full border shadow-md"
        onClick={toggleSidebar}
      >
        {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </Button>

      {/* User Profile */}
      <div className={cn("flex items-center p-4 h-20", isCollapsed ? "justify-center" : "justify-start")}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>
            <User size={16} />
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="ml-3">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        )}
      </div>

      {isCollapsed ?
        <Separator className="mx-4 w-[40px]" />
        :
        <Separator className="mx-4 w-[200px]" />
      }

      {/* Main Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {mainNavItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                item.isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed && "justify-center px-0",
              )}
            >
              <item.icon size={isCollapsed ? 20 : 18} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>

        {/* Admin Section */}
        {isAdmin && (
          <>
            {isCollapsed ?
              <Separator className="my-4 mx-4 w-[40px]" />
              : <Separator className="my-4 mx-4 w-[200px]" />}
            <div className="px-4 py-2">
              <h2
                className={cn(
                  "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                  isCollapsed && "text-center",
                )}
              >
                {isCollapsed ? "Admin" : "Administración"}
              </h2>
            </div>
            <nav className="grid gap-1 px-2">
              {adminNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    item.isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center px-0",
                  )}
                >
                  <item.icon size={isCollapsed ? 20 : 18} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              ))}
            </nav>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 mt-auto space-y-2">
        <Button
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin", !isCollapsed && "mr-2")} />
          {!isCollapsed && (isRefreshing ? "Refreshing..." : "Refresh Data")}
        </Button>

        <Button
          variant="outline"
          size={isCollapsed ? "icon" : "default"}
          onClick={onSignOut}
          className="w-full"
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  )
}