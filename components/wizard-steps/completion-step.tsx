"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

interface CompletionStepProps {
  data: {
    userProfile: {
      name: string;
      location: string;
      currentTravelLocation: string;
      languages: string[];
      personalityTraits: string[];
      goals: string[];
    };
    eventPreferences: {
      categories: string[];
      vibeKeywords: string[];
      idealTimeSlots: string[];
      budget: string;
      preferredGroupType: string[];
      preferredEventSize: string[];
      maxDistanceKm: number;
    };
    restrictions: {
      avoidCrowdedDaytimeConferences: boolean;
      avoidOverlyFormalNetworking: boolean;
      avoidFamilyKidsEvents: boolean;
      noFamilyKidsEvents: boolean;
    };
    history: {
      recentEventsAttended: any[];
      eventFeedback: any[];
    };
    idealOutcomes: Array<{
      description: string;
    }>;
    calendarEvents: any[];
    deliverables: any[];
  };
  isMobile: boolean;
}

export default function CompletionStep({ data, isMobile }: CompletionStepProps) {
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
            className={`${isMobile ? "w-20 h-20" : "w-24 h-24"} rounded-full bg-gradient-to-r from-purple-600/40 to-indigo-600/40 flex items-center justify-center`}
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
              className={`${isMobile ? "w-16 h-16" : "w-20 h-20"} rounded-full bg-gradient-to-r from-purple-600/60 to-indigo-600/60 flex items-center justify-center`}
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
                <CheckCircle2 className={`${isMobile ? "w-12 h-12" : "w-16 h-16"} text-purple-400`} />
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
          className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-white`}
        >
          Profile Complete!
        </h2>
        <p className="text-gray-200 mt-2 max-w-md mx-auto text-sm sm:text-base">
          Thank you for completing your profile. We'll use this information to find the perfect events for you.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 sm:p-6 max-w-md mx-auto"
      >
        <h3 className="text-white font-medium mb-3 sm:mb-4 text-sm sm:text-base">Profile Summary</h3>

        <div className="space-y-2 sm:space-y-3 text-left">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm sm:text-base">Name</span>
            <span className="text-white text-sm sm:text-base">{data.userProfile.name || "Not provided"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm sm:text-base">Location</span>
            <span className="text-white text-sm sm:text-base">{data.userProfile.location || "Not provided"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm sm:text-base">Current Travel Location</span>
            <span className="text-white text-sm sm:text-base">{data.userProfile.currentTravelLocation || "Not provided"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm sm:text-base">Max Distance</span>
            <span className="text-white text-sm sm:text-base">{data.eventPreferences.maxDistanceKm ? `${data.eventPreferences.maxDistanceKm}km` : "Not provided"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm sm:text-base">Event Categories</span>
            <span className="text-white text-sm sm:text-base">
              {data.eventPreferences.categories?.length ? data.eventPreferences.categories.join(", ") : "Not provided"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm sm:text-base">Ideal Outcomes</span>
            <span className="text-white text-sm sm:text-base">
              {data.idealOutcomes?.length ? data.idealOutcomes.map(o => o.description).join(", ") : "Not provided"}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

