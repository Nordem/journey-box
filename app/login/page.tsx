"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      if (data.user) {
        toast({
          title: "Success!",
          description: "You've successfully logged in.",
          variant: "default",
        })
        
        router.push("/discover")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log in.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gradient-to-b from-indigo-950/90 via-purple-950/80 to-black/90 backdrop-blur-md border border-indigo-500/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-indigo-200">
              Ingresa tu correo y contraseña para acceder a tu perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-indigo-200">Correo electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="tu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-indigo-900/50 border-indigo-500/30 text-white placeholder:text-indigo-400/50 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-indigo-200">Contraseña</Label>
                  <Link href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-indigo-900/50 border-indigo-500/30 text-white placeholder:text-indigo-400/50 focus:border-indigo-500"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700" 
                disabled={loading}
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm text-indigo-300">
              ¿No tienes una cuenta?{" "}
              <Link href="/" className="text-indigo-400 hover:text-white">
                Regístrate ahora
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 