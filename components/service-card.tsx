"use client"

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import Image from 'next/image'

interface ServiceCardProps {
  title: string
  image?: string
  description?: string
  href: string
}

export function ServiceCard({ title, image, description, href }: ServiceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg bg-card shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/30">
      {/* @ts-expect-error - Next.js Link type mismatch with i18n routing */}
      <Link href={href}>
        {/* Image Container */}
        <div className="relative h-80 bg-muted overflow-hidden">
          {image ? (
            <Image 
              src={image} 
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xl font-semibold mb-2 text-white">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 group-hover:bg-primary/5 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <Button 
            variant="outline" 
            className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
          >
            Ver más
          </Button>
        </div>
      </Link>
    </div>
  )
}