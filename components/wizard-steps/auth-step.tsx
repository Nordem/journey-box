import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface AuthStepData {
  email: string
  password: string
  confirmPassword?: string
}

interface AuthStepProps {
  data: AuthStepData
  updateData: (data: AuthStepData) => void
  isMobile: boolean
}

export default function AuthStep({ data, updateData, isMobile }: AuthStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 6
  }

  const validatePasswordsMatch = (password: string, confirmPassword: string) => {
    return password === confirmPassword
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    updateData({ ...data, email })
    
    if (!validateEmail(email) && email.length > 0) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }))
    } else {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    updateData({ ...data, password })
    
    if (!validatePassword(password) && password.length > 0) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }))
    } else {
      setErrors(prev => ({ ...prev, password: '' }))
    }

    if (data.confirmPassword && !validatePasswordsMatch(password, data.confirmPassword)) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords must match' }))
    } else if (data.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const confirmPassword = e.target.value
    updateData({ ...data, confirmPassword })
    
    if (!validatePasswordsMatch(data.password, confirmPassword)) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords must match' }))
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
        <p className="text-gray-600">
          Set up your login credentials to access your profile in the future.
        </p>
      </div>

      <Card className="p-6 bg-gray-800/80 border-gray-700 text-white">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={data.email}
              onChange={handleEmailChange}
              className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a secure password"
              value={data.password}
              onChange={handlePasswordChange}
              className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={data.confirmPassword || ''}
              onChange={handleConfirmPasswordChange}
              className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
      </Card>

      <div className="text-sm text-gray-600 mt-4">
        <p>Your password must be at least 6 characters long.</p>
        <p className="mt-2">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  )
} 