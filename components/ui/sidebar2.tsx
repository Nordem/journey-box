"use client"

import { useState, useEffect } from "react"
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
  Heart,
  Sun,
  Moon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"

interface SidebarProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  className?: string
  onSignOut?: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  isAdmin?: boolean
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export default function Sidebar2({
  userName = "User",
  userEmail = "",
  userAvatar = "",
  className,
  onSignOut,
  onRefresh,
  isRefreshing = false,
  isAdmin = false,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const mainNavItems = [
    {
      title: "Perfil",
      href: "/dashboard",
      icon: User,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Descubrir Viajes",
      href: "#",
      icon: Compass,
      isActive: pathname === "#",
    },
    {
      title: "Mis Aventuras",
      href: "#",
      icon: Briefcase,
      isActive: pathname === "#",
    },
    {
      title: "Favoritos",
      href: "#",
      icon: Heart,
      isActive: pathname === "#",
    },
    {
      title: "Notificaciones",
      href: "#",
      icon: Bell,
      isActive: pathname === "#",
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
      href: "#",
      icon: Users,
      isActive: pathname === "#",
    },
    {
      title: "Estadísticas",
      href: "#",
      icon: BarChart2,
      isActive: pathname === "#",
    },
    {
      title: "Notificaciones",
      href: "#",
      icon: Bell,
      isActive: pathname === "#",
      showBadge: true,
    },
    {
      title: "Configuración",
      href: "#",
      icon: Settings,
      isActive: pathname === "#",
    },
  ]

  return (
    <>
      {/* Add overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      <div
        className={cn(
          "flex flex-col h-screen fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out border-r border-indigo-500/20",
          isCollapsed ? "w-[70px]" : "w-[250px]",
          "md:translate-x-0",
          isCollapsed ? "-translate-x-full" : "translate-x-0",
          "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-950/50 hover:[&::-webkit-scrollbar-thumb]:bg-indigo-800/70 [&::-webkit-scrollbar-thumb]:rounded-full",
          className,
        )}
      >
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md -z-10" />

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute h-6 w-6 rounded-full border border-indigo-500/30 bg-black text-white shadow-md",
            isCollapsed 
              ? "right-0 translate-x-full top-4" 
              : "-right-3 top-8"
          )}
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>

        {/* Logo */}
        <div className={cn("flex items-center p-4 h-20", isCollapsed ? "justify-center" : "justify-start")}>
          {isCollapsed ? (
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              J
            </div>
          ) : (
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Journey Box
            </h1>
          )}
        </div>

        {/* User Profile */}
        <div className={cn("flex items-center p-4 mb-4", isCollapsed ? "justify-center" : "px-4 py-2")}>
          <Avatar className="h-10 w-10 border-2 border-indigo-500/30">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback className="bg-indigo-950 text-indigo-200">
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{userName}</p>
              <p className="text-xs text-indigo-300">Empleado</p>
            </div>
          )}
        </div>

        {isCollapsed ?
        <Separator className="mx-4 bg-indigo-500/20 w-[40px]" />
        :
        <Separator className="mx-4 bg-indigo-500/20 w-[200px]" />
        }


        {/* Main Navigation */}
        <div className="flex-1 overflow-auto py-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-950/50 hover:[&::-webkit-scrollbar-thumb]:bg-indigo-800/70 [&::-webkit-scrollbar-thumb]:rounded-full">
          <nav className="grid gap-1 px-2">
            {mainNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  item.isActive
                    ? "bg-gradient-to-r from-indigo-600/40 to-purple-600/40 text-white"
                    : "text-indigo-100 hover:bg-indigo-800/20 hover:text-white",
                  isCollapsed && "justify-center px-0",
                )}
              >
                <item.icon size={isCollapsed ? 20 : 18} />
                {!isCollapsed && <span>{item.title}</span>}
                {item.isActive && !isCollapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* Admin Section */}
          {isAdmin && (
            <>
            {isCollapsed ?
              <Separator className="my-4 mx-4 bg-indigo-500/20 w-[40px]" />
              :
              <Separator className="my-4 mx-4 bg-indigo-500/20 w-[200px]" />
            }
              <div className="px-4 py-2">
                <h2
                  className={cn(
                    "text-xs font-semibold text-indigo-300 uppercase tracking-wider",
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
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all relative",
                      item.isActive
                        ? "bg-gradient-to-r from-indigo-600/40 to-purple-600/40 text-white"
                        : "text-indigo-100 hover:bg-indigo-800/20 hover:text-white",
                      isCollapsed && "justify-center px-0",
                    )}
                  >
                    <item.icon size={isCollapsed ? 20 : 18} />
                    {!isCollapsed && <span>{item.title}</span>}
                    {item.showBadge && (
                      <div className={cn(
                        "h-2 w-2 rounded-full bg-red-500",
                        isCollapsed ? "absolute -top-1 -right-1" : "ml-auto"
                      )} />
                    )}
                    {item.isActive && !isCollapsed && !item.showBadge && (
                      <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    )}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 mt-auto space-y-2">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={toggleTheme}
            className={cn(
              "w-full justify-center border border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-800/30 text-indigo-100",
              isCollapsed ? "px-0" : "",
            )}
          >
            {theme === "dark" ? (
              <>
                <Sun size={16} className={isCollapsed ? "" : "mr-2"} />
                {!isCollapsed && <span>Tema Claro</span>}
              </>
            ) : (
              <>
                <Moon size={16} className={isCollapsed ? "" : "mr-2"} />
                {!isCollapsed && <span>Tema Oscuro</span>}
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "w-full justify-center border border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-800/30 text-indigo-100",
              isCollapsed ? "px-0" : "",
            )}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin", !isCollapsed && "mr-2")} />
            {!isCollapsed && (isRefreshing ? "Refreshing..." : "Refresh Data")}
          </Button>

          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={onSignOut}
            className={cn(
              "w-full justify-center border border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-800/30 text-indigo-100",
              isCollapsed ? "px-0" : "",
            )}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>
    </>
  )
}