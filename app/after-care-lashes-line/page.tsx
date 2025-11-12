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

export default function LashesLineAftercarePage() {
  return (
    <div style={{ backgroundColor: 'var(--mg-pink-lighter)', minHeight: '100vh' }}>
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
          src="/mery-garcia-aftercare.svg"
          alt="Mery García Aftercare"
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
        id="content"
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
            src="/logo_mg_after_care_lashes_line-1.svg"
            alt="Lashes Line"
            width={300}
            height={150}
            style={{ animation: 'fadeIn 0.8s ease-in forwards' }}
          />
        </div>

        {/* Contenido */}
        <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
          ¡Felicitaciones por tu nuevo servicio!
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Los mejores resultados los obtendrás siguiendo al pie de la letra las indicaciones que aquí te detallamos. Esto hará que tu servicio retenga el color, el detalle y la frescura, así que vale la pena.
        </p>
        <Separator />

        <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
          ¡Vos podés hacerlo!
        </p>
        <Separator />

        <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>
          Y así es cómo…
        </p>
        <Separator />

        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          Día del procedimiento:
        </h3>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          No podrás tener colocados lentes de contacto durante el proceso. Podrás volver a utilizarlos 24 horas después del procedimiento.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Deberás suspender el uso de gotas lubricantes durante las 24 horas posteriores al procedimiento.
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          Limpiá tus ojos gentilmente por la noche con 1 paño esterilizado del kit de cuidados.
        </p>

        <Separator />

        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          DÍA 2 a 6:
        </h3>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Limpiá tus ojos gentilmente por la mañana y por la noche, durante 5 días, con los paños esterilizados del kit de cuidados.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Evita mojarte y tocarte los ojos por los primeros 7 días. No te rasques ni te saques ninguna cascarita, debes esperar que cicatricen orgánicamente, estas se caerán solas con el pasar de los días.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          No apliques cremas ni maquillaje en la zona (mascara de pestañas, sombra, delineador) durante 10 días. Luego de estos 10 días utilizá una máscara de pestañas nueva, sin uso previo.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          No apliques ningún serum de pestañas durante los primeros 60 días luego del procedimiento.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Es normal que haya una leve descamación, no te toques ni te alarmes! es parte del proceso de cicatrización.
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          La hinchazón bajará luego de 48hs
        </p>

        <Separator />

        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
          IMPORTANTE:
        </h3>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Un poco de hinchazón es normal inmediatamente después de realizar el procedimiento, y los siguientes días. A menos que tengas la zona extremadamente sensible, esta inflamación no debería interferir con tus actividades diarias.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          En caso de necesitar utilizar gotas lubricantes, podés reanudar su uso luego de 24 hs, teniendo presente de secar la zona de los parpados para evitar humedad sobre el área tratada.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Tu servicio de lashes line parecerá mas suave luego de que la descamación se complete. no te preocupes! es momentáneo.
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          Luego de 30 días, el color se intensificará.
        </p>

        {/* Contacto */}
        <Separator />
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
            CONTACTO
          </h3>
          <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>MERY GARCÍA OFFICE</p>
          <p style={{ marginBottom: '5px' }}>Av. Melián 3646 PB 1, C1430EYZ</p>
          <p style={{ marginBottom: '10px' }}>Buenos Aires</p>

          <p style={{ marginBottom: '1px', fontWeight: 'bold' }}>Horario:</p>
          <p style={{ marginBottom: '1px' }}>Martes a sábados</p>
          <p style={{ marginBottom: '20px' }}>de 10 a 18 h</p>

          <p style={{ fontSize: '12px', marginBottom: '20px', fontStyle: 'italic' }}>
            Si algo no sucediera de la forma indicada en la consulta o en la información detallada anteriormente, no dudes en consultarnos.
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
            title="Enviar mensaje por WhatsApp"
          >
            <FaWhatsapp style={{ width: '40px', height: '40px', color: '#545454' }} />
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
            onClick={() => window.open('https://merygarciabooking.com/', '_blank')}
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
