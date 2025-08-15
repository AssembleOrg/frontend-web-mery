'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { MapPin, Phone, Mail, GraduationCap } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      {/* Hero Section */}
      <section className='relative py-20 bg-gradient-to-b from-primary/5 to-background'>
        <div className='container mx-auto px-4 text-center'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-4xl md:text-5xl font-primary font-bold text-foreground mb-4'>
              Contacto
            </h1>
            <p className='text-xl font-secondary text-muted-foreground'>
              Estamos aquí para ayudarte. Ponte en contacto con nosotros.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-start'>
              
              {/* Left Side - Map and Location */}
              <div className='space-y-6'>
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-6 flex items-center'>
                    <MapPin className='h-6 w-6 text-primary mr-3' />
                    Nuestra Ubicación
                  </h2>
                  
                  {/* Map Container */}
                  <div className='bg-muted rounded-lg overflow-hidden shadow-lg'>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.2948655064226!2d-58.45841662425067!3d-34.59622035660892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb5c7c93ffec5%3A0x4d6d4e2e4e4e4e4e!2sAv.%20Meli%C3%A1n%203646%2C%20C1430%20CABA%2C%20Argentina!5e0!3m2!1ses!2sar!4v1672531200000!5m2!1ses!2sar"
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen={true}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className='w-full h-80'
                    />
                  </div>
                  
                  {/* Address Details */}
                  <div className='bg-card p-6 rounded-lg border mt-4'>
                    <div className='flex items-start space-x-3'>
                      <MapPin className='h-5 w-5 text-primary mt-1 flex-shrink-0' />
                      <div>
                        <h3 className='font-primary font-semibold text-foreground mb-2'>
                          Dirección
                        </h3>
                        <p className='font-secondary text-muted-foreground'>
                          Av. Melián 3646 PB 1<br />
                          CABA, Argentina
                        </p>
                        <p className='font-secondary text-sm text-muted-foreground mt-2'>
                          Martes a Sábado, 10hs a 18hs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Contact Information */}
              <div className='space-y-8'>
                <div>
                  <h2 className='text-2xl font-primary font-bold text-foreground mb-6'>
                    Información de Contacto
                  </h2>
                  
                  {/* Reception Contact */}
                  <div className='bg-card p-6 rounded-lg border mb-6'>
                    <h3 className='font-primary font-semibold text-foreground mb-4 flex items-center'>
                      <Phone className='h-5 w-5 text-primary mr-2' />
                      Recepción General
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-3'>
                        <Phone className='h-4 w-4 text-primary flex-shrink-0' />
                        <a
                          href='tel:1161592591'
                          className='font-secondary text-muted-foreground hover:text-primary transition-colors'
                        >
                          11 6159-2591
                        </a>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <Mail className='h-4 w-4 text-primary flex-shrink-0' />
                        <a
                          href='mailto:info@merygarcia.com.ar'
                          className='font-secondary text-muted-foreground hover:text-primary transition-colors'
                        >
                          info@merygarcia.com.ar
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Training Contact */}
                  <div className='bg-card p-6 rounded-lg border'>
                    <h3 className='font-primary font-semibold text-foreground mb-4 flex items-center'>
                      <GraduationCap className='h-5 w-5 text-primary mr-2' />
                      Contacto para Formaciones
                    </h3>
                    <div className='space-y-3'>
                      <div className='flex items-center space-x-3'>
                        <Phone className='h-4 w-4 text-primary flex-shrink-0' />
                        <a
                          href='tel:1153336627'
                          className='font-secondary text-muted-foreground hover:text-primary transition-colors'
                        >
                          11 5333-6627
                        </a>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <Mail className='h-4 w-4 text-primary flex-shrink-0' />
                        <a
                          href='mailto:cursos@merygarcia.com.ar'
                          className='font-secondary text-muted-foreground hover:text-primary transition-colors'
                        >
                          cursos@merygarcia.com.ar
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className='bg-primary/5 p-6 rounded-lg'>
                  <h3 className='font-primary font-semibold text-foreground mb-3'>
                    Información Importante
                  </h3>
                  <p className='font-secondary text-muted-foreground text-sm leading-relaxed'>
                    Para consultas sobre tratamientos, por favor contacta a recepción. 
                    Para información sobre cursos y formaciones profesionales, utiliza 
                    nuestro contacto especializado en formaciones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}