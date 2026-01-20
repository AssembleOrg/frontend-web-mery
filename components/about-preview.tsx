'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export function AboutPreview() {
  return (
    <section className='py-20 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-4'>
              About Mery García
            </h2>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Image */}
            <div className='relative'>
              <div className='aspect-square bg-muted rounded-lg overflow-hidden shadow-lg relative'>
                <Image
                  src='/Img-home/about-mery.webp'
                  alt='Mery García - Artista del Tatuaje Cosmético'
                  fill
                  className='object-cover'
                />
              </div>
            </div>

            {/* Content */}
            <div className='space-y-6'>
              <div>
                <p className='text-lg font-secondary text-muted-foreground leading-relaxed'>
                  Hace más de <strong className='text-primary'>20 años</strong>{' '}
                  que me especializo en el mundo de la belleza. Autodidacta por
                  naturaleza, me formé también como Maquilladora de medios,
                  capacitándome para desempeñarme en set tanto en tv, magazines
                  e importantes campañas publicitarias, mientras me capacitaba
                  fuertemente en mi método principal que es el{' '}
                  <strong className='text-primary'>tatuaje cosmético</strong>.
                </p>
              </div>

              <div>
                <p className='font-secondary text-muted-foreground leading-relaxed'>
                  Actualmente me dedico 100% al tatuaje cosmético no solo desde
                  mi <strong>exclusivo</strong> método de nanoblading, sino
                  también de todas técnicas y estéticas más importantes para el
                  rubro. Realizo uno de los cursos más importantes de Argentina,
                  especializándome en mis técnicas con las mejores herramientas
                  del mercado.
                </p>
              </div>

              <div>
                <p className='font-secondary text-muted-foreground leading-relaxed'>
                  Hoy en día lidero un staff que integra los tatuajes cosméticos
                  y estética de cejas y pestañas, formando con mi programa
                  online aquellas pocas que se merecen ser &quot;mis elegidas
                  con todo&quot;.
                </p>
              </div>

              <div className='pt-4'>
                <p className='font-secondary text-muted-foreground mb-2'>
                  Quiénes somos invitada a conocer más de lo que es hoy:
                </p>
                <p className='font-secondary font-semibold text-foreground mb-1'>
                  Cordial,
                </p>
                <p className='text-primary font-custom font-medium'>
                  Mery García
                </p>
              </div>

              {/* CTA Button */}
              <div className='pt-6'>
                <Link href='/about'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='px-8'
                  >
                    Conocer más sobre Mery
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
