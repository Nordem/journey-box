import { ThemeProvider } from '@/components/theme-provider'
import Sidebar from '@/components/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function ProfileLayout({
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
          <div className="container">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl" />
              <div className="relative">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  )
} 