"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true)

  // Check if banner was previously dismissed
  useEffect(() => {
    const bannerDismissed = localStorage.getItem("betaBannerDismissed")
    if (bannerDismissed === "true") {
      setIsVisible(false)
    }
  }, [])

  const dismissBanner = () => {
    setIsVisible(false)
    localStorage.setItem("betaBannerDismissed", "true")
  }

  // If banner is not visible, don't render anything
  if (!isVisible) return null

  return (
    <div className="bg-blue-600 dark:bg-blue-800 text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            This application is in <strong>BETA</strong>. Features may change and bugs may occur.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-8 w-8 rounded-full hover:bg-blue-500 dark:hover:bg-blue-700 text-white"
          onClick={dismissBanner}
          aria-label="Dismiss beta banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
