import { ThemeProvider } from '@/components/theme-provider'
import Sidebar from '@/components/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function DiscoverLayout({
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
        <main className="flex-1 transition-all duration-300 ease-in-out md:ml-[217px] md:mr-[-30px] overflow-auto">
          <div className="container">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </ThemeProvider>
  )
} 