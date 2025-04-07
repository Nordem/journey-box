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
        <div className="flex">
          <Sidebar isAdmin={true} />
          <main className="flex-1 ml-[250px] p-8">
            <div className="container max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </ThemeProvider>
    </div>
  )
} 