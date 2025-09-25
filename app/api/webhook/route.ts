import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  console.log('Webhook de Mercado Pago recibido!');

  try {
    const body = await request.json();
    if (body.type === 'payment') {
      const paymentId = body.data.id;

      console.log(`Procesando notificación para el pago ID: ${paymentId}`);

      const payment = await new Payment(client).get({ id: paymentId });

      //payment logic
      if (payment.status === 'approved') {
        console.log(`¡Pago APROBADO! ID: ${payment.id}`);

        const userEmail = payment.payer?.email;
        const purchasedItems = payment.additional_info?.items;

        console.log(`Email del comprador: ${userEmail}`);
        console.log('Items comprados:', purchasedItems);

        //
        // Ejemplo cuando este Vimeo:
        // const ordenYaExiste = await tuBaseDeDatos.findOrdenById(payment.id);
        // if (ordenYaExiste) {
        //   console.log("Esta orden ya fue procesada. Ignorando.");
        //   return NextResponse.json({ received: true }, { status: 200 });
        // }

        // - Marca la orden como pagada.
        // - Otorga acceso a los cursos al usuario con el email 'userEmail'.
        // Ejemplo conceptual:
        // await tuBaseDeDatos.otorgarAccesoACursos(userEmail, purchasedItems);

        // 4. ENVIAR UN EMAIL DE CONFIRMACIÓN
        // (Usando un servicio como Resend, SendGrid, etc.)
        // await enviarEmailDeConfirmacion(userEmail, purchasedItems);
      } else {
        console.log(`Estado del pago no aprobado: ${payment.status}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error al procesar el webhook de Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
