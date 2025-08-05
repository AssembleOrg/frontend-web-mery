"use client"

import * as React from "react"
import Image from "next/image"
import { ImageModal } from "@/components/image-modal"

interface PressGalleryProps {
  images: string[]
}

export function PressGallery({ images }: PressGalleryProps) {
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const handleImageClick = (imageName: string) => {
    setSelectedImage(imageName)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Clear selected image after modal animation completes
    setTimeout(() => setSelectedImage(null), 300)
  }

  return (
    <>
      {/* Mobile-first responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {images.map((imageName, index) => (
          <div
            key={imageName}
            className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleImageClick(imageName)}
          >
            <div className="aspect-[3/4] relative">
              <Image
                src={`/prensa/${imageName}`}
                alt={`Mery García press coverage ${index + 1}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                loading="lazy"
              />
              {/* Overlay on hover with click indicator */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  <svg
                    className="w-6 h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          imageSrc={`/prensa/${selectedImage}`}
          imageAlt={`Mery García press coverage - ${selectedImage}`}
        />
      )}
    </>
  )
}