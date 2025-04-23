'use client'

import { useState } from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { UserProfileProvider } from '@/lib/context/user-profile-context'
import Sidebar from '@/components/sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

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
              <Sidebar
                isAdmin={true}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />

              {/* Main Content */}
              <main
                className={`flex-1 overflow-auto transition-all duration-300 ${
                  isSidebarCollapsed ? 'ml-[70px]' : 'ml-[250px]'
                }`}
              >
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
