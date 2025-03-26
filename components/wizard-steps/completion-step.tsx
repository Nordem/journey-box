"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

export default function CompletionStep({ data, isMobile }) {
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
      className="text-center space-y-6 sm:space-y-8 py-4 sm:py-8"
    >
      <motion.div variants={itemVariants} className="flex justify-center">
        <div className="relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2,
            }}
            className={`${isMobile ? "w-20 h-20" : "w-24 h-24"} rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 flex items-center justify-center`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.4,
              }}
              className={`${isMobile ? "w-16 h-16" : "w-20 h-20"} rounded-full bg-gradient-to-r from-purple-600/40 to-indigo-600/40 flex items-center justify-center`}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.6,
                }}
              >
                <CheckCircle2 className={`${isMobile ? "w-12 h-12" : "w-16 h-16"} text-purple-500`} />
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className={`absolute -top-2 -right-2 ${isMobile ? "w-6 h-6" : "w-8 h-8"} bg-indigo-500 rounded-full flex items-center justify-center`}
          >
            <span className={`text-white ${isMobile ? "text-base" : "text-lg"}`}>✓</span>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2
          className={`${isMobile ? "text-xl" : "text-2xl"} font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400`}
        >
          Profile Complete!
        </h2>
        <p className="text-gray-300 mt-2 max-w-md mx-auto text-sm sm:text-base">
          Thank you for completing your profile. We'll use this information to find the perfect events for you.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 max-w-md mx-auto"
      >
        <h3 className="text-white font-medium mb-3 sm:mb-4 text-sm sm:text-base">Profile Summary</h3>

        <div className="space-y-2 sm:space-y-3 text-left">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm">Name</p>
            <p className="text-white text-sm sm:text-base">{data.userProfile.name || "Not provided"}</p>
          </div>

          <div>
            <p className="text-gray-400 text-xs sm:text-sm">Current Location</p>
            <p className="text-white text-sm sm:text-base">
              {data.userProfile.currentTravelLocation || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-xs sm:text-sm">Event Preferences</p>
            <p className="text-white text-sm sm:text-base">
              {data.eventPreferences.categories.length > 0
                ? data.eventPreferences.categories.slice(0, 2).join(", ") +
                  (data.eventPreferences.categories.length > 2 ? " and more..." : "")
                : "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-xs sm:text-sm">Ideal Outcomes</p>
            <p className="text-white text-sm sm:text-base">
              {data.idealOutcomes.length > 0
                ? data.idealOutcomes.slice(0, 2).join(", ") + (data.idealOutcomes.length > 2 ? " and more..." : "")
                : "Not provided"}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <p className="text-gray-400 text-xs sm:text-sm">
          You can edit your profile at any time from your account settings.
        </p>
      </motion.div>
    </motion.div>
  )
}

