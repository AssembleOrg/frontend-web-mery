'use client';

import Image from 'next/image';
import { FaFilePdf, FaWhatsapp } from 'react-icons/fa';

const Separator = () => (
  <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
    <div
      style={{
        width: '6px',
        height: '6px',
        backgroundColor: 'black',
        borderRadius: '50%',
      }}
    />
  </div>
);

const sectionTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '15px',
  textAlign: 'center',
} as const;

const stepTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '10px',
  display: 'block',
} as const;

const paragraph = { marginBottom: '15px' };

export default function EpitesisAftercarePage() {
  return (
    <div
      className='min-h-screen-dvh'
      style={{ backgroundColor: 'var(--mg-pink-lighter)' }}
    >
      <style>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Hero Section */}
      <div
        className='min-h-screen-dvh'
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            animation: 'slideInFromLeft 0.8s ease-out',
          }}
        >
          {/* PNG blanco: brightness(0) lo pasa a gris oscuro sobre el fondo rosa */}
          <Image
            src='/Img-home/mery-blanco-logo.png'
            alt='Mery García Epítesis'
            width={300}
            height={37}
            priority
            style={{ filter: 'brightness(0)', opacity: 0.75 }}
          />
          <span
            style={{
              marginTop: '4px',
              fontSize: '22px',
              fontWeight: 'bold',
              fontStyle: 'italic',
              letterSpacing: '1px',
              lineHeight: 1,
              color: '#414042',
            }}
          >
            Epítesis
          </span>
        </div>
        <button
          onClick={() => {
            const content = document.getElementById('content');
            content?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            marginTop: '60px',
            fontSize: '24px',
            animation: 'bounce 2s infinite',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
          }}
        >
          ↓
        </button>
      </div>

      {/* Content Section */}
      <div
        id='content'
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px',
          color: '#545454',
          fontFamily: 'var(--font-avant-garde-admin), sans-serif',
          lineHeight: '1.8',
        }}
      >
        <h1
          style={{
            textAlign: 'center',
            marginBottom: '40px',
            fontSize: '22px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#B85C66',
            animation: 'fadeIn 0.8s ease-in forwards',
          }}
        >
          SOBRE EL USO Y EL CUIDADO DE TU EPÍTESIS CAP ESPECIALMENTE CREADA
          PARA VOS
        </h1>

        <p
          style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          ¡Gracias por confiar en nosotras para crear tu pieza!
        </p>
        <Separator />

        {/* Sobre la pieza */}
        <h3 style={sectionTitle}>SOBRE LA PIEZA</h3>
        <p style={paragraph}>
          Hay procesos que dejan marcas visibles. Y otros que transforman
          profundamente la forma en que nos miramos. La epítesis de complejo
          areola–pezón (CAP) es una prótesis externa, realizada de manera
          totalmente artesanal y personalizada, diseñada para acompañar procesos
          post quirúrgicos —como mastectomías u otras intervenciones—
          devolviendo armonía, naturalidad y una imagen corporal más completa.
        </p>
        <p style={paragraph}>
          Cada pieza es única, y ahí está la magia. Se trabaja respetando tonos
          de piel, textura, forma, volumen y detalles que hacen que el resultado
          sea hiperrealista, sutil y profundamente personal.
        </p>
        <Separator />

        {/* Proceso */}
        <h3 style={sectionTitle}>¿CÓMO ES EL PROCESO?</h3>
        <p style={paragraph}>Cada paso es cuidado, íntimo y respetuoso.</p>
        <Separator />

        <p style={paragraph}>
          <span style={stepTitle}>PASO 1:</span>
          Se realiza una consulta inicial de manera informativa, donde nos
          conoceremos y analizaremos tu caso.
        </p>
        <Separator />

        <div style={paragraph}>
          <span style={stepTitle}>PASO 2:</span>
          De estar apta y en caso que decidas realizar la pieza con nosotros, el
          trabajo comienza con una segunda etapa donde realizaremos:
          <ul style={{ listStyle: 'disc', paddingLeft: '20px', margin: '10px 0' }}>
            <li>Evaluación de la zona y registro fotográfico.</li>
            <li>Toma de medidas.</li>
            <li>
              Realización de molde negativo customizado en textura, formato y
              color.
            </li>
          </ul>
          Posteriormente, Mery trabaja en el estudio de la forma y color que
          reproducirá sobre la epítesis.
        </div>
        <Separator />

        <p style={paragraph}>
          <span style={stepTitle}>PASO 3:</span>
          Dentro de la misma semana de tomada la muestra, se realiza una prueba
          directamente sobre la piel, de las piezas pre finales para ajustar
          detalles de color y terminaciones. Una vez listas, ¡ya podés disfrutar
          tus CAP!
        </p>
        <Separator />

        {/* Indicaciones de uso */}
        <h3 style={sectionTitle}>INDICACIONES DE USO</h3>
        <p style={paragraph}>
          Pueden utilizarse a diario, en la mayoría de los casos se logra una
          buena adherencia con la piel bien hidratada.
        </p>
        <Separator />
        <p style={paragraph}>
          Son aptas para playa o piscina sin riesgo de desprendimiento.
        </p>
        <Separator />
        <p style={paragraph}>
          Pueden colocarse con o sin adhesivo, según preferencia, tipo de piel y
          criterio médico.
        </p>
        <Separator />
        <p style={paragraph}>
          Vida útil aproximada: entre 6 y 10 meses, dependiendo del cuidado y
          frecuencia de uso.
        </p>
        <Separator />
        <p style={paragraph}>
          Si se utilizan sobre cicatrices, es fundamental proteger la zona del
          sol con protector solar de alto factor para evitar alteraciones en la
          pigmentación.
        </p>
        <Separator />
        <p style={paragraph}>
          Su uso está recomendado en casos de mastectomía (unilateral o
          bilateral), cirugía reconstructiva o cualquier procedimiento que haya
          afectado la apariencia de sus areolas y volumen del pezón.
        </p>
        <Separator />
        <p style={paragraph}>
          Si bien todos los materiales son de alto grado médico certificado, es
          responsabilidad de cada persona contar con el apto médico.
        </p>
        <Separator />
        <p style={paragraph}>
          Estas piezas son creadas especialmente para la persona, no es
          recomendable su intercambio con otros.
        </p>
        <Separator />

        {/* Valores */}
        <h3 style={sectionTitle}>VALORES</h3>
        <p style={paragraph}>
          <span style={stepTitle}>Cita de consulta</span>
          Incluye charla informativa, toma de medidas, molde y registro
          fotográfico.
          <br />
          Valor: $50.000.-
        </p>
        <Separator />
        <p style={paragraph}>
          <span style={stepTitle}>
            1 pieza epítesis CAP 100% customizada
          </span>
          Incluye kit con adhesivos de adhesión media y estuche protector.
          <br />
          Valor: USD 350 precio de lista / USD 300 en efectivo.
        </p>
        <Separator />
        <p style={paragraph}>
          <span style={stepTitle}>1 pieza epítesis CAP con reposición</span>
          Valor: USD 250 precio de lista / USD 200 en efectivo.
        </p>
        <Separator />
        <p style={paragraph}>
          Mery cuenta con una agenda <strong>Special Pass</strong>, pensada
          especialmente para clientas que nos visitan desde el interior o el
          exterior. Son disponibilidades exclusivas con horarios y honorarios
          diferenciales. Podés consultarnos valores y tiempo de entrega para la
          realización de las piezas el mismo día o en el plazo de 24 hs.
          (Incluye seguimiento y ajustes en etapa de prueba.)
        </p>
        <Separator />
        <p style={{ marginBottom: '20px' }}>
          La elaboración de las piezas implica dedicación, planificación y
          trabajo especializado. Por ello, para iniciar el encargo es necesario
          confirmar el compromiso mediante el pago de una seña equivalente al
          50% del valor total, la cual es <strong>NO REEMBOLSABLE</strong> sin
          excepción.
        </p>

        {/* PDF descargable */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={`/downloable/formaciones/${encodeURIComponent('CAP cuidados epitesis Septiembre (2).pdf')}`}
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#2B2B2B',
              color: 'white',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              borderRadius: '4px',
            }}
          >
            <FaFilePdf style={{ width: '22px', height: '22px' }} />
            DESCARGAR GUÍA DE CUIDADOS
          </a>
        </div>

        {/* Contacto */}
        <Separator />
        <div
          style={{
            textAlign: 'center',
            marginTop: '40px',
            marginBottom: '10px',
          }}
        >
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}
          >
            CONTACTO
          </h3>
          <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>
            MERY GARCÍA OFFICE
          </p>
          <p style={{ marginBottom: '5px' }}>Av. Melián 3646 PB 1, C1430EYZ</p>
          <p style={{ marginBottom: '10px' }}>Buenos Aires</p>

          <p style={{ marginBottom: '1px', fontWeight: 'bold' }}>Horario:</p>
          <p style={{ marginBottom: '1px' }}>Martes a sábados</p>
          <p style={{ marginBottom: '20px' }}>de 10 a 18 h</p>

          <p
            style={{
              fontSize: '12px',
              marginBottom: '20px',
              fontStyle: 'italic',
            }}
          >
            Si algo no sucediera de la forma indicada en la consulta o en la
            información detallada anteriormente, no dudes en consultarnos.
          </p>

          {/* WhatsApp Button */}
          <button
            onClick={() =>
              window.open(
                `https://wa.me/5491161592591?text=${encodeURIComponent('Hola chicas, como están? Tengo consultas sobre mi epítesis')}`,
                '_blank'
              )
            }
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '15px',
            }}
            title='Enviar mensaje por WhatsApp'
          >
            <FaWhatsapp
              style={{ width: '40px', height: '40px', color: '#545454' }}
            />
          </button>
        </div>

        {/* Botones CTA sticky */}
        <div
          style={{
            position: 'fixed',
            bottom: '0',
            left: '0',
            right: '0',
            backgroundColor: 'rgba(251, 232, 234, 0.95)',
            padding: '15px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxWidth: '800px',
            margin: '0 auto',
            zIndex: 100,
          }}
        >
          <button
            onClick={() =>
              window.open('https://merygarciabooking.com/', '_blank')
            }
            style={{
              backgroundColor: '#EBA2A8',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            RESERVA TU PRÓXIMA CITA MG
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            style={{
              backgroundColor: 'transparent',
              color: '#EBA2A8',
              border: '2px solid #EBA2A8',
              padding: '12px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            VOLVER
          </button>
        </div>

        {/* Espaciador para botones sticky */}
        <div style={{ height: '130px' }} />
      </div>
    </div>
  );
}
