'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollIndicator } from './scroll-indicator';
import { ParagraphSeparator } from './paragraph-separator';

interface AftercareLayoutProps {
  serviceLogoSrc: string;
  children: React.ReactNode;
}

export function AftercareLayout({ serviceLogoSrc, children }: AftercareLayoutProps) {
  const router = useRouter();

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola! Tengo consultas sobre mis cuidados post-tratamiento.');
    window.open(`https://wa.me/5491161592591?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-50" style={{ backgroundColor: '#FBE8EA' }}>
      {/* Hero Section with Generic Logo and Scroll Indicator */}
      <div className="h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-md mb-8">
          <Image
            src="/mery-garcia-aftercare.svg"
            alt="Mery García Aftercare"
            width={400}
            height={200}
            className="w-full h-auto"
            priority
          />
        </div>
        <div className="mt-20">
          <ScrollIndicator targetId="content" />
        </div>
      </div>

      {/* Content Section */}
      <div id="content" className="pb-32">
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
          {/* Service-specific logo */}
          <div className="flex justify-center mb-8 md:mb-12">
            <div className="max-w-xs">
              <Image
                src={serviceLogoSrc}
                alt="Service Logo"
                width={400}
                height={200}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div
            className="prose prose-sm md:prose-base max-w-none"
            style={{
              color: '#545454',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4">
          <ParagraphSeparator />

          <div className="text-center mb-12">
            <h3 className="text-xl md:text-2xl font-bold mb-6" style={{ color: '#545454' }}>
              CONTACTO
            </h3>

            <div className="space-y-3 text-sm md:text-base" style={{ color: '#545454' }}>
              <p className="font-semibold">MERY GARCÍA OFFICE</p>
              <p>Av. Melián 3646 PB 1, C1430EYZ</p>
              <p>Buenos Aires</p>

              <div className="pt-4 space-y-2">
                <p className="font-semibold">Horario:</p>
                <p>Martes a sábados</p>
                <p>de 10 a 18 h</p>
              </div>

              <p className="pt-4 text-xs md:text-sm italic">
                Si algo no sucediera de la forma indicada en la consulta o en la información
                detallada anteriormente, no dudes en consultarnos.
              </p>
            </div>

            {/* WhatsApp Icon Button in Contact Section */}
            <button
              onClick={handleWhatsApp}
              className="mt-6 inline-flex items-center justify-center hover:opacity-80 hover:scale-110 transition-all"
              title="Enviar mensaje por WhatsApp"
            >
              <svg
                className="w-10 h-10 md:w-12 md:h-12"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: '#545454' }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.923 1.262c-1.536.906-2.859 2.367-3.747 4.081-1.396 2.611-.558 5.583 1.928 7.265 1.33.93 3.012 1.214 4.282.971.597-.113 1.172-.425 1.637-.901 1.12-1.128 1.653-2.793 1.653-4.532 0-.745-.122-1.467-.36-2.15-.306-.87-.923-1.656-1.662-2.15-.576-.413-1.21-.646-1.82-.771z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* CTA Buttons - Sticky Footer */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-pink-100 to-transparent pt-6 pb-4 px-4 flex flex-col gap-3 max-w-2xl mx-auto w-full"
        style={{ backgroundColor: 'rgba(251, 232, 234, 0.95)' }}
      >
        <Button
          onClick={() => window.open('https://merygarciabooking.com/', '_blank')}
          className="w-full py-3 text-base font-semibold"
          style={{
            backgroundColor: '#EBA2A8',
            color: 'white',
          }}
        >
          RESERVA TU PRÓXIMA CITA MG
        </Button>

        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="w-full py-3 text-base font-semibold"
          style={{
            color: '#EBA2A8',
            borderColor: '#EBA2A8',
          }}
        >
          VOLVER
        </Button>
      </div>

      {/* Spacer for sticky buttons */}
      <div className="h-32"></div>
    </div>
  );
}
