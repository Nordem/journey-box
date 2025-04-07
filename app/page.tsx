"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import RegistrationWizard from "@/components/registration-wizard"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        router.push('/profile')
      } else {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (isLoading) {
    return null
  }

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        <RegistrationWizard />
      </div>
    </main>
  )
}

