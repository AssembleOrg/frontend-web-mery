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

export default function LipBlushAftercarePage() {
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
            src='/logo_mg_after_care_lip_blush.svg'
            alt='Lip Blush'
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
          ¡Felicitaciones por tu nuevo servicio!
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Los mejores resultados los obtendrás siguiendo al pie de la letra las
          indicaciones que aquí te detallamos. Esto hará que retenga el color,
          el detalle y la frescura, así que vale la pena.
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

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginTop: '25px',
            marginBottom: '15px',
          }}
        >
          DÍA 1
        </h3>

        <p style={{ marginBottom: '15px' }}>
          Limpiá tus labios con los paños esterilizados de tu kit cada 3 hs, con
          la intención de remover el exceso de linfa y evitar que se formen
          falsas cascaritas.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          La hinchazón no debería durar más de 24 h, no apliques hielo porque
          eso podría producir moretones.
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          Procurá no fumar ni tomar mate durante al menos las 2 horas
          posteriores al tratamiento. Asimismo, recomendamos que no lo hagas
          durante 24 horas para una mayor higiene.
        </p>

        <Separator />

        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginTop: '25px',
            marginBottom: '15px',
          }}
        >
          DÍA 2 – 6
        </h3>

        <p style={{ marginBottom: '15px' }}>
          Sentirás los labios agrietados y tirantes, aplicá el bálsamo de tu kit
          (Aquaphor) de 5 a 6 veces por día. Es normal que los labios se
          resequen entre cada aplicación.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Humectá generosamente tus labios con el bálsamo por las noches. Es una
          buena idea dormir lo más sentada posible, así como también evitar el
          uso de pasta dental al cepillarte durante las 48 horas posteriores al
          procedimiento.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Utiliza un sorbete para ingerir líquidos y evitá los alimentos
          picantes.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          ¡Cuando los labios comiencen a pelarse, no te rasques ni te desprendas
          la piel! Es muy importante que tengas presente que en donde la retires
          el pigmento no fijará. Humectá y deja que cicatrice naturalmente.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Procurá no realizar actividad física durante la primera semana para
          que la cicatrización ocurra manera correcta.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Durante las primeras 4 semanas después del procedimiento, evita usar
          exfoliantes, ácidos, cremas anti-age, etc.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Evitá el vapor, el sol, sumergirte en agua, nadar, utilizar sauna,
          etc., durante los días de cicatrización.
        </p>
        <Separator />

        <p style={{ marginBottom: '15px' }}>
          Podrás utilizar maquillaje en tus labios luego de finalizada la
          cicatrización (10 días aproximadamente).
        </p>
        <Separator />

        <p style={{ marginBottom: '20px' }}>
          Finalizada la cicatrización es indispensable proteger tus labios a
          diario con un SPF 50 o más durante todo el tiempo que tengas
          pigmentación generada a través de un tatuaje cosmético. El no respetar
          este cuidado puede generar la pérdida prematura del servicio
          realizado, así como también la desvirtuación del color. Aprovechamos
          para recordarte que cualquier servicio de tatuaje cosmético en tu
          rostro, haya sido realizado o no por MG & Staff, deberá recibir el
          mismo cuidado.
        </p>
        <Separator />

        <p>El resultado final del color aparecerá luego de 4 semanas.</p>

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
