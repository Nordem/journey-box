import { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import Sidebar from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Journey Box - Admin",
  description: "Panel de administración de Journey Box",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black -z-10" />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        storageKey="journeybox-theme"
        disableTransitionOnChange
      >
        <div className="flex min-h-screen">
          <Sidebar isAdmin={true} />
          <main className="flex-1 transition-all duration-300 ease-in-out pt-16 md:pt-0 md:ml-[250px] md:data-[collapsed=true]:ml-[70px] overflow-auto">
            <div className="container max-w-7xl p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </div>
  )
}