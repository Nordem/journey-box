"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AuthStepProps {
  data: {
    email: string;
    password: string;
    confirmPassword?: string;
  };
  updateData: (data: any) => void;
}

export default function AuthStep({ data, updateData }: AuthStepProps) {
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordMatch, setPasswordMatch] = useState<boolean>(false);

  const handleInputChange = (field: string, value: string) => {
    updateData({
      ...data,
      [field]: value
    })

    // Check password match when either password or confirmPassword changes
    if (field === 'password' || field === 'confirmPassword') {
      if (field === 'password' && data.confirmPassword && value !== data.confirmPassword) {
        setPasswordError('Las contraseñas no coinciden');
        setPasswordMatch(false);
      } else if (field === 'confirmPassword' && value !== data.password) {
        setPasswordError('Las contraseñas no coinciden');
        setPasswordMatch(false);
      } else if ((field === 'password' && data.confirmPassword === value) || 
                 (field === 'confirmPassword' && data.password === value)) {
        setPasswordError(null);
        setPasswordMatch(true);
      } else {
        setPasswordError(null);
        setPasswordMatch(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Configura tu cuenta
        </h2>
        <p className="text-gray-400 mt-2">
          Crea tu cuenta para comenzar a disfrutar de experiencias personalizadas
        </p>
      </div>

      <div className="p-6 rounded-lg bg-indigo-950/30 border border-indigo-500/20">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-black/50 border-indigo-500/30 text-white"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="bg-black/50 border-indigo-500/30 text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={data.confirmPassword || ""}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              className={`bg-black/50 border-indigo-500/30 text-white ${passwordError ? "border-red-500" : ""} ${passwordMatch && data.confirmPassword ? "border-green-500" : ""}`}
              placeholder="••••••••"
            />
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
            {passwordMatch && data.confirmPassword && (
              <p className="text-sm text-green-500 mt-1">Las contraseñas coinciden</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center">
            <Check className="h-4 w-4 mr-2 text-green-400" />
            ¡Todo listo para comenzar!
          </h3>
          <Badge className="bg-green-600">100%</Badge>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          Al crear tu cuenta, aceptas nuestros términos y condiciones y política de privacidad.
        </p>
      </div>
    </div>
  )
} 