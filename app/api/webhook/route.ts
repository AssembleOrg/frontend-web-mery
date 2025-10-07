import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { grantCourseAccess } from '@/lib/api-server';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = await new Payment(client).get({ id: paymentId });

      if (payment.status === 'approved') {
        const userEmail = payment.metadata?.user_email as string | undefined;
        const purchasedItems = payment.additional_info?.items;

        if (userEmail && purchasedItems && purchasedItems.length > 0) {
          const courseIds = purchasedItems.map((item) => item.id!);
          await grantCourseAccess(userEmail, courseIds);
        } else {
          console.error('[Webhook] Missing user_email or items in approved payment', {
            paymentId: payment.id,
            hasEmail: !!userEmail,
            itemsCount: purchasedItems?.length || 0
          });
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('[Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
