'use client';

import Image from 'next/image';
import { FaWhatsapp } from 'react-icons/fa';

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

export default function CamouflageAftercarePage() {
  return (
    <div
      style={{ backgroundColor: 'var(--mg-pink-lighter)', minHeight: '100vh' }}
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
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <Image
          src='/mery-garcia-aftercare.svg'
          alt='Mery García Aftercare'
          width={300}
          height={150}
          priority
          style={{ animation: 'slideInFromLeft 0.8s ease-out' }}
        />
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
        {/* Service Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Image
            src='/logo_mg_after_care_camouflage.svg'
            alt='Camouflage'
            width={300}
            height={150}
            style={{ animation: 'fadeIn 0.8s ease-in forwards' }}
          />
        </div>

        {/* Contenido */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          Felicitaciones por tu nuevo servicio!
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Los mejores resultados los obtendrás siguiendo al pie de la letra las
          indicaciones que aquí te detallamos.
        </p>
        <Separator />

        <p
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          ¡Vos podés hacerlo!
        </p>
        <Separator />

        <p
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            marginBottom: '20px',
          }}
        >
          Y así es cómo…
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          2 hs después del procedimiento, sanitizá muy bien tus manos y agregá
          agua a la solución jabonosa de tu kit, mezcla bien hasta unificar e
          higienizá tus cejas muy cuidadosamente. Retirá el exceso de humedad
          con el pañito esterilizado de tu kit. ¡Y eso es todo por los próximos
          10 días!
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          En el caso de ser necesario, utilizá papel tissue por lo menos 2-3
          veces por día para pieles normales o 5-6 veces por día para pieles
          grasas, durante los primeros 10 días, para absorber el exceso de
          oleosidad y sudor.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Mantené tus cejas fuera del chorro de agua y hacé lo posible para
          limpiar tu pelo de manera cuidadosa y sin mojar tu cara. Tené a mano
          toallas de papel por si llegas a mojar accidentalmente. Realizá tus
          baños cortos y a temperatura media para generar el menor vapor
          posible.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Nada de ejercicio durante los 10 días posteriores al procedimiento. Si
          querés que los colores y los detalles no se borren, esto es crucial.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Durante el periodo de cicatrización (primeros 10 días), protegé tus
          cejas del sol utilizando gorro y anteojos.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Usá una toalla húmeda o toallitas desechables para limpiar alrededor
          de tus cejas, asegurándote que estas no se mojen. Pasados los 10 días,
          lava tu cara con normalidad, pero con suavidad.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          No utilices nada de maquillaje o cremas en las cejas durante los
          primeros 10 días. En caso de sentir mucha tirantez, SOLO podrás
          utilizar Aquaphor.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          No apliques ningún producto con derivados de petróleo y NO uses cremas
          cicatrizantes. No coloques en tus cejas ningún producto contra el
          acné, cremas que aclaren la piel, ácidos glicólicos, retinoicos, etc.,
          durante la cicatrización.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          No frotes o saques las cascaritas de las cejas durante la
          cicatrización. Es normal que pierdas un poco de piel durante este
          período. A los 10 días ya concluyó la cicatrización, ¡solo queda
          cuidar tus cejas!
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Finalizada la cicatrización es indispensable proteger tus cejas a
          diario con un SPF 50 o más durante todo el tiempo que tengas
          pigmentación generada a través de un tatuaje cosmético. El no respetar
          este cuidado puede generar la pérdida prematura del servicio
          realizado, así como también la desvirtuación del color.
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          Aprovechamos para recordarte que cualquier servicio de tatuaje
          cosmético en tu rostro, haya sido realizado o no por MG & Staff,
          deberá recibir el mismo cuidado.
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          Podrás realizar en tus cejas tinte o refill, o cualquier servicio que
          implique un proceso químico, luego de transcurridos 30 días de tu
          sesión de camouflage. Evitá hacerlo antes para no perjudicar el
          resultado de nuestro trabajo, así como también evitar infecciones y
          graves posibles reacciones de tu piel.
        </p>

        <Separator />

        <h3
          style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}
        >
          ¿Qué esperar?
        </h3>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            DÍA 1:
          </span>{' '}
          tus cejas altamente detalladas y brillantes, ligeramente irritadas, en
          menor o mayor medida dependiendo del trabajo realizado para mejorar el
          aspecto de las mismas.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            DÍA 2 a 5:
          </span>{' '}
          tus cejas se pondrán más oscuras porque se formará la cascarita, esto
          es TEMPORARIO, ¡no te asustes!
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              display: 'block',
            }}
          >
            DÍA 10 a 30:
          </span>{' '}
          ¡Vida normal!, pero con cuidados. Luego de los 10 días, comenzarán a
          caerse las cascaritas. La tinta está más profunda, por lo que si ves
          el resultado muy suave, ¡no te asustes!.. lentamente, el color
          reaparecerá sobre la superficie a medida que la piel nueva siga
          cicatrizando. Espera al menos 4 semanas para ver el resultado final de
          la sesión. Podrás utilizar maquillaje en las cejas con mucho cuidado y
          quitándolo con suavidad, pasados los 10 días.
        </p>

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
                'https://wa.me/5491161592591?text=Hola! Tengo consultas sobre mis cuidados post-tratamiento.',
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
