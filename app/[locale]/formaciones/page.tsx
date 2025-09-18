'use client';

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import SimpleCourseCard from '@/components/simple-course-card';
import SimpleCourseModal from '@/components/simple-course-modal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Course } from '@/types/course';

export default function FormacionesPage() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const autoStylingCourse: Course = {
    id: 'auto-styling-cejas',
    title: 'AUTO STYLING ESTILISMO DE CEJAS ®',
    image: '/formacion/estilismo.webp',
    price: 280000,
    priceDisplay: '$280.000',
    slug: 'auto-styling-cejas',
    currency: 'ARS',
    description: 'Aprende a diseñar, cuidar y potenciar tus cejas por ti misma',
    modalContent: {
      detailedDescription:
        'Con más de 20 años de experiencia en Estilismo de Cejas, una estética hiperrealista y el reconocimiento de talentosas colegas y celebridades influyentes del país, Mery Garcia te abre las puertas de su oficio.\n\nSu técnica impecable, su visión de las proporciones del rostro, su criterio estético. Con los contenidos totalmente actualizados y nuevas técnicas, resumidas para vos!.\n\n¿Por qué focalizarse en una minúscula parte del rostro?\nPorque lograras transformaciones INCREIBLES.\n\nQuedan especialmente invitad@s a nuestro mundo, donde queda claro que aquí, los detalles son TODO.',
      includes: [
        { iconImage: '/intro-icon.png', text: 'INTRODUCCIÓN' },
        {
          iconImage: '/video-icon.png',
          text: 'VIDEOS EXPLICATIVOS DE LA TEORÍA',
        },
        { iconImage: '/pdf-icon.png', text: 'CONTENIDOS PDF' },
        {
          iconImage: '/video-icon.png',
          text: 'VIDEO TUTORIAL DE LOS SERVICIOS',
        },
        { iconImage: '/video-icon.png', text: 'ACCESO A CLASE GRABADA' },
      ],
      targetAudience:
        'A cualquier persona con o sin experiencia que desee aprender a diseñar, cuidar y potenciar sus cejas con estética MG.\n\nPara aquellas clientas que nos visitan anualmente desde otras ciudades que quieran complementar su cejas con Cosmetic Tattoo, Alopecias y clientas que requieran servicios más seguido y su agenda no les permita visitarnos mensualmente.\n\nEsta formación les dará la posibilidad de tener herramientas para no depender 100% de nuestro equipo. Manteniendo un diseño hipernatural y elegante.',
      specialNotes:
        'Modalidad ONLINE con acceso ilimitado por 6 meses a videos explicativos, teóricos y prácticos.\n\nOptativo: Posibilidad de sumar practicas ONLINE o PRESENCIAL con Mery Garcia o Staff MG.\n\nNo necesitas experiencia previa.',
      additionalInfo:
        'Si no residís en Argentina, el valor es de U$S 300.- y el medio de pago es a través de PayPal.',
    },
  };

  const handleAutoStylingClick = () => {
    setSelectedCourse(autoStylingCourse);
    setIsModalOpen(true);
  };

  const courses: Course[] = [
    {
      id: 'estilismo-cejas',
      title: 'ESTILISMO DE CEJAS ® - MÓDULO 1',
      image: '/formacion/estilismo.webp',
      price: 280000,
      priceDisplay: '$280.000',
      slug: 'estilismo-cejas',
      currency: 'ARS',
      description:
        'Formación Online Completa.Incluye la técnica Refill created by Mery Garcia',
      modalContent: {
        detailedDescription:
          'Con más de 20 años de experiencia en Estilismo de cejas, una estética hiperrealista y el reconocimiento de talentosas colegas y celebridades influyentes del país, Mery Garcia te abre las puertas de este oficio fascinante donde no dejaras de aprender y perfeccionarte JAMÁS.\n\nSu técnica impecable, su visión de las proporciones del rostro, su criterio estético y todo lo que necesitas para convertir este oficio en tu pasión. Con contenidos totalmente actualizados y nuevas técnicas.\n\n¿Por qué focalizarse en una minúscula parte del rostro? Porque lograrás transformaciones INCREÍBLES y una fidelidad de tus clientes que jamás habías experimentado.\n\nEsta formación fue creada con el fin de fundamentar absolutamente todos los conocimientos que nuestra Brow artist fue absorbiendo de manera autodidacta y luego enriqueció con formadoras Top del exterior.\n\nDesde principiantes hasta reconocidas colegas Estilistas de cejas, todos podrán aprender este oficio creando diseños personalizados.\n\nQuedan especialmente invitados a nuestro mundo, donde queda claro que aquí, las cejas son TODO.\n\n Este módulo incluye la nueva técnica de Refill created By Mery Garcia por lo que no es necesaria la compra por separado de dicho módulo.\n\n Estilismo de Cejas & Cosmetic Tattoo no es una Clase, es una Carrera ✨ ',
        includes: [
          {
            iconImage: '/video-icon.png',
            text: 'Video tutoriales paso a paso',
          },
          { iconImage: '/pdf-icon.png', text: 'Manual digital en PDF' },
          {
            iconImage: '/video-icon.png',
            text: 'Certificado de participación',
          },
          { iconImage: '/video-icon.png', text: 'Acceso a grupo exclusivo' },
        ],
        targetAudience:
          'Desde aficionados / apasionados del Brow Stylist hasta profesionales, esta formación está dirigida a quien desee aprender en profundidad todos los servicios de Estilismo de cejas y perfeccionarse en la reconocida técnica #ByMeryGarcia',
        specialNotes:
          'Este módulo incluye la nueva técnica de Refill created by Mery García por lo que no es necesario la compra por separado de dicho tratamiento.',
        additionalInfo:
          'Si no residís en Argentina, el valor es de U$S 200.- y el medio de pago es a través de PayPal.',
      },
    },
    {
      id: 'refill',
      title: 'Refill (New Technique)',
      image: '/formacion/refill.webp',
      price: 80000,
      priceDisplay: '$80.000',
      slug: 'refill',
      currency: 'ARS',
      description:
        'Formación Online. Tecnica exclusiva creada por MG. Requiere experiencia previa.',
      modalContent: {
        detailedDescription:
          'Técnica exclusiva creada por nuestra Brow Boss. Aprendé a reactivar y/o potenciar el efecto de densidad, tiñendo la piel de las cejas con un juego de sombras de acabado hiperrealista.\n\nMG te trae esta innovadora técnica que estará disponible para que puedan acceder y perfeccionarse quienes cuenten con experiencia previa en Estilismo de Cejas (Profesionales de cejas y maquilladoras), dentro de nuestras Formaciones MG, como también por fuera del programa principal.\n\nVideo de teoría, práctica de diseño y paso a paso del servicio.\n\nRequiere experiencia previa de Estilismo de Cejas.',
        includes: [
          { iconImage: '/video-icon.png', text: 'Video de teoría' },
          { iconImage: '/video-icon.png', text: 'Práctica de diseño' },
          { iconImage: '/pdf-icon.png', text: 'Manual de técnica exclusiva' },
          { iconImage: '/video-icon.png', text: 'Paso a paso del servicio' },
        ],
        targetAudience:
          'Desde aficionados/ apasionados del Brow Stylist hasta profesionales, esta formación está dirigida a quien desee aprender y perfeccionarse en la reconocida técnica de Microblading #ByMeryGarcia',
        specialNotes:
          'Esté módulo, se encuentra incluido en “MÓDULO I – Estilismo de Cejas” por lo que no es necesaria su compra por separado.',
        additionalInfo:
          'Si no residís en Argentina, el valor es de U$S 90.- y el medio de pago es a través de PayPal.',
      },
    },
    {
      id: 'microblading',
      title: 'MICROBLADING ® - MODULO 2',
      image: '/formacion/microblading.webp',
      price: 350000,
      priceDisplay: '$350.000',
      slug: 'microblading',
      currency: 'ARS',
      description: 'Formación Online',
      modalContent: {
        detailedDescription:
          'El servicio de cejas que todo Estilista ansia aprender a la perfección, muy pronto estará disponible para que puedas ir absorbiendo cada conocimiento a tu ritmo y desde tu hogar. Con contenidos totalmente actualizados.\n\nJunto a Mery Garcia (precursora y referente estética en Microblading) vas a lograr aprender tanto desde cero como perfeccionar tu técnica partiendo de los errores.\n\nCada contenido aquí explicado es la suma de sus ensayos, su constante evolución y sus formaciones tanto en Los Ángeles y New York como en São Paulo y Río de Janeiro, junto a los mejores referentes del Microblading.\n\nRepasaremos en profundidad el Módulo 1: Estilismo de Cejas para luego adentrarnos e ir profundizando en el Módulo 2: Microblading, donde aprenderás y perfeccionaras técnicas de Estructura, Trama, Colorimetría avanzada, Teoría de las profundidades de la piel, Calidades y elección de herramientas e insumos, errores comunes, Criterios estéticos, Bioseguridad entre muchos otros temas.\n\nDicha formación está cuidadosamente pensada de modo circular, donde cada objetivo podrás retomarlo desde la práctica cuantas veces sea necesario hasta alcanzar la expertise y así pasar al siguiente objetivo.\n\nTe recordamos que para realizar el Módulo II, es necesario realizar el Módulo I, Estilismo de Cejas.\n\nEl sueño de nuestra Brow Boss cada vez más cerca! Poblar la Argentina y el mundo de cejas #ByMeryGaria\n\nEstilismo de Cejas & Cosmetic Tattoo no es una Clase, es una Carrera',
        includes: [
          { iconImage: '/intro-icon.png', text: 'Introducción' },
          {
            iconImage: '/video-icon.png',
            text: 'Video explicativo de la suma de sus arrastre',
          },
          { iconImage: '/pdf-icon.png', text: 'Manual técnico avanzado' },
          {
            iconImage: '/video-icon.png',
            text: 'Video tutorial de Microblading',
          },
        ],
        targetAudience:
          'Desde aficionados/ apasionados del Brow Stylist hasta profesionales, esta formación está dirigida a quien desee aprender y perfeccionarse en la reconocida técnica de Microblading #ByMeryGarcia',
        specialNotes: 'Ya podés ser parte del #BrowTeam 🔥',
        additionalInfo:
          'Recordá que el Módulo II: Microblading es correlativo al Módulo I Estilismo de Cejas! Por lo cual requiere a o a la cursada completa!',
      },
    },
    {
      id: 'nanoblading-exclusivo',
      title: 'Nanoblading By Mery Garcia',
      image: '/formacion/nanoblading-exclusive.webp',
      price: 2200,
      priceDisplay: 'U$S 2.200',
      slug: 'nanoblading-exclusivo',
      currency: 'USD',
      description: 'Formación presencial con preparación Online.',
      modalContent: {
        detailedDescription:
          'Lo último en Tattoo Cosmetic ya está disponible SOLO en #FormacionesMG Estabas esperando la técnica más innovadora? La espera terminó! Nanoblading llegó.\n\nYa podés formarte en la técnica más vanguardista en Tattoo Cosmetic. En esta nueva Formación, vas a poder crear cejas hiperrealistas en todas las pieles y todos los casos! MG es la única artista del país en realizar y enseñar esta técnica.\n\nNuestra #BrowBoss Mery García se perfeccionó en el exterior y cuenta con 2 años de experiencia utilizando Nanoblading. En esta Formación te enseñará a lograr la fórmula perfecta de combinación de aguja, calidad de máquina, potencia, pigmentos, y combinaciones infalibles seleccionadas por ella misma para lograr el mismo nivel de resultados que colegas internacionales…\n\nEn Nanoblading te mostrará sus elecciones y todo su proceso creativo y de aprendizaje. #FormacionesMG tienen una instancia súper valiosa que es nuestra PREPARACIÓN, la cual contará con accesibilidad a videos con todos los contenidos y los paso a paso.\n\nSe trata de una Formación presencial con preparación virtual, a la cual podrás acceder de manera Individual en un ONE TO ONE, o de manera grupal.\n\nTengas o no experiencia en tatuaje cosmético, podés consultarnos para diseñar un Plan de Estudios 100% Personalizado.\n\nEs importante contar con un Portfolio de Trabajos Actualizados, que representen el momento actual artístico de sus trabajos. El mismo será Evaluado por MG\n\n',
        includes: [
          {
            iconImage: '/video-icon.png',
            text: 'Videos explicativos de la teoria',
          },
          {
            iconImage: '/pdf-icon.png',
            text: 'Contenido PDF descargable',
          },
          {
            iconImage: '/video-icon.png',
            text: 'Video Tutorial de los servicios',
          },
        ],
        targetAudience:
          'Desde aficionados / apasionados del Brow Stylist hasta profesionales, esta formación está dirigida a quien desee aprender en profundidad todos los servicios de Estilismo de cejas y perfeccionarse en la reconocida técnica #ByMeryGarcia',
        specialNotes: 'Técnica exclusiva disponible SOLO en #FormacionesMG',
        additionalInfo: 'Sean todos bienvenidos a formar parte del Universo MG',
      },
    },
    {
      id: 'lip-blush',
      title: 'Lip Blush',
      image: '/formacion/lipblush.webp',
      price: 550000,
      priceDisplay: '$550.000',
      slug: 'lip-blush',
      currency: 'ARS',
      description: 'Formación Online',
      modalContent: {
        detailedDescription:
          'Formaciones en LIP BLUSH is hereee!\n\nEstamos felices de lanzar esta Formación MEGA esperada.\n\nElevá tus habilidades con la tutoría de Mery García, con más de dos décadas de experiencia y formación constante en el exterior.\n\n¿Qué esperar de esta Formación?\n\n• Aprendé a diseñar labios hiper definidos con textura de acabado hiperrealista.\n• Creá combinaciones de color (colorimetría) totalmente personalizadas para cada clienta.\n• Entendé la importancia del dibujo: clave para recrear, rejuvenecer y definir.\n• Seleccioná las herramientas correctas según lo que quieras crear.\n\nNuestro material incluye resultados 100% REALES: trabajos propios y fotos sin retoque!\n\nSean todos bienvenidos a formar parte del Universo MG',
        includes: [
          { iconImage: '/pdf-icon.png', text: 'Contenidos PDF descargables' },
          {
            iconImage: '/video-icon.png',
            text: 'Videos explicativos de la teoria',
          },
          {
            iconImage: '/video-icon.png',
            text: 'Video tutorial de los servicios',
          },
        ],
        targetAudience:
          'Desde aficionados/apasionados del lip-brush hasta profesionales, esta formación está dirigida a quien desee aprender y perfeccionarse en la reconocida técnica de Lip Brush',
        specialNotes:
          'Si no residís en Argentina, el valor es de U$S 500.-  y el medio de pago es a través de PayPal.',
        additionalInfo: 'Sean todos bienvenidos a formar parte del Universo MG',
      },
    },
    {
      id: 'camuflaje-simple',
      title: 'Camuflaje Simple',
      image: '/formacion/camuflaje.webp',
      price: 550000,
      priceDisplay: '$550.000',
      slug: 'camuflaje-simple',
      currency: 'ARS',
      description: 'Formación Online. Requiere experiencia previa.',
      modalContent: {
        detailedDescription:
          'Estamos emocionadas por presentarles una evolución revolucionaria en el arte de las cejas…\n\nNuestro innovador servicio de Camuflaje Simple llegó para cambiar el juego por completo.\n\nUna Formación CLAVE para todo artista de Cosmetic Tattoo que permite corregir y mejorar errores propios y ajenos. Camuflaje Simple fue creada por MG y requiere experiencia previa, logrando asi trabajar con clientes que ya han tenido una experiencia de Microblading, actualizando trabajos propios antiguos y/o preparando la piel para lograr mucho más hiperrealismo en resultados no deseados compactos o grises.\n\nCasi el 80% de nuestros nuevos clientes ya han tenido una experiencia anterior, de modo que esta formación es indispensable para potenciar tus trabajos y llevar tus resultados a otro nivel!\n\nDe acuerdo a tu experiencia, diseñaremos para vos un Plan de Estudios 100% personalizado.\n\nEs importante contar con un Portfolio de Trabajos Actualizados, que representen el momento actual artístico de sus trabajos. El mismo será Evaluado por MG\n\n¡Estamos emocionadas de darte la bienvenida! Preparate para elevar tus habilidades Ready for new challenges? JOIN US',
        includes: [
          {
            iconImage: '/video-icon.png',
            text: 'Videos explicativos de la teoria',
          },
          { iconImage: '/pdf-icon.png', text: 'Contenido pdf descargable' },
          {
            iconImage: '/video-icon.png',
            text: 'Video tutorial de los servicios',
          },
        ],
        targetAudience:
          'Artistas con experiencia previa que buscan especializarse en corrección de trabajos anteriores.',
        specialNotes:
          'Si no residís en Argentina, el valor es de U$S 500.-  y el medio de pago es a través de PayPal.',
        additionalInfo: 'Sean todos bienvenidos a formar parte del Universo MG',
      },
    },
    {
      id: 'camuflaje-senior',
      title: 'Camuflaje Senior',
      image: '/formacion/camuflaje-senior.webp',
      price: 2900,
      priceDisplay: 'U$S 2.900',
      slug: 'camuflaje-senior',
      currency: 'USD',
      description:
        'Formación Presencial con preparación Online. Requiere experiencia previa',
      modalContent: {
        detailedDescription:
          'Estamos emocionadas por presentarles una evolución revolucionaria en el arte de las cejas…\n\nNuestro innovador servicio de Camuflaje Senior llegó para cambiar el juego por completo.\n\nCamuflaje senior es la Creación de nuestra #BrowBoss más evolucionada en términos de corrección. Combina neutralización, suavizado de tinta y dibujo en una misma sesión logrando los resultados de 6 o 7 meses en 2 o 3 meses.\n\n¡Toda la expertisse de Mery García en colorimetría, dibujo con máquina y corrección de estructura y textura disponible en una formación que lleva a cualquier artista de Cosmetic Tattoo al más alto nivel!\n\nEsta Formación está disponible para personas con experiencia previa en Tattoo Cosmetic, que se hayan formado o no con nosotras. Se trata de una Formación presencial con preparación virtual, a la cual podrás acceder de manera Individual en un ONE TO ONE, o de manera grupal.\n\nDe acuerdo a tu experiencia, diseñaremos para vos un Plan de Estudios 100% personalizado.\n\n¡Estamos emocionadas de darte la bienvenida! Preparate para elevar tus habilidades Ready for new challenges? JOIN US!',
        includes: [
          {
            iconImage: '/video-icon.png',
            text: 'Videos explicativos de la teoria',
          },
          {
            iconImage: '/video-icon.png',
            text: 'Video tutorial de los servicios',
          },
          {
            iconImage: '/pdf-icon.png',
            text: 'Contenidos PDF descargables',
          },
        ],
        targetAudience:
          'Experiencia previa en Tattoo Cosmetic, que se hayan formado o no con nosotras. Se trata de una Formación presencial con preparación virtual, a la cual podrás acceder de manera Individual en un ONE TO ONE, o de manera grupal.',
        specialNotes: 'Formación presencial con cupos limitados',
        additionalInfo: 'Sean todos bienvenidos a formar parte del Universo MG',
      },
    },
    {
      id: 'brow-essentials',
      title: 'BROW ESSENTIALS: PRIVATE SESSIONS',
      image: '/formacion/brow-essentials.webp',
      price: 0,
      priceDisplay: 'Consultar',
      slug: 'brow-essentials',
      currency: 'USD',
      description: 'Espacios exclusivos para formar a tu equipo de trabajo.',
      modalContent: {
        detailedDescription:
          'Con el objetivo de sumar conocimientos básicos sobre el Estilismo de Cejas, te brindamos las herramientas necesarias para potenciar tus servicios y llevarlos a otro nivel. Se trata de una exclusiva jornada para vos y tu equipo.',
        includes: [],
        targetAudience:
          'Makeups artists y profesionales beauty, equipos de trabajo que quieran sumar nociones básicas de Estilismo de Cejas para complementar sus servicios',
        specialNotes: 'Formación corporativa con modalidades flexibles',
        additionalInfo: 'Sean todos bienvenidos a formar parte del Universo MG',
      },
    },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <section className='w-full'>
        <div className='container mx-auto px-4 max-w-7xl'>
          <Image
            src='/Formacion-banner.png'
            alt='Formaciones Mery García'
            width={1920}
            height={600}
            className='w-full h-auto object-cover rounded-lg'
            priority
          />
        </div>
      </section>

      {/* Auto Styling Banner */}
      <section className='container mx-auto px-4 py-8 max-w-7xl'>
        <div className='relative bg-gradient-to-r from-[#fbe8ea] to-[#f9bbc4] p-6 md:p-8 rounded-lg border-2 border-[#eba2a8] shadow-lg'>
          {/* Badge "NUEVO" */}
          <div className='absolute -top-3 left-6 bg-[#660e1b] text-white px-4 py-1 text-sm font-bold rounded-full'>
            NUEVO
          </div>

          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            {/* Contenido del Banner */}
            <div className='text-center md:text-left flex-1'>
              <h2 className='text-2xl md:text-3xl font-primary font-semibold text-[#660e1b]/80 mb-3'>
                ¿Querés aprender a diseñar tus propias cejas?
              </h2>
              <p className='text-xl md:text-2xl lg:text-3xl font-primary font-black text-[#660e1b] mb-2'>
                Auto Styling Estilismo de Cejas ®
              </p>
              <p className='text-sm text-[#660e1b]/70 font-medium'>
                ✨ Sin experiencia requerida • 📱 100% Online • ⏰ 6 meses de
                acceso
              </p>
            </div>

            {/* CTA Button */}
            <div className='text-center'>
              <div className='mb-3'>
                <span className='text-2xl font-primary font-bold text-[#660e1b]'>
                  $280.000
                </span>
                <p className='text-xs text-[#660e1b]/70'>
                  Incluye certificación y materiales
                </p>
              </div>
              <button
                onClick={handleAutoStylingClick}
                className='bg-[#660e1b] hover:bg-[#4a0a14] text-white px-6 py-3 rounded-full font-primary font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform'
              >
                🎯 Quiero Aprender
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* <section className='container mx-auto px-4 py-8 max-w-7xl'>
        <div className='relative bg-card p-4 md:p-8 rounded-lg border-2 border-dashed border-[#660e1b]'>
          <div className='flex justify-center items-center relative'>
            <div className='absolute left-0 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-[#660e1b] text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-bold rounded-full z-10'>
              NEW!
            </div>

            <Image
              src='/first-masterclass-nanoblading.png'
              alt='First Masterclass Nanoblading'
              width={600}
              height={400}
              className='w-full max-w-2xl h-auto object-contain'
            />

            <button
              onClick={() => router.push('/es/first-masterclass-nanoblading/')}
              className='absolute right-0 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-[#660e1b] hover:bg-[#4a0a14] text-white px-4 py-1 md:px-6 md:py-2 text-xs md:text-sm font-bold rounded-full transition-colors duration-200 hover:cursor-pointer z-10'
            >
              + INFO
            </button>
          </div>
        </div>
      </section> */}

      <section className='container mx-auto px-4 pb-16 py-8 max-w-7xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {courses.map((course) => (
            <SimpleCourseCard
              key={course.id}
              image={course.image}
              title={course.title}
              price={course.priceDisplay}
              description={course.description}
              onCourseClick={() => handleCourseClick(course)}
            />
          ))}
        </div>
      </section>

      <Footer />

      <SimpleCourseModal
        course={selectedCourse}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
