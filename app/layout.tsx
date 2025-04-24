'use client'

import { useState } from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { UserProfileProvider } from '@/lib/context/user-profile-context'
import { BetaBanner } from '@/components/beta-banner'
import Sidebar from '@/components/sidebar'
import { usePathname } from 'next/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false) // Track mobile state
  const pathname = usePathname()

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="journeybox-theme"
        >
          <UserProfileProvider>
            <div className="flex h-screen">

              {/* Sidebar */}
              {pathname !== '/' && pathname != '/login' && ( // Only show Sidebar if not on the "/" page
                <Sidebar
                  isAdmin={true}
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  onMobileChange={setIsMobile} // Pass callback to update mobile state
                />
              )}

              {/* Main Content */}
              <main
                className={`flex-1 overflow-auto transition-all duration-300 ${
                  pathname === '/' || pathname === '/login' // If on "/" page
                    ? 'ml-0 mt-0' // No margin or padding
                    : isMobile
                    ? 'ml-0 mt-6' // No margin when in mobile view
                    : isSidebarCollapsed
                    ? 'ml-[70px]'
                    : 'ml-[250px]'
                }`}
              >
                {/* Beta banner */}
                <BetaBanner />

                {children}
              </main>
            </div>
            <Toaster />
          </UserProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
