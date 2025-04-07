import { ThemeProvider } from '@/components/theme-provider'
import Sidebar from '@/components/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="journeybox-theme"
    >
      <div className="flex min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
        <Sidebar isAdmin={true} />
        <main className="flex-1 transition-all duration-300 ease-in-out pt-16 md:pt-0 md:ml-[250px] md:data-[collapsed=true]:ml-[70px] overflow-auto">
          <div className="container max-w-6xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  )
} 