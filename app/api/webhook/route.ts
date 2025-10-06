// File: app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { grantCourseAccess } from '@/lib/api-server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  console.log('--- Webhook de Mercado Pago Recibido ---');

  try {
    const body = await request.json();

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = await new Payment(client).get({ id: paymentId });

      if (payment.status === 'approved') {
        console.log(`[Webhook] ¡PAGO APROBADO! ID: ${payment.id}`);

        // Get user email from metadata (set in create-preference)
        const userEmail = payment.metadata?.user_email as string | undefined;
        const purchasedItems = payment.additional_info?.items;

        if (userEmail && purchasedItems && purchasedItems.length > 0) {
          const courseIds = purchasedItems.map((item) => item.id!);

          console.log(
            `[Webhook] Llamando a la lógica de negocio para ${userEmail} con los cursos:`,
            courseIds
          );
          //damos access:
          await grantCourseAccess(userEmail, courseIds);
        } else {
          console.warn(
            '[Webhook] Pago aprobado pero sin email o items para procesar.'
          );
          if (!userEmail) {
            console.error('[Webhook] No se encontró user_email en metadata');
          }
        }
      } else {
        console.log(`[Webhook] Estado del pago no aprobado: ${payment.status}`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Error al procesar el webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
