/**
 * MercadoPago Webhook Handler
 * 
 * NOTE: This webhook should ideally be handled by the backend API
 * to create CategoryPurchase records directly in the database.
 * 
 * However, if needed on frontend for specific reasons, this proxies
 * the webhook data to the backend for processing.
 * 
 * Backend should handle:
 * - Payment verification
 * - Creating CategoryPurchase records
 * - Granting user access to purchased categories
 * 
 * See api.md for CategoryPurchase model documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = await new Payment(client).get({ id: paymentId });

      if (payment.status === 'approved') {
        // Forward to backend API to create CategoryPurchase
        // Backend should have POST /purchases/mercadopago-webhook endpoint
        try {
          const backendResponse = await fetch(`${BACKEND_API_URL}/purchases/mercadopago-webhook`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentId: payment.id,
              userEmail: payment.metadata?.user_email,
              items: payment.additional_info?.items,
              amount: payment.transaction_amount,
              currency: payment.currency_id,
              status: payment.status,
              transactionId: payment.id?.toString(),
            }),
          });

          if (!backendResponse.ok) {
            console.error('[Webhook] Backend processing failed:', await backendResponse.text());
          }
        } catch (backendError) {
          console.error('[Webhook] Error forwarding to backend:', backendError);
          // Continue - don't fail webhook if backend is down
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
