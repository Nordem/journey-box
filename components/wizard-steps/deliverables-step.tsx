"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface Deliverable {
  title: string;
  date: string;
  note: string;
}

interface DeliverablesStepProps {
  data: Deliverable[];
  updateData: (data: Deliverable[]) => void;
  isMobile: boolean;
}

export default function DeliverablesStep({ data, updateData, isMobile }: DeliverablesStepProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(data || [])
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [note, setNote] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  useEffect(() => {
    // Only update when values actually change, not on every render
    if (JSON.stringify(deliverables) !== JSON.stringify(data)) {
      updateData(deliverables)
    }
  }, [deliverables, data, updateData])

  const addDeliverable = () => {
    if (title && date) {
      if (isEditing && currentIndex !== null) {
        // Update existing deliverable
        const updatedDeliverables = [...deliverables]
        updatedDeliverables[currentIndex] = {
          title,
          date: format(date, "yyyy-MM-dd"),
          note: note || "",
        }
        setDeliverables(updatedDeliverables)
      } else {
        // Add new deliverable
        setDeliverables([
          ...deliverables,
          {
            title,
            date: format(date, "yyyy-MM-dd"),
            note: note || "",
          },
        ])
      }

      // Reset form
      setTitle("")
      setDate(undefined)
      setNote("")
      setIsEditing(false)
      setCurrentIndex(null)
    }
  }

  const editDeliverable = (index: number) => {
    const deliverable = deliverables[index]
    setTitle(deliverable.title)
    setDate(new Date(deliverable.date))
    setNote(deliverable.note || "")
    setIsEditing(true)
    setCurrentIndex(index)
  }

  const removeDeliverable = (index: number) => {
    const updatedDeliverables = deliverables.filter((_, i) => i !== index)
    setDeliverables(updatedDeliverables)

    // If currently editing this deliverable, reset the form
    if (isEditing && currentIndex === index) {
      setTitle("")
      setDate(undefined)
      setNote("")
      setIsEditing(false)
      setCurrentIndex(null)
    }
  }

  const cancelEdit = () => {
    setTitle("")
    setDate(undefined)
    setNote("")
    setIsEditing(false)
    setCurrentIndex(null)
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
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <div className="text-center mb-4 sm:mb-6">
          <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-white`}>Deliverables</h2>
          <p className="text-gray-400 text-sm">Track your important work deliverables and deadlines</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white text-xs sm:text-sm">
                Deliverable Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 text-sm"
                placeholder="e.g., Client Presentation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-white text-xs sm:text-sm">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal bg-gray-800/80 border-gray-700 text-white hover:bg-gray-700/80 ${!date && "text-gray-400"} text-sm`}
                    size={isMobile ? "sm" : "default"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800/80 border-gray-700" align="start">
                  <Calendar 
                    mode="single" 
                    selected={date} 
                    onSelect={setDate} 
                    initialFocus 
                    className="text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-white text-xs sm:text-sm">
                Note
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500 text-sm min-h-[100px]"
                placeholder="Additional details about this deliverable"
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={addDeliverable}
                disabled={!title || !date}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm"
                size={isMobile ? "sm" : "default"}
              >
                {isEditing ? "Update Deliverable" : "Add Deliverable"}
              </Button>

              {isEditing && (
                <Button
                  onClick={cancelEdit}
                  variant="outline"
                  className="bg-gray-800/80 border-gray-700 text-white hover:bg-gray-700/80 text-sm"
                  size={isMobile ? "sm" : "default"}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <Label className="text-white text-sm">Your Deliverables</Label>
          <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2">
            {deliverables.length > 0 ? (
              deliverables
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((deliverable, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/80 border border-gray-700 rounded-lg p-3 sm:p-4 relative"
                  >
                    <div className="absolute top-2 right-2 flex space-x-1 sm:space-x-2">
                      <button
                        type="button"
                        onClick={() => editDeliverable(index)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={isMobile ? "14" : "16"}
                          height={isMobile ? "14" : "16"}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Trash2 size={isMobile ? 14 : 16} />
                      </button>
                    </div>

                    <div className="pr-14 sm:pr-16">
                      <h3 className="text-purple-400 font-medium text-sm">{deliverable.title}</h3>
                      <div className="flex items-center text-xs sm:text-sm text-gray-200 mt-1">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {new Date(deliverable.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {deliverable.note && <p className="text-gray-200 text-xs sm:text-sm mt-2">{deliverable.note}</p>}
                    </div>
                  </motion.div>
                ))
            ) : (
              <p className="text-gray-400 text-xs sm:text-sm">
                No deliverables added yet. Add your first deliverable using the form.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

