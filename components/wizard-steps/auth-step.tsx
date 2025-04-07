"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Configura tu cuenta</h1>
        <p className="text-gray-400 mb-6">
          Crea tu cuenta para comenzar a disfrutar de experiencias personalizadas
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={data.confirmPassword || ""}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              placeholder="••••••••"
              className={`${passwordError ? "border-red-500" : ""} ${passwordMatch && data.confirmPassword ? "border-green-500" : ""}`}
            />
            {passwordError && (
              <p className="text-sm text-red-500 mt-1">{passwordError}</p>
            )}
            {passwordMatch && data.confirmPassword && (
              <p className="text-sm text-green-500 mt-1">Las contraseñas coinciden</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
} 