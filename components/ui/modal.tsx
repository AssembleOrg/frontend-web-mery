"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, children, className }: ModalProps) {
  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in-0 duration-300"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div
        className={cn(
          "relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-background shadow-2xl animate-in zoom-in-95 duration-300",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white transition-all duration-200 hover:bg-black/70 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        
        {children}
      </div>
    </div>
  )
}