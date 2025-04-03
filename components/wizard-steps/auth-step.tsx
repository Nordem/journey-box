import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold mb-2 text-white">Create Your Account</h2>
        <p className="text-gray-400">
          Set up your login credentials to access your profile in the future.
        </p>
      </motion.div>

      <Card className="p-6 bg-gray-800/80 border-gray-700">
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={data.email}
                onChange={handleEmailChange}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10"
              />
            </div>
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a secure password"
                value={data.password}
                onChange={handlePasswordChange}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={data.confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="bg-gray-700/70 border-gray-600 text-white placeholder:text-gray-400 pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </motion.div>
        </div>
      </Card>

      <div className="text-sm text-gray-600 mt-4">
        <p>Your password must be at least 6 characters long.</p>
        <p className="mt-2">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </motion.div>
  )
} 