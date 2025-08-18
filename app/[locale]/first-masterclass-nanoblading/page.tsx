'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { BookingCTA } from '@/components/booking-cta';
import { Download } from 'lucide-react';
import Image from 'next/image';

export default function FirstMasterclassNanobladingPage() {
  const handleDownloadPDF = () => {
    const pdfUrl = '/masterclass-info.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'First-Masterclass-Nanoblading-Info.pdf';
    link.click();
  };

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <section className='container mx-auto px-4 py-16 max-w-7xl'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch mb-16'>
          <div className='order-2 lg:order-1 flex flex-col'>
            <div className='flex-1 bg-black rounded-lg overflow-hidden shadow-xl'>
              <video
                controls
                muted
                className='w-full h-full object-cover'
                onVolumeChange={(e) => {
                  e.currentTarget.muted = true;
                  e.currentTarget.volume = 0;
                }}
              >
                <source
                  src='/emilia-formaciones.mp4'
                  type='video/mp4'
                />
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
          </div>

          <div className='order-1 lg:order-2 flex flex-col'>
            <div className='flex-1 bg-card p-6 lg:p-8 rounded-lg border-4 border-[#f9bbc4] shadow-lg flex flex-col'>
              <div className='mb-4 lg:mb-6 flex-shrink-0'>
                <Image
                  src='/first-masterclass-nanoblading.png'
                  alt='First Masterclass Nanoblading'
                  width={400}
                  height={200}
                  className='w-full h-auto object-contain rounded-lg border-2 border-[#eba2a8]'
                />
              </div>

              <div className='flex-1 space-y-4 lg:space-y-6 flex flex-col justify-between'>
                <div className='space-y-4'>
                  <div className='text-center p-3 lg:p-4 bg-gradient-to-r from-[#fbe8ea] to-[#f7cbcb] rounded-lg'>
                    <h3 className='text-base lg:text-lg font-primary font-bold text-[#660e1b] mb-1 lg:mb-2'>
                      ¿Cuándo?
                    </h3>
                    <p className='text-lg lg:text-2xl font-primary font-bold text-[#660e1b]'>
                      15 DE AGOSTO 2025
                    </p>
                    <p className='text-xs lg:text-sm text-[#2b2b2b]/80'>
                      (10 a 18 horas aproximadamente)
                    </p>
                  </div>

                  <div className='text-center p-3 lg:p-4 bg-gradient-to-r from-[#f7cbcb] to-[#fbe8ea] rounded-lg'>
                    <h3 className='text-base lg:text-lg font-primary font-bold text-[#660e1b] mb-1 lg:mb-2'>
                      ¿Dónde?
                    </h3>
                    <p className='text-base lg:text-xl font-primary font-bold text-[#660e1b]'>
                      CIUDAD AUTÓNOMA DE BUENOS AIRES
                    </p>
                    <p className='text-xs lg:text-sm text-[#2b2b2b]/80'>
                      (salón a definir)
                    </p>
                  </div>
                </div>

                <div className='text-center p-4 lg:p-6 bg-white rounded-lg border border-gray-200 shadow-sm flex-1 flex items-center'>
                  <p className='text-sm lg:text-base text-gray-700 leading-relaxed font-medium'>
                    Una experiencia para ver en vivo a{' '}
                    <strong className='text-[#660e1b]'>MERY GARCÍA</strong>{' '}
                    realizando la técnica más avanzada en brow cosmetic tattoo y
                    disparar tu creatividad llevando tus servicios a otro nivel.
                  </p>
                </div>

                <div className='text-center p-4 lg:p-6 bg-gradient-to-r from-[#660e1b] to-[#4a0a14] rounded-lg text-white shadow-lg'>
                  <h3 className='text-base lg:text-lg font-primary font-bold mb-2 lg:mb-3'>
                    Incluye FREE PASS
                  </h3>
                  <p className='text-lg lg:text-xl font-primary font-bold mb-1 lg:mb-2'>
                    a Estilismo de Cejas & Microblading
                  </p>
                  <p className='text-sm lg:text-lg'>On Line Por 6 meses</p>
                </div>

                <div className='text-center pt-2 lg:pt-4 flex-shrink-0'>
                  <button
                    onClick={handleDownloadPDF}
                    className='bg-[#660e1b] hover:bg-[#4a0a14] text-white px-6 lg:px-8 py-2 lg:py-3 text-sm font-bold rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-2 mx-auto'
                  >
                    <Download className='w-4 h-4' />+ INFO
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full'>
          <div className='bg-card py-8 px-12 rounded-lg border-2 border-dashed border-[#eba2a8] shadow-lg'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-center'>
              <div className='text-center lg:text-left'>
                <div className='flex items-center justify-center lg:justify-start gap-4 mb-4'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src='/valor-masterclass.svg'
                    alt='Valor Masterclass'
                    className='h-12 lg:h-16 opacity-90'
                  />
                </div>
                <p className='text-lg font-primary font-bold text-foreground'>
                  del 6 de junio al 10 de agosto
                </p>
              </div>

              <div className='bg-gradient-to-r from-[#fbe8ea] to-[#f7cbcb] p-6 rounded-lg space-y-3'>
                <div className='border-b border-[#f9bbc4] pb-3'>
                  <p className='font-primary font-bold text-[#660e1b] text-center'>
                    Efectivo / Transferencia bancaria:
                  </p>
                  <p className='font-primary font-bold text-[#660e1b] text-xl text-center'>
                    $ 950.000.-
                  </p>
                </div>
                <div className='text-center'>
                  <p className='font-primary font-bold text-[#660e1b]'>
                    Tarjeta de crédito (un pago)
                  </p>
                  <p className='font-primary font-bold text-[#660e1b] text-xl'>
                    $ 1.300.000
                  </p>
                </div>
              </div>

              <div className='bg-[#fbe8ea] p-4 rounded-lg border border-dashed border-[#eba2a8] text-center'>
                <p className='font-primary font-bold text-[#2b2b2b] text-lg'>
                  Además, de manera presencial en el local
                </p>
                <p className='font-primary font-bold text-[#660e1b] text-xl mt-2'>
                  HASTA 3 CUOTAS SIN INTERÉS
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='py-2'>
        <div className='container mx-auto px-4'>
          <div className='max-w-4xl mx-auto'>
            <BookingCTA
              heading='¿Lista para esta experiencia única?'
              text='No te pierdas la oportunidad de ver en vivo a Mery García y llevar tus habilidades al siguiente nivel'
              mainButtonText='Reservar mi Lugar'
              showExpressButton={false}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
