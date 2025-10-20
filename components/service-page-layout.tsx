'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Calendar, Shield, Clock, Star } from 'lucide-react';
import Image from 'next/image';

interface ServicePageLayoutProps {
  title: string;
  image: string;
  children?: React.ReactNode;
}

export function ServicePageLayout({
  title,
  image,
  children,
}: ServicePageLayoutProps) {
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative h-96 overflow-hidden'>
        <Image
          src={image}
          alt={title}
          fill
          className='object-cover'
        />
        <div className='absolute inset-0 bg-black/50' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center text-white'>
            <h1 className='text-4xl md:text-5xl font-primary font-bold mb-4'>
              {title}
            </h1>
            <p className='text-xl font-secondary text-white/90'>
              Cosmetic Tattoo by Mery Garcia
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-4xl mx-auto'>
          {/* What is it Section */}
          <section className='mb-12'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-6 flex items-center'>
              <Star className='h-8 w-8 text-primary mr-3' />
              ¿Qué es {title}?
            </h2>
            <div className='prose prose-lg max-w-none text-muted-foreground'>
              <p className='text-lg leading-relaxed'>
                El {title.toLowerCase()} es un tratamiento de tatuaje cosmético
                de última generación que permite lograr resultados naturales y
                duraderos. Con más de 20 años de experiencia, Mery García ha
                perfeccionado esta técnica para ofrecer la máxima calidad y
                seguridad.
              </p>
            </div>
          </section>

          {/* Process Section */}
          <section className='mb-12 bg-muted/30 rounded-lg p-8'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-6 flex items-center'>
              <Clock className='h-8 w-8 text-primary mr-3' />
              Proceso del Tratamiento
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                    1
                  </div>
                  <div>
                    <h3 className='font-semibold text-foreground'>
                      Consulta inicial
                    </h3>
                    <p className='text-muted-foreground'>
                      Evaluación personalizada y diseño del tratamiento
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                    2
                  </div>
                  <div>
                    <h3 className='font-semibold text-foreground'>
                      Preparación
                    </h3>
                    <p className='text-muted-foreground'>
                      Desinfección y preparación del área de trabajo
                    </p>
                  </div>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                    3
                  </div>
                  <div>
                    <h3 className='font-semibold text-foreground'>
                      Aplicación
                    </h3>
                    <p className='text-muted-foreground'>
                      Realización del tratamiento con técnica especializada
                    </p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold'>
                    4
                  </div>
                  <div>
                    <h3 className='font-semibold text-foreground'>
                      Cuidados posteriores
                    </h3>
                    <p className='text-muted-foreground'>
                      Instrucciones detalladas para el cuidado post-tratamiento
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Biosecurity Section */}
          <section className='mb-12'>
            <h2 className='text-3xl font-primary font-bold text-foreground mb-6 flex items-center'>
              <Shield className='h-8 w-8 text-primary mr-3' />
              Normas de Bioseguridad
            </h2>
            <div className='bg-card p-6 rounded-lg border'>
              <ul className='space-y-3 text-muted-foreground'>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span>
                    Todos los instrumentos son esterilizados siguiendo
                    protocolos médicos
                  </span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span>
                    Uso de materiales descartables y de primera calidad
                  </span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span>
                    Ambiente completamente sanitizado antes de cada
                    procedimiento
                  </span>
                </li>
                <li className='flex items-start space-x-3'>
                  <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                  <span>Cumplimiento estricto de normas de salud vigentes</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Additional content passed as children */}
          {children}

          {/* CTA Section */}
          <section className='bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center'>
            <h2 className='text-2xl font-bold text-foreground mb-4'>
              ¿Lista para tu transformación?
            </h2>
            <p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
              Reservá tu consulta gratuita y descubrí cómo {title.toLowerCase()}{' '}
              puede realzar tu belleza natural.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                size='lg'
                className='px-8'
              >
                <Calendar className='h-5 w-5 mr-2' />
                Reservar Consulta Gratuita
              </Button>
              <Button
                variant='outline'
                size='lg'
                className='px-8'
              >
                Más Información
              </Button>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
