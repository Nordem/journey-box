"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  User,
  Menu,
  LogOut,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import NotificationBadge from "@/components/ui/notification-badge"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { useUserProfile } from "@/lib/context/user-profile-context"

interface SidebarProps {
  isAdmin?: boolean
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: any
  showBadge?: boolean
  isActive?: boolean
}

export default function Sidebar({
  isAdmin = true,
  className,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { userProfile } = useUserProfile()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

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

  const mainNavItems: NavItem[] = [
    {
      title: "Descubrir Viajes",
      href: "/discover",
      icon: Compass,
      showBadge: false
    },
  ]

  const adminNavItems: NavItem[] = [
    {
      title: "Gestionar Viajes",
      href: "/admin/trips",
      icon: Settings,
      showBadge: false
    }
  ]

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente.",
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Hubo un problema al cerrar sesión. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

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
      <div className="flex flex-col items-center p-4 mb-4">
        <Avatar className="h-14 w-14 border-2 border-indigo-500/30 mb-2">
          <AvatarImage src={userProfile?.avatar} alt={userProfile?.name} />
          <AvatarFallback className="bg-indigo-950 text-indigo-200 relative">
            <User size={16} />
            <div className="absolute bottom-0 right-0 bg-indigo-800 rounded-full p-1 border border-indigo-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
            {!isCollapsed && <p className="text-base font-medium text-white">{userProfile?.name || 'Usuario'}</p>}
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 text-xs px-3 py-0 text-indigo-200 hover:text-white hover:bg-indigo-800/30"
            asChild
          >
            <Link href="/profile">
              Mi Perfil
            </Link>
          </Button>
        </div>
      </div>

      {isCollapsed ? 
      <Separator className="mx-4 bg-indigo-500/20 w-[40px]" />
      :
      <Separator className="mx-4 bg-indigo-500/20 w-[200px]" />
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

      <div className="px-3 py-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </>
  )

  if (!mounted) return null

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 md:hidden z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="p-0 w-[280px]"
          onInteractOutside={() => setIsOpen(false)}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
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
      data-collapsed={isCollapsed} // Add this attribute
    >
      <SidebarContent />
    </div>
  )
}
