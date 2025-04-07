"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  User,
  Menu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import NotificationBadge from "@/components/ui/notification-badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  isAdmin?: boolean
  userName?: string
  userAvatar?: string
  className?: string
}

export default function Sidebar({
  isAdmin = true,
  userName = "Carlos Mendez",
  userAvatar = "/placeholder.svg?height=40&width=40",
  className,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // 768px is the md breakpoint
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Compass,
      isActive: pathname === "/dashboard",
    }
  ]

  const adminNavItems = [
    {
      title: "Gestionar Viajes",
      href: "/admin/trips",
      icon: Edit3,
      isActive: pathname === "/admin/trips",
    }
  ]

  const SidebarContent = () => (
    <>
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md -z-10" />

      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-8 h-6 w-6 rounded-full border border-indigo-500/30 bg-black text-white shadow-md"
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </Button>
      )}

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

      <Separator className="mx-4 bg-indigo-500/20" />

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
                  ? "bg-gradient-to-r from-indigo-600/40 to-purple-600/40 text-white"
                  : "text-indigo-100 hover:bg-indigo-800/20 hover:text-white",
                isCollapsed && "justify-center px-0",
              )}
            >
              <item.icon size={isCollapsed ? 20 : 18} />
              {!isCollapsed && <span>{item.title}</span>}
              {item.isActive && !isCollapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
            </Link>
          ))}
        </nav>

        {isAdmin && (
          <>
            <Separator className="my-4 mx-4 bg-indigo-500/20" />
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
                    <NotificationBadge className={cn(isCollapsed ? "absolute -top-1 -right-1" : "ml-auto")} />
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

      {/* Theme Toggle */}
      <div className="p-4 mt-auto">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn(
            "w-full justify-center border border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-800/30 text-indigo-100",
            isCollapsed ? "px-0" : "",
          )}
        >
          {mounted && resolvedTheme === "dark" ? (
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
      </div>
    </>
  )

  // Mobile menu trigger button - only shown on mobile
  const MobileMenuTrigger = () => (
    <Button
      variant="ghost"
      size="icon"
      className="fixed top-4 left-4 md:hidden z-50"
    >
      <Menu className="h-6 w-6" />
    </Button>
  )

  if (!mounted) return null

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <MobileMenuTrigger />
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <div className="h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className={cn(
        "hidden md:flex flex-col h-screen fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out border-r border-indigo-500/20",
        isCollapsed ? "w-[70px]" : "w-[250px]",
        className,
      )}
    >
      <SidebarContent />
    </div>
  )
} 