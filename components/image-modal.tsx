"use client"

import * as React from "react"
import Image from "next/image"
import { Modal } from "@/components/ui/modal"

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageSrc: string
  imageAlt: string
}

export function ImageModal({ isOpen, onClose, imageSrc, imageAlt }: ImageModalProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false)

  // Reset image loaded state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setImageLoaded(false)
    }
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="bg-transparent shadow-none animate-in fade-in-0 zoom-in-95 duration-300"
    >
      <div className="relative flex items-center justify-center p-4">
        {/* Loading spinner */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
        
        {/* Full-size image */}
        <div className="relative max-h-[85vh] max-w-[85vw]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={1200}
            height={1600}
            className={`h-auto w-auto max-h-[85vh] max-w-[85vw] object-contain transition-all duration-500 rounded-lg ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onLoad={() => setImageLoaded(true)}
            priority
            quality={95}
          />
        </div>
      </div>
    </Modal>
  )
}