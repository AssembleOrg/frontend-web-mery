// app/[locale]/terminos-y-condiciones-formaciones-mery-garcia/page.tsx

import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { FileText } from 'lucide-react';

export default function TerminosYCondicionesPage() {
  return (
    <div className='min-h-screen bg-background'>
      <Navigation />

      <div className='container mx-auto px-4 py-16 max-w-4xl'>
        <div className='bg-card p-8 md:p-12 rounded-lg border'>
          {/* Header */}
          <div className='text-center mb-12'>
            <FileText className='w-12 h-12 mx-auto text-[#EBA2A8] mb-4' />
            <h1 className='text-4xl font-primary font-bold text-[#EBA2A8] uppercase mb-4'>
              Términos y Condiciones
            </h1>
            <p className='text-lg text-muted-foreground'>
              Formaciones Mery García
            </p>
          </div>

          {/* Content */}
          <div className='prose prose-sm md:prose-base max-w-none'>
            <div className='space-y-8 text-foreground'>
              {/* Sección 1 */}
              <section>
                <h2 className='text-2xl font-primary font-bold text-[#EBA2A8] uppercase mb-4'>
                  Términos y Condiciones Generales de Uso
                </h2>
                <h3 className='text-xl font-primary font-semibold text-foreground mb-3'>
                  Para el Usuario Final
                </h3>
              </section>

              {/* GENERAL */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  GENERAL
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    Los presentes Términos y Condiciones (en adelante, los
                    &quot;Términos y Condiciones&quot;) regulan la relación entre MERY
                    GARCÍA y Usted como Usuario de los Servicios, entendiéndose
                    el término &quot;Usuario&quot; como toda aquella persona física que
                    participe de los programas ofrecidos por MERY GARCÍA,
                    incluyendo participantes, asistentes, inscriptos, oyentes y
                    entendiéndose el término &quot;Servicio/s&quot; como todo programa,
                    curso, ponencia, exposición ofrecida, tutorial, videos
                    explicativos, archivo pdf, ofrecidos por MERY GARCIA.
                  </p>
                  <p>
                    Al acceder al Servicio y a la plataforma, entendiéndose el
                    término &quot;Plataforma&quot;, como el medio web de acceso a los
                    Servicios, el Usuario se compromete a cumplir y aceptar
                    todos los Términos y Condiciones que aparecen a
                    continuación. El presente documento constituye el
                    instrumento que contemplará los Términos de Uso del
                    Servicio que se aplicarán y resultarán obligatorios para
                    todos los usuarios que adquieran Servicios a MERY GARCIA.
                  </p>
                  <p>
                    Al adquirir los Servicios, el Usuario reconoce haber leído,
                    entendido y aceptado cumplir con todos los términos,
                    condiciones y avisos contenidos en o referidos por estos
                    Términos y Condiciones, los cuales tienen un carácter
                    obligatorio y vinculante, junto con todas las demás
                    políticas y principios que rigen MERY GARCIA y que son
                    incorporados al presente por referencia.
                  </p>
                  <p>
                    La aceptación de los presentes Términos y Condiciones
                    configura el contrato de suscripción entre MERY GARCIA y el
                    Usuario cuya vigencia se extenderá desde la aceptación, por
                    el período de 12 (doce) meses, hasta la baja del perfil de
                    Usuario o hasta que MERY GARCIA ejerza su derecho de
                    terminar el contrato.
                  </p>
                  <p>
                    MERY GARCIA se reserva el derecho, a su sola discreción, de
                    cambiar, añadir, sustituir o retirar los presentes Términos
                    y Condiciones, en cualquier momento. Es responsabilidad del
                    Usuario revisar periódicamente por cambios en estos
                    Términos y Condiciones. El uso continuo de los Servicios
                    después de la publicación de cambios, significará que
                    acepta y está de acuerdo con dichos cambios.
                  </p>
                  <p>
                    Mediante el cumplimiento de estos Términos y Condiciones,
                    MERY GARCIA le concede el uso personal, no comercial, no
                    exclusivo, no transferible y limitado de los Servicios, que
                    será utilizado para acceder a la plataforma virtual,
                    incluyendo acceso al material de cada exposición; acceso al
                    registro de pago de los aranceles; acceso al curso online y
                    a su contenido, todo ello de conformidad con los presentes
                    Términos y Condiciones.
                  </p>
                </div>
              </section>

              {/* 1. DESCRIPCIÓN DE LOS SERVICIOS */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  1. DESCRIPCIÓN DE LOS SERVICIOS. ALCANCE
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <div>
                    <p className='font-semibold mb-2'>
                      1.1 Los Servicios contenidos en la plataforma comprenden:
                    </p>
                    <ul className='list-disc pl-6 space-y-2'>
                      <li>
                        Video explicativos, de creación, autoría y propiedad de
                        Mery Garcia. Los mismos estarán disponibles en línea
                        durante el periodo anteriormente mencionado. No
                        permitiéndose la descarga de los mismos, bajo ninguna
                        circunstancia ni método.
                      </li>
                      <li>
                        PDF descargables, de creación, autoría y propiedad de
                        Mery Garcia.
                      </li>
                    </ul>
                    <p className='mt-2'>
                      Todo esto durante 12 (doce) meses corridos desde la
                      compra de la Formación.
                    </p>
                  </div>
                  <p>
                    <span className='font-semibold'>1.2</span> El examen
                    presencial es opcional y, de ser aprobado, se otorgará una
                    certificación artística, Mery Garcia evaluará las aptitudes
                    y conocimientos adquiridos durante la cursada Online a
                    través de un examen teórico y práctico.
                  </p>
                  <p>
                    <span className='font-semibold'>1.3</span> El examen
                    presencial tiene un valor extra al valor de la capacitación
                    / formación online.
                  </p>
                </div>
              </section>

              {/* 2. REQUISITOS DEL USO */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  2. REQUISITOS DEL USO DE LOS SERVICIOS
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>2.1</span> Podrán utilizar
                    los Servicios todas las personas humanas con capacidad
                    legal para contratar.
                  </p>
                  <p>
                    <span className='font-semibold'>2.2</span> Al utilizar los
                    Servicios el Usuario acepta los presentes Términos y
                    Condiciones.
                  </p>
                  <p>
                    <span className='font-semibold'>2.3</span> El Usuario
                    declara y garantiza que todos los datos personales
                    suministrados en el proceso de registro son verdaderos,
                    completos y se encuentran actualizados.
                  </p>
                  <p>
                    <span className='font-semibold'>2.4</span> Al ingresar, el
                    Usuario deberá acreditar su identidad del modo que indique
                    MERY GARCIA. MERY GARCIA podrá requerir al Usuario que
                    defina un nombre de usuario y contraseña para acceder a los
                    Servicios, en cuyo caso el Usuario deberá evitar que
                    terceras personas puedan acceder a ellas, quedando
                    entendido que cualquier acción realizada en la plataforma
                    mediante el nombre de usuario y contraseña elegidos por el
                    Usuario será imputada a dicho Usuario.
                  </p>
                  <p>
                    <span className='font-semibold'>2.5</span> El acceso a la
                    información del usuario queda restringido al propio usuario
                    mediante el uso de su &quot;palabra clave&quot; o contraseña.
                  </p>
                  <p>
                    <span className='font-semibold'>2.6</span> Será
                    responsabilidad del Usuario mantener actualizada su
                    información personal.
                  </p>
                  <p>
                    <span className='font-semibold'>2.7</span> MERY GARCIA
                    utilizará la información suministrada por el Usuario con la
                    finalidad prevista en estos Términos y Condiciones.
                  </p>
                  <p>
                    <span className='font-semibold'>2.8</span> Para poder
                    utilizar los Servicios se requiere acceso a internet. El
                    Usuario acepta ser el único responsable de cumplir este
                    requisito y de cualquier honorario, cargo o gasto asociado
                    con el uso de Internet y/o cualquier otra comunicación,
                    incluyendo sin limitación, el servicio de mensajes cortos
                    (SMS), correo electrónico y llamada de voz.
                  </p>
                  <p>
                    <span className='font-semibold'>2.9</span> MERY GARCIA
                    podrá rechazar cualquier solicitud de registro o impedir en
                    cualquier momento que un Usuario ingrese a los Servicios
                    cuando tal ingreso pueda poner en riesgo la seguridad de la
                    plataforma y/o el Usuario haya violado los presentes
                    Términos y Condiciones.
                  </p>
                </div>
              </section>

              {/* 3. INSCRIPCIÓN */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  3. INSCRIPCIÓN A LOS SERVICIOS
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>3.1</span> Es
                    responsabilidad del Usuario informarse sobre los Términos y
                    Condiciones del servicio y la utilización de éste. El uso
                    de los Servicios / Capacitaciones / Formaciones que se
                    ofrecen implica su aceptación. MERY GARCIA se reserva el
                    derecho de suspender a un participante si, en su única y
                    exclusiva opinión, no cumple con lo dispuesto por los
                    términos y condiciones y/o comete o es sospechado de
                    cometer alguna actividad que pudiere vulnerar los derechos
                    de MERY GARCIA. El Usuario no tendrá derecho a ningún tipo
                    de acción y/o reclamo en tal sentido, renunciando a través
                    del presente a efectuar los mismos.
                  </p>
                </div>
              </section>

              {/* 4. CUPOS LIMITADOS */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  4. CUPOS LIMITADOS
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>4.1</span> Los cupos a los
                    Servicios son limitados. El cupo al Servicio se confirma y
                    se reserva únicamente habiendo realizado el pago del mismo
                    por cualquiera de los medios habilitados a tal fin. El cupo
                    se cerrará cuando se completen las vacantes del Servicio /
                    Formación / Presencialidad.
                  </p>
                </div>
              </section>

              {/* 5. INFORMACIÓN CONTENIDA */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  5. INFORMACIÓN CONTENIDA EN LA PLATAFORMA
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>5.1</span> Usted declara,
                    garantiza y acepta que ninguna de las imágenes y/o archivos
                    subidos a través de su usuario o que sean publicados,
                    transmitidos o compartidos a través de MERY GARCIA
                    infringirá los derechos de terceros, incluyendo los
                    derechos de autor, marca, privacidad, publicidad u otros
                    derechos personales o de propiedad intelectual; y que no
                    incluirán ningún contenido denigrante, difamatorio o
                    ilegal.
                  </p>
                </div>
              </section>

              {/* 6. UTILIZACIÓN DE LOS SERVICIOS */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  6. UTILIZACIÓN DE LOS SERVICIOS. RESPONSABILIDAD DEL USUARIO
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>6.1</span> El Usuario
                    deberá utilizar la Plataforma de conformidad con las
                    disposiciones establecidas en estos Términos y Condiciones,
                    con el ordenamiento jurídico vigente en la República
                    Argentina y según las pautas de conducta impuestas por la
                    moral, las buenas costumbres y el debido respecto a los
                    derechos de terceros.
                  </p>
                  <p>
                    <span className='font-semibold'>6.2</span> Queda
                    terminantemente prohibido: i) copiar, modificar, adaptar,
                    traducir, realizar ingeniería inversa, descompilar o
                    desensamblar cualquier parte del contenido de los Servicios
                    y/o de la plataforma; ii) hacer uso de contenido en otro
                    sitio web o entorno informático para cualquier propósito
                    sin la autorización previa y por escrito de MERY GARCIA;
                    iv) interferir o interrumpir el funcionamiento de los
                    Servicios y/o de la plataforma; v) vender, licenciar o
                    explotar el contenido de los Servicios y/o cualquier tipo
                    de acceso y/o uso de la Plataforma; vi) utilizar los
                    Servicios y/o la Plataforma con fines ilícitos o inmorales,
                    lesivos de los derechos e intereses de terceros, o que de
                    cualquier forma puedan dañar, inutilizar, sobrecargar o
                    deteriorar los servicios, los equipos informáticos de otros
                    usuarios o de otros usuarios de Internet (hardware y
                    software) así como los documentos, archivos y toda clase de
                    contenidos almacenados en sus equipos informáticos, o
                    impedir la normal utilización o disfrute de dichos
                    Servicios, equipos informáticos y documentos, archivos y
                    contenidos por parte de los demás usuarios y de otros
                    usuarios e vii) infringir de cualquier modo los presentes
                    Términos y Condiciones.
                  </p>
                </div>
              </section>

              {/* 7. CONDICIONES DE USO */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  7. CONDICIONES DE USO
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>7.1</span> MERY GARCIA
                    podrá retirar o suspender, cautelarmente, la prestación del
                    Servicio a aquel Usuario que incumpla lo establecido en
                    estos Términos y Condiciones de Uso de los Servicios,
                    reservándose los derechos legales correspondientes frente a
                    los eventuales daños y perjuicios que dichos
                    incumplimientos le ocasionen.
                  </p>
                </div>
              </section>

              {/* 8. ARCHIVOS DE USUARIO */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  8. ARCHIVOS DE USUARIO. POLÍTICAS DE PRIVACIDAD
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>8.1</span> Usted acepta que
                    al proporcionar o enviar cualquier material, incluyendo
                    datos, fotos, videos o contenidos de texto a MERY GARCIA
                    (en conjunto los &quot;Archivos de Usuario&quot;) por cualquier medio
                    de transmisión, incluyendo pero no limitado a, publicar,
                    cargar, ingresar, proporcionar o enviar cualquiera de los
                    Archivos de Usuario a través del uso de la plataforma,
                    usted entonces está otorgando a MERY GARCIA permiso de usar
                    sus Archivos de Usuario en operaciones en relación con el
                    funcionamiento de su negocio, incluyendo, sin limitación,
                    los derechos a: reproducir, editar, traducir y dar formato
                    a sus Archivos de Usuario dentro de la plataforma y dentro
                    del marco de privacidad el Usuario para un mejor servicio
                    al Usuario.
                  </p>
                  <p>
                    <span className='font-semibold'>8.2</span> Ninguna
                    compensación se pagará con respecto al uso por parte de
                    MERY GARCIA de los Archivos de Usuario, según lo dispuesto
                    en este documento, ni MERY GARCIA estará obligado a
                    publicar o utilizar los Archivos de Usuario.
                  </p>
                </div>
              </section>

              {/* 9. PROTECCIÓN DE DATOS */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  9. PROTECCIÓN DE DATOS PERSONALES, POLÍTICA DE PRIVACIDAD
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>9.1</span> MERY GARCIA
                    cumple con lo establecido en la Ley 25.326 y normativa
                    complementaria (en adelante, la &quot;Normativa de Datos
                    Personales&quot;). A los fines de la política de privacidad
                    prevista en esta cláusula (en adelante &quot;Política de
                    Privacidad&quot;) los términos &quot;datos personales&quot;, &quot;datos
                    sensibles&quot;, &quot;base de datos&quot;, &quot;tratamiento de datos&quot;,
                    &quot;responsable de la base de datos&quot;, &quot;datos informatizados&quot;,
                    &quot;titular de los datos&quot;, &quot;usuario de datos&quot; y &quot;disociación
                    de datos&quot; tendrán el significado asignado por el artículo 2
                    de la Ley de Protección de Datos Personales y Habeas Data
                    Nº 25.326 (en adelante, la &quot;LPDP&quot;).
                  </p>
                  <p>
                    <span className='font-semibold'>9.2</span> En particular,
                    MERY GARCIA cumple con todos los principios que surgen de
                    la Normativa de Protección de Datos Personales, que
                    incluyen pero no se limitan a: i) el principio de
                    legalidad, dado que la base de datos en la que se
                    almacenarán los datos recolectados a través de la
                    Plataforma se encuentra debidamente registrada; ii) el
                    principio de calidad dado que MERY GARCIA únicamente
                    recolecta aquellos datos personales que resultan necesarios
                    y adecuados para la prestación de sus servicios y el uso de
                    la Plataforma, y lo hace por medios leales y respetando la
                    intimidad de los titulares de dichos datos personales; iii)
                    el principio de finalidad, dado que MERY GARCIA utiliza los
                    datos personales recabados únicamente para el fin para el
                    que fueron recolectados; iv) el principio de consentimiento
                    informado, dado que MERY GARCIA recaba el consentimiento de
                    los titulares de los datos personales en forma prescripta
                    por la LPDP siempre que ello resulta necesario por no
                    encontrarse en alguna de las excepciones de dicha norma; y
                    v) los principios de seguridad y confidencialidad de la
                    información, mediante la utilización de tecnología avanzada
                    que permite resguardar adecuadamente –según el estado de la
                    técnica- la confidencialidad y seguridad de la información.
                    Asimismo, para garantizar la seguridad de los datos, MERY
                    GARCIA aplicará los mismos criterios y el mismo grado de
                    diligencia que aplica para resguardar su propia
                    información.
                  </p>
                  <p>
                    <span className='font-semibold'>9.3</span> El Usuario
                    presta su consentimiento expreso para que MERY GARCIA trate
                    los datos personales que el Usuario declare (incluyendo
                    pero sin limitarse al nombre, DNI, CUIT/CUIL, edad,
                    domicilio, antecedentes) como así también información de
                    geolocalización, que la Plataforma recolecte en forma
                    automatizada con el fin de mejorar el alcance de los
                    Servicios.
                  </p>
                  <p>
                    <span className='font-semibold'>9.4</span> Los datos
                    personales que el Usuario suministre a través de la
                    Plataforma, como así también los que la Plataforma
                    recolecte en forma automatizada serán almacenados en una
                    base de datos de titularidad de MERY GARCIA (en adelante,
                    la &quot;Base de Datos&quot;).
                  </p>
                  <p>
                    <span className='font-semibold'>9.5</span> El Usuario podrá
                    ejercer sus derechos de acceso, rectificación, y suspensión
                    de sus datos personales como así también revocar en
                    cualquier momento su consentimiento para el tratamiento de
                    sus datos personales ante la Base de Datos.
                  </p>
                  <p>
                    <span className='font-semibold'>9.6</span> MERY GARCIA se
                    compromete a tomar todos los recaudos que sean necesarios
                    para garantizar la seguridad de los datos personales del
                    Usuario, inclusive la prevención de procesamientos no
                    autorizados o ilegítimos, pérdida accidental, destrucción o
                    daños a dichos datos personales, desistiendo el Usuario
                    expresamente de efectuar cualquier reclamo en este sentido.
                  </p>
                </div>
              </section>

              {/* 10. CONFIDENCIALIDAD */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  10. CONFIDENCIALIDAD
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>10.1</span> El Usuario
                    declara y conoce que los Servicios y la información que se
                    transmita a través de ellos son identificados y
                    considerados de carácter confidencial de MERY GARCIA. En
                    consecuencia, el Usuario se compromete en forma irrevocable
                    a mantener en forma confidencial la Información que reciba
                    de MERY GARCIA bajo este compromiso de confidencialidad (en
                    adelante, el &quot;Compromiso&quot;). Este Compromiso tendrá vigencia
                    desde la fecha de aceptación de los presentes términos y
                    condiciones.
                  </p>
                  <p>
                    <span className='font-semibold'>10.2</span> El término
                    &quot;Información&quot; como se utiliza en el Compromiso comprende la
                    totalidad de la información contenida en la base de datos,
                    suministrada por MERY GARCIA al Usuario con anterioridad o
                    con posterioridad a este Compromiso, cualquiera fuere la
                    modalidad de su formación, almacenamiento, organización o
                    acceso. Asimismo, el término &quot;Información&quot; incluirá todos
                    los datos, listas de clientes, informes, contratos,
                    compilaciones, información estadística, y cualquier
                    material proveniente o producido por MERY GARCIA, sus
                    representantes o terceras personas y que sea compartido por
                    MERY GARCIA con el Usuario.
                  </p>
                  <p>
                    <span className='font-semibold'>10.3</span> El término
                    &quot;Información&quot; no incluye aquella información (i) que ya
                    fuere conocida por el público en general sin que esto se
                    deba al accionar indebido del Usuario o (ii) cuya
                    divulgación haya sido expresamente autorizada por MERY
                    GARCIA. Tampoco incluirá aquella información que haya sido
                    o sea requerida por una autoridad judicial o administrativa
                    con facultades suficientes para ello. En todos los casos,
                    el Usuario será responsable de demostrar sus derechos con
                    respecto a cualquier excepción prevista en la presente
                    cláusula.
                  </p>
                  <p>
                    <span className='font-semibold'>10.4</span> El Usuario
                    garantiza a MERY GARCIA que tratará la Información de modo
                    tal de evitar su adulteración, pérdida, consulta o
                    tratamiento no autorizado, y el Usuario se compromete a
                    conservar la Información en archivos o registros que reúnan
                    las condiciones técnicas necesarias de integridad y
                    seguridad.
                  </p>
                  <p>
                    <span className='font-semibold'>10.5</span> El Usuario no
                    podrá duplicar ni en modo alguno copiar la Información
                    recibida y/o que pudiera recibir de MERY GARCIA y deberá
                    limitarse el uso de la misma para los fines que
                    expresamente indique MERY GARCIA, debiendo luego de su uso
                    restituir a MERY GARCIA la Información recibida y destruir
                    todo registro que pudiera haber quedado de la misma.
                  </p>
                  <p>
                    <span className='font-semibold'>10.6</span> Asimismo, el
                    Usuario se compromete a mantener la confidencialidad de los
                    términos y condiciones del presente Compromiso.
                  </p>
                  <p>
                    <span className='font-semibold'>10.7</span> Las
                    obligaciones de confidencialidad asumidas por el Usuario en
                    este Compromiso mantendrán su vigencia durante todo el
                    tiempo que dure la relación entre el Usuario y MERY GARCIA,
                    así como por un plazo adicional de dos (2) años a partir de
                    la fecha de terminación de la referida relación,
                    independientemente del motivo que llevó a dicha
                    terminación, con hasta un máximo de diez (10) años de
                    suscripto el Compromiso, lo que ocurra primero.
                  </p>
                  <p>
                    <span className='font-semibold'>10.8</span> El
                    incumplimiento total o parcial por parte del Usuario a sus
                    obligaciones previstas en este Compromiso la hará
                    responsable de todos los daños y perjuicios que ello
                    ocasionara a MERY GARCIA.
                  </p>
                </div>
              </section>

              {/* 11. RESPONSABILIDAD */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  11. RESPONSABILIDAD
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>11.1</span> Usted acepta
                    específicamente que ni MERY GARCIA ni sus directores,
                    gerentes, administradores, empleados, agentes, operarios,
                    representantes y apoderados serán responsable por:
                  </p>
                  <ul className='list-disc pl-6 space-y-2'>
                    <li>
                      Acceso no autorizado o alteración de transmisiones o
                      datos, cualquier material o dato enviado o recibido o no
                      enviado o no recibido, o cualquier otra transacción
                      hacia/desde la plataforma.
                    </li>
                    <li>
                      Cualquier contenido amenazador, difamatorio, obsceno,
                      ofensivo o ilegal o cualquier conducta inapropiada o
                      cualquier violación a los derechos de otra persona,
                      incluyendo, sin limitación, los derechos de propiedad
                      intelectual.
                    </li>
                    <li>
                      Cualquier contenido enviado, utilizando los servicios de
                      comunicación y/o incluido en la plataforma por cualquier
                      tercero.
                    </li>
                    <li>
                      Lucro cesante ni por cualquier consecuencia mediata y/o
                      causal, pérdida de datos o información, pérdida de
                      chance, daños punitivos ni de cualquier otra naturaleza
                      derivadas del uso de la Plataforma.
                    </li>
                    <li>
                      Mal funcionamiento, imposibilidad de acceso o malas
                      condiciones de uso de la Plataforma debido al uso de
                      equipos inadecuados, interrupciones relacionadas con
                      proveedores de servicio de internet, la saturación de la
                      red de internet y/o por cualquier otra razón.
                    </li>
                    <li>
                      Ningún daño y/o perjuicio que por cualquier causa
                      –incluyendo el caso fortuito o fuerza mayor- pudiera
                      producirse por el uso de los Servicios y/o la Plataforma,
                      salvo que medie dolo de MERY GARCIA.
                    </li>
                    <li>
                      Ningún daño y/o perjuicio por pérdida de información o
                      datos derivada del uso de los Servicios y/o la
                      Plataforma, salvo que medie dolo de MERY GARCIA.
                    </li>
                    <li>
                      Ningún daño y/o perjuicio que por cualquier causa
                      –incluyendo el caso fortuito o fuerza mayor- pudiera
                      producirse por la relación con los expositores de los
                      Servicios.
                    </li>
                  </ul>
                </div>
              </section>

              {/* 12. INDEMNIDAD */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  12. INDEMNIDAD
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>12.1</span> Usted acepta
                    defender, indemnizar y eximir a MERY GARCIA y a sus
                    empleados, contratistas, funcionarios y directores de todas
                    las responsabilidades, reclamaciones y gastos, incluyendo
                    honorarios razonables de abogados que surjan de su uso o
                    mal uso de los Servicios, incluyendo sin limitación, el
                    incumplimiento de estos Términos y Condiciones, o la
                    violación de los derechos de terceros.
                  </p>
                  <p>
                    <span className='font-semibold'>12.2</span> MERY GARCIA se
                    reserva el derecho, a expensas propias, de asumir la
                    defensa y control exclusivo de cualquier asunto sujeto a
                    indemnización por parte del Usuario, en cuyo caso cooperará
                    con MERY GARCIA para hacer valer cualquier defensa.
                  </p>
                </div>
              </section>

              {/* 13. PROPIEDAD INTELECTUAL */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  13. PROPIEDAD INTELECTUAL
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>13.1</span> Todos los
                    elementos, incluidas las ponencias, exposiciones, imágenes,
                    textos, ilustraciones, íconos, logo e isotipos,
                    fotografías, programas, animaciones, cualquier música,
                    melodía, video clip y cualquier otro elemento que forma
                    parte del Website sólo tiene como destino la
                    comercialización de servicios por parte de MERY GARCIA, y
                    se encuentra prohibida cualquier reproducción, modificación
                    o distribución de los mismos.
                  </p>
                  <p>
                    <span className='font-semibold'>13.2</span> Asimismo, todos
                    los comentarios de terceros que sean publicadas en la
                    Website o que sean emitidos durante la realización de un
                    curso, serán de exclusiva responsabilidad de sus autores,
                    eximiendo éstos de total responsabilidad a MERY GARCIA, y
                    obligándose a mantenerla indemne de toda acción y/o reclamo
                    que pudiera recibir como consecuencia de los mismos. La
                    Plataforma y el contenido de la Plataforma son de
                    titularidad exclusiva de MERY GARCIA y MERY GARCIA tiene la
                    autorización correspondiente para su utilización y
                    licenciamiento. A título meramente enunciativo se
                    entenderán incluidos las imágenes, fotografías, diseños,
                    gráficos, sonidos, compilaciones de datos, marcas, nombre,
                    títulos, designaciones, signos distintivos, y todo otro
                    material accesible a través de la Plataforma.
                  </p>
                  <p>
                    <span className='font-semibold'>13.3</span> MERY GARCIA se
                    reserva todos los derechos sobre la Plataforma y el
                    contenido de la misma, no cede ni transfiere a favor del
                    Usuario ningún derecho sobre su propiedad intelectual.
                  </p>
                  <p>
                    <span className='font-semibold'>13.4</span> Los derechos de
                    propiedad intelectual respecto de los criterios de
                    selección y/o disposición del contenido en la Plataforma
                    corresponden exclusivamente a MERY GARCIA, quedando
                    estrictamente prohibido al Usuario utilizar los contenidos,
                    las categorías y/o cualquier información de la Plataforma
                    con otra finalidad distinta a la indicada en los presentes
                    Términos y Condiciones.
                  </p>
                  <p>
                    <span className='font-semibold'>13.5</span> En el caso de
                    que la Plataforma permita descargar contenido para su
                    posterior lectura por el Usuario, MERY GARCIA otorga al
                    Usuario una licencia de uso gratuita, no transferible, no
                    exclusiva y para uso estrictamente personal.
                  </p>
                </div>
              </section>

              {/* 14. OPERATIVIDAD */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  14. OPERATIVIDAD DE LA PLATAFORMA
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>14.1</span> MERY GARCIA no
                    garantiza el pleno acceso y operatividad de la Plataforma
                    en forma ininterrumpida.
                  </p>
                  <p>
                    <span className='font-semibold'>14.2</span> MERY GARCIA
                    podrá suspender el acceso a la Plataforma y/o a determinado
                    contenido por motivos de mantenimiento o de seguridad en
                    cualquier momento.
                  </p>
                  <p>
                    <span className='font-semibold'>14.3</span> MERY GARCIA no
                    será responsable por la existencia de eventuales
                    dificultades técnicas o fallas en los sistemas o en
                    internet y/o indisponibilidad del servicio.
                  </p>
                </div>
              </section>

              {/* 15. NOTIFICACIONES */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  15. NOTIFICACIONES Y COMUNICACIONES
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>15.1</span> Se considerarán
                    eficaces las comunicaciones que consistan en avisos y
                    mensajes insertos en la Plataforma que tengan por finalidad
                    informar al Usuario sobre circunstancias relacionadas con
                    el uso de la Plataforma y/o estos Términos y Condiciones.
                  </p>
                </div>
              </section>

              {/* 16. CESIÓN */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  16. CESIÓN
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>16.1</span> Estos Términos
                    y Condiciones, así como los derechos y obligaciones, no
                    podrán ser cedidos por usted, ni en su totalidad ni en
                    parte, sin el previo consentimiento de MERY GARCIA y
                    cualquier intento de hacerlo sin dicho consentimiento será
                    nulo y sin efecto, y se considerará un incumplimiento
                    sustancial de los Términos y Condiciones. MERY GARCIA podrá
                    ceder, en su totalidad o en parte, a su entera discreción,
                    cualquier derecho y obligación a un afiliado o a un
                    tercero.
                  </p>
                </div>
              </section>

              {/* 17. INTERPRETACIÓN */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  17. INTERPRETACIÓN
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>17.1</span> Los
                    encabezados de estos Términos y Condiciones han sido
                    insertados únicamente para facilitar la consulta, y no
                    deben modificar de ninguna manera el significado o el
                    alcance de las disposiciones del presente. Cuando sea
                    apropiado, el número singular que aquí se establece, se
                    interpretará como el número plural, y el género se
                    interpretará como masculino, femenino o neutro, según dicte
                    el contexto.
                  </p>
                </div>
              </section>

              {/* 18. RENUNCIA */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  18. RENUNCIA
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>18.1</span> Bajo ninguna
                    circunstancia se considerará que el incumplimiento,
                    negligencia o tardanza de MERY GARCIA en relación con el
                    ejercicio de un derecho o recurso previsto en los Términos
                    y Condiciones, constituye una renuncia a dicho derecho o
                    recurso. Todos los derechos establecidos en este documento
                    serán acumulativos y no alternativos. La renuncia a un
                    derecho no se interpretará como la renuncia a cualquier
                    otro derecho.
                  </p>
                </div>
              </section>

              {/* 19. LEGISLACIÓN */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  19. LEGISLACIÓN APLICABLE Y JURISDICCIÓN
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>19.1</span> Estos Términos
                    y Condiciones, los Servicios y la Plataforma se rigen por
                    la legislación vigente en la República Argentina y deberán
                    ser interpretados de acuerdo con ella.
                  </p>
                  <p>
                    <span className='font-semibold'>19.2</span> El Usuario se
                    somete a todos los efectos judiciales y extrajudiciales a
                    la jurisdicción de los Tribunales Nacionales de la Ciudad
                    Autónoma de Buenos Aires, renunciando expresamente a
                    cualquier otro fuero o jurisdicción que pudiera
                    corresponder.
                  </p>
                </div>
              </section>

              {/* 20. ACUERDO */}
              <section>
                <h3 className='text-xl font-primary font-semibold text-[#EBA2A8] mb-3'>
                  20. ACUERDO
                </h3>
                <div className='space-y-4 text-foreground leading-relaxed'>
                  <p>
                    <span className='font-semibold'>20.1</span> Estos Términos
                    y Condiciones constituyen el acuerdo completo de todas las
                    partes con respecto a sus obligaciones respectivas en
                    relación con los Servicios.
                  </p>
                  <p>
                    <span className='font-semibold'>20.2</span> Si toda o parte
                    de cualquier sección, párrafo o disposición de los Términos
                    y Condiciones se considera inválida o no ejecutable, no
                    tendrá ningún efecto en ninguna otra sección, párrafo o
                    disposición de los Términos y Condiciones, ni en el resto
                    de dicho artículo, párrafo o disposición, a menos que se
                    disponga expresamente lo contrario.
                  </p>
                </div>
              </section>

              {/* Footer del documento */}
              <div className='mt-12 pt-8 border-t border-border text-center'>
                <p className='text-sm text-muted-foreground'>
                  Al registrarte en la plataforma, aceptas estos términos y
                  condiciones.
                </p>
                <p className='text-sm text-muted-foreground mt-2'>
                  © {new Date().getFullYear()} Mery García. Todos los derechos
                  reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
